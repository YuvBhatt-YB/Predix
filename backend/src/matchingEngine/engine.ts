import { depthAddedEventType, depthUpdatedEventType, marketBroadcastEventType, Order, TradeExecutedEventType } from "../types/Trade";
import Redis from "ioredis";

import prisma from "../prisma";
import { OrderOutcome } from "@prisma/client";

export const matchOrder = async (
    order: Order,
    marketId: string,
    orderBook: Redis,
) => {
    try {
        const { type, remainingQuantity, outcome, orderType,marketId } = order;
        const opp = type === "BUY" ? "SELL" : "BUY";
        const currKey = `ORDERBOOK:${marketId}:${outcome}:${type}`;
        const oppKey = `ORDERBOOK:${marketId}:${outcome}:${opp}`;
        let remainingQty = remainingQuantity;
        let trades = []
        let depthLevelUpdates = new Map<string,depthUpdatedEventType>()
        let depthLevelAdded: depthAddedEventType[] = []
        if(orderType === "LIMIT"){
            await addOrderToRedisQueue(order, orderBook, currKey);
            await addAndUpdatePriceDepth(marketId,outcome,type,order,orderBook,depthLevelAdded);
        }
        while (remainingQty > 0) {
            // console.log(remainingQty);
            
            // console.log(currKey);
            // console.log(oppKey);

            const oppOrderList = await orderBook.zrevrange(oppKey, 0, 0);
            if (!oppOrderList || oppOrderList.length === 0) {
                break;
            }

            const oppOrderId = oppOrderList[0];
            if (!oppOrderId) return;
            const oppOrderRaw: Record<string, string> = await orderBook.hgetall(
                `Order:${oppOrderId}`,
            );
            const oppOrder = parseRedisOrder(oppOrderRaw);
            // console.log(oppOrder);
            const matchable =
                type === "BUY"
                    ? order.price >= oppOrder.price
                    : order.price <= oppOrder.price;
            console.log(matchable);
            if (orderType === "LIMIT" && !matchable) {
                break;
            }
            const fillQuantity = Math.min(
                remainingQty,
                oppOrder.remainingQuantity,
            );
            // console.log(fillQuantity);
            await executeTrade(
                order,
                oppOrder,
                fillQuantity,
                remainingQty,
                type,
                outcome as OrderOutcome,
                orderType
            );
            await redisOrderBookUpdate(
                orderType === "LIMIT" ?order : null,
                oppOrder,
                currKey,
                oppKey,
                orderType,
                fillQuantity,
                remainingQty,
                orderBook,
            );
            const tradeEvent: TradeExecutedEventType = {
                broadcastEventType: marketBroadcastEventType.TRADE_EXECUTED,
                marketId:order.marketId,
                price:oppOrder.price,
                quantity:fillQuantity,
                side:order.type,
                dateTime:new Date()
            }
            trades.push(tradeEvent)
            await priceDepthUpdatePerOrder(orderType === "LIMIT" ? order:null,oppOrder,marketId,fillQuantity,depthLevelUpdates,orderBook)
            remainingQty -= fillQuantity;
            console.log(remainingQty);
        }
        // console.log(`Depth level added events for order ${order.id}:`, depthLevelAdded);
        // console.log(`Trades executed for order ${order.id}:`, trades);
        // console.log(`Depth updates for order ${order.id}:`, depthLevelUpdates);

        if(orderType === "MARKET" && remainingQty === remainingQuantity){
            await handleMarketOrderTermination(order,remainingQty)
        }
        const streamPipeline = orderBook.pipeline()
        let shouldTriggerLP = false
        if(depthLevelAdded.length > 0){
            shouldTriggerLP = true
            for(const level of depthLevelAdded){
                streamPipeline.xadd(`MarketDataStream`,"*","priceLevelAdded",JSON.stringify(level))
            }
        }
        if(trades.length > 0){
            shouldTriggerLP = true
            for(const trade of trades){
                streamPipeline.xadd(`MarketDataStream`,"*","tradeExecuted",JSON.stringify(trade))
            }
        }
        if(depthLevelUpdates.size > 0){
            shouldTriggerLP = true
            for(const update of depthLevelUpdates.values()){
                streamPipeline.xadd(`MarketDataStream`,"*","priceLevelUpdated",JSON.stringify(update))
            }
        }
        await streamPipeline.exec()
        if(shouldTriggerLP){
            await orderBook.publish("LP_TRIGGER",marketId)
        }
    } catch (error) {
        console.log(error);
    }
};
const handleMarketOrderTermination = async(order: Order,remainingQty:number) => {
    await prisma.$transaction(async(tx)=>{
        await tx.order.update({
            where:{id:order.id},
            data:{
                status:"FILLED",
                remainingQuantity:0
            }
        })

        await tx.wallet.update({
            where:{userID:order.userId},
            data:{
                locked:{decrement:order.price * remainingQty},
                balance:{increment:order.price * remainingQty}
            }
        })
    })
}
const priceDepthUpdatePerOrder = async(order:Order|null,oppOrder:Order,marketId:string,fillQuantity:number,depthLevelUpdates:Map<string,depthUpdatedEventType>,orderBook:Redis) => {
    if(order){
        const newPriceQty = await orderBook.hincrby(`Depth:${marketId}:${order.outcome}:${order.type}`,order.price.toString(),-fillQuantity)
        if(newPriceQty > 0){
            const priceKey = `${marketId}:${order.outcome}:${order.type}:${order.price}`
            const priceDepthEvent: depthUpdatedEventType = {
                broadcastEventType: marketBroadcastEventType.DEPTH_UPDATED,
                marketId: marketId,
                type: order.type,
                outcome: order.outcome,
                quantity: newPriceQty,
                price: order.price
            }
            depthLevelUpdates.set(priceKey,priceDepthEvent)
        }else{
            const priceKey = `${marketId}:${order.outcome}:${order.type}:${order.price}`
            const priceDepthEvent: depthUpdatedEventType = {
                broadcastEventType: marketBroadcastEventType.DEPTH_UPDATED,
                marketId: marketId,
                type: order.type,
                outcome: order.outcome,
                quantity: 0,
                price: order.price
            }
            depthLevelUpdates.set(priceKey,priceDepthEvent)
            await orderBook.hdel(`Depth:${marketId}:${order.outcome}:${order.type}`,order.price.toString())
        }

        if(newPriceQty < 0){
            console.error("Price level quantity went negative for order ",order.id)
        }
    }
    const newOppOrderPriceQty = await orderBook.hincrby(`Depth:${marketId}:${oppOrder.outcome}:${oppOrder.type}`,oppOrder.price.toString(),-fillQuantity)
    if(newOppOrderPriceQty > 0){
        const priceKey = `${marketId}:${oppOrder.outcome}:${oppOrder.type}:${oppOrder.price}`
        const priceDepthEvent: depthUpdatedEventType = {
            broadcastEventType: marketBroadcastEventType.DEPTH_UPDATED,
            marketId: marketId,
            type: oppOrder.type,
            outcome: oppOrder.outcome,
            quantity: newOppOrderPriceQty,
            price: oppOrder.price
        }
        depthLevelUpdates.set(priceKey,priceDepthEvent)
    }else{
        const priceKey = `${marketId}:${oppOrder.outcome}:${oppOrder.type}:${oppOrder.price}`
        const priceDepthEvent: depthUpdatedEventType = {
            broadcastEventType: marketBroadcastEventType.DEPTH_UPDATED,
            marketId: marketId,
            type: oppOrder.type,
            outcome: oppOrder.outcome,
            quantity: 0,
            price: oppOrder.price
        }
        depthLevelUpdates.set(priceKey,priceDepthEvent)
        await orderBook.hdel(`Depth:${marketId}:${oppOrder.outcome}:${oppOrder.type}`,oppOrder.price.toString())
    }
    if(newOppOrderPriceQty < 0){
        console.error("Price level quantity went negative for order ",oppOrder.id)
    }
}
const addAndUpdatePriceDepth = async(marketId:string,outcome:string,type:string,order:Order,orderBook:Redis,depthLevelAdded: depthAddedEventType[]) => {
    const depthPriceLevelExists = await orderBook.hexists(`Depth:${marketId}:${outcome}:${type}`,order.price.toString())
    if(depthPriceLevelExists === 0){
        await orderBook.hset(`Depth:${marketId}:${outcome}:${type}`,order.price.toString(),order.remainingQuantity.toString())
        const depthAddedEvent: depthAddedEventType = {
            broadcastEventType: marketBroadcastEventType.DEPTH_ADDED,
            marketId: marketId,
            type: type,
            outcome: outcome,
            quantity: order.remainingQuantity,
            price: order.price
        }
        depthLevelAdded.push(depthAddedEvent)
    }else{
        const newQty = await orderBook.hincrby(`Depth:${marketId}:${outcome}:${type}`,order.price.toString(),order.remainingQuantity)
        const depthAddedEvent: depthAddedEventType = {
            broadcastEventType: marketBroadcastEventType.DEPTH_ADDED,
            marketId: marketId,
            type: type,
            outcome: outcome,
            quantity: newQty,
            price: order.price
        }
        depthLevelAdded.push(depthAddedEvent)
    }
}
const executeTrade = async (
    order: Order,
    oppOrder: Order,
    fillQuantity: number,
    remainingQuantity: number,
    type: string,
    outcome: OrderOutcome,
    orderType:string
) => {
    await prisma.$transaction(async (tx) => {
        const execPrice = oppOrder.price;
        const buyerId = type === "BUY" ? order.userId : oppOrder.userId;
        const sellerId = type === "SELL" ? order.userId : oppOrder.userId;
        const oppOutcome = outcome === "YES" ? "NO" : "YES"
        await tx.trade.create({
            data: {
                marketId: order.marketId,
                buyOrderId: type === "BUY" ? order.id : oppOrder.id,
                sellOrderId: type === "SELL" ? order.id : oppOrder.id,
                buyerId: type === "BUY" ? order.userId : oppOrder.userId,
                sellerId: type === "SELL" ? order.userId : oppOrder.userId,
                outcome: outcome,
                price: oppOrder.price,
                quantity: fillQuantity,
            },
        });

        await tx.order.update({
            where: { id: order.id },
            data: {
                status:
                    orderType === "MARKET" || remainingQuantity - fillQuantity === 0
                        ? "FILLED"
                        : "PARTIAL",
                remainingQuantity: { decrement: fillQuantity },
            },
        });

        await tx.order.update({
            where: { id: oppOrder.id },
            data: {
                status:
                    oppOrder.remainingQuantity - fillQuantity === 0
                        ? "FILLED"
                        : "PARTIAL",
                remainingQuantity: { decrement: fillQuantity },
            },
        });
        const lockedPrice = order.price
        const lockAmount = lockedPrice * fillQuantity;
        const actualCost = execPrice * fillQuantity;
        const refund = lockAmount - actualCost;

        //buyer
        const existingHoldings = await tx.holdings.findUnique({
            where: {
                userId_marketId_outcome: { userId: buyerId, marketId: order.marketId, outcome: outcome },
            },
        });
        const buyerOppExistingHoldings = await tx.holdings.findUnique({
            where: {
                userId_marketId_outcome: { userId: buyerId, marketId: order.marketId, outcome: oppOutcome },
            },
        });

        if (existingHoldings) {
            const newAvg =
                (existingHoldings.shares * existingHoldings.avgPrice +
                    fillQuantity * execPrice) /
                (existingHoldings.shares + fillQuantity);
            await tx.holdings.update({
                where: { id: existingHoldings.id },
                data: {
                    shares: { increment: fillQuantity },
                    avgPrice: newAvg,
                },
            });
        } else {
            await tx.holdings.create({
                data: {
                    userId: buyerId,
                    marketId: order.marketId,
                    shares: fillQuantity,
                    avgPrice: execPrice,
                    outcome:outcome
                },
            });
        }
        if(buyerOppExistingHoldings){
            await tx.holdings.update({
                where: { id: buyerOppExistingHoldings.id },
                data: { shares: { decrement: fillQuantity } },
            }); 
        }else{
            await tx.holdings.create({
                data: {
                    userId: buyerId,
                    marketId: order.marketId,
                    shares: -fillQuantity,
                    avgPrice: 1-execPrice,
                    outcome:oppOutcome
                }
            })
        }
        await tx.wallet.update({
            where: { userID: buyerId },
            data: {
                locked: { decrement: lockAmount },
                balance: { increment: refund },
            },
        });
        //seller
        await tx.wallet.update({
            where: { userID: sellerId },
            data: {
                balance: { increment: actualCost },
            },
        });
        await tx.holdings.update({
            where: {
                userId_marketId_outcome: { userId: sellerId, marketId: order.marketId,outcome: outcome },
            },
            data: {
                lockedShares: { decrement: fillQuantity },
            },
        });
        const sellerOppExistingHoldings = await tx.holdings.findUnique({
            where: {
                userId_marketId_outcome: { userId: sellerId, marketId: order.marketId, outcome: oppOutcome },
            },
        });
        if(sellerOppExistingHoldings){
            await tx.holdings.update({
                where: { id: sellerOppExistingHoldings.id },
                data: { shares: { increment: fillQuantity } },
            }); 
        }else{
            await tx.holdings.create({
                data: {
                    userId: sellerId,
                    marketId: order.marketId,
                    shares: fillQuantity,
                    avgPrice: 1-execPrice,
                    outcome:oppOutcome
                }
            })
        }
    });
};

const redisOrderBookUpdate = async (
    order: Order | null,
    oppOrder: Order,
    currKey: string,
    oppKey: string,
    orderType: string,
    fillQuantity: number,
    remainingQty: number,
    orderBook: Redis,
) => {
    if (order) {
        const orderRemaining = remainingQty - fillQuantity;
        if (orderRemaining > 0) {
            await orderBook.hset(`Order:${order.id}`, "status", "PARTIAL");
            await orderBook.hset(
                `Order:${order.id}`,
                "remainingQuantity",
                orderRemaining,
            );
        } else {
            await orderBook.del(`Order:${order.id}`);
            await orderBook.zrem(currKey, order.id);
        }
    }
    const oppRemaining = oppOrder.remainingQuantity - fillQuantity;
    if (oppRemaining > 0) {
        await orderBook.hset(`Order:${oppOrder.id}`, "status", "PARTIAL");
        await orderBook.hset(
            `Order:${oppOrder.id}`,
            "remainingQuantity",
            oppRemaining,
        );
    } else {
        await orderBook.del(`Order:${oppOrder.id}`);
        await orderBook.zrem(oppKey, oppOrder.id);
    }
};

const addOrderToRedisQueue = async (
    order: Order,
    orderBook: Redis,
    currKey: string,
) => {
    const time = new Date(order.createdAt).getTime();
    const priceMultiplier: number = 1_000_000_000_000;
    const score =
        order.type === "BUY"
            ? order.price * priceMultiplier + (priceMultiplier - time)
            : -order.price * priceMultiplier + (priceMultiplier - time);
    const hashExists = await orderBook.hexists(`Order:${order.id}`, "id");
    if (hashExists === 0) {
        await orderBook.hset(`Order:${order.id}`, order);
        await orderBook.zadd(currKey, score, order.id);
    }
};

export const parseRedisOrder = (raw: Record<string, string>): Order => {
    if (!raw.id) throw new Error("Redis Order missing ID");
    if (!raw.userId) throw new Error("Redis Order missing User ID");
    if (!raw.marketId) throw new Error("Redis Order missing Market ID");
    if (!raw.type) throw new Error("Redis Order missing Order Side");
    if (!raw.orderType) throw new Error("Redis Order missing Order OrderType");
    if (!raw.outcome) throw new Error("Redis Order missing Order Outcome");
    if (!raw.quantity) throw new Error("Redis Order missing Order Quantity");
    if (!raw.remainingQuantity)
        throw new Error("Redis Order missing Order Remaining Quantity");
    if (!raw.price) throw new Error("Redis Order missing Order Price");
    if (!raw.status) throw new Error("Redis Order missing Order Status");
    if (!raw.createdAt) throw new Error("Redis Order missing Order Created At");
    return {
        id: raw.id,
        userId: raw.userId,
        marketId: raw.marketId,
        type: raw.type,
        orderType: raw.orderType,
        outcome: raw.outcome,
        quantity: Number(raw.quantity),
        remainingQuantity: Number(raw.remainingQuantity),
        price: Number(raw.price),
        status: raw.status,
        createdAt: raw.createdAt,
    };
};
