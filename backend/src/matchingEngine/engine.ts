import { depthAddedEventType, depthUpdatedEventType, marketBroadcastEventType, marketUpdateEventType, Order, TradeExecutedEventType } from "../types/Trade";
import Redis from "ioredis";

import prisma from "../prisma";
import { OrderOutcome } from "@prisma/client";
import { BADFLAGS } from "dns";

const EPSILON = 0.000001
export const roundMoney = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};
const normalizeQty = (value:number) => {
    return Math.abs(value) < EPSILON ? 0 : Number(value.toFixed(2));
}

const canMatchAtPrice = (incomingOrder: Order, restingOrder: Order) => {
  if (incomingOrder.type === "BUY") {
    return restingOrder.price <= incomingOrder.price + EPSILON;
  }

  if (incomingOrder.type === "SELL") {
    return restingOrder.price >= incomingOrder.price - EPSILON;
  }

  return false;
};
export const matchOrder = async (
    order: Order,
    marketId: string,
    orderBook: Redis,
) => {
    try {
        const { type, remainingQuantity, outcome, orderType } = order;
        const opp = type === "BUY" ? "SELL" : "BUY";
        const currKey = `ORDERBOOK:${marketId}:${outcome}:${type}`;
        const oppKey = `ORDERBOOK:${marketId}:${outcome}:${opp}`;
        let remainingQty = normalizeQty(remainingQuantity);
        let actualSpent = 0
        let trades = []
        let depthLevelUpdates = new Map<string,depthUpdatedEventType>()
        let depthLevelAdded: depthAddedEventType[] = []
        let currentVolume = Number(await orderBook.get(`MARKET_VOLUME:${marketId}`) || 0)
        if(orderType === "LIMIT"){
            await addOrderToRedisQueue(order, orderBook, currKey);
            await addAndUpdatePriceDepth(marketId,outcome,type,order,orderBook,depthLevelAdded);
        }
        while (remainingQty > EPSILON) {
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
            if(!oppOrderRaw || Object.keys(oppOrderRaw).length === 0){
                await orderBook.zrem(oppKey,oppOrderId)
                continue
            }

            let oppOrder: Order
            try{
                oppOrder = parseRedisOrder(oppOrderRaw);
            }catch(error){
                await orderBook.zrem(oppKey,oppOrderId)
                continue
            }

            if(oppOrder.remainingQuantity <= EPSILON || !["OPEN","PARTIAL"].includes(oppOrder.status)){
                await orderBook.zrem(oppKey,oppOrderId)
                continue
            }
            // console.log(oppOrder);
           if(!canMatchAtPrice(order,oppOrder)){
            break
           }
            const fillQuantity = Math.min(
                remainingQty,
                oppOrder.remainingQuantity,
            );
            if(fillQuantity <= EPSILON){
                break
            }
            const remainingBeforeFill = remainingQty
            const remainingAfterFill = normalizeQty(remainingQty - fillQuantity)
            const fillCost = roundMoney(oppOrder.price * fillQuantity)
            // console.log(fillQuantity);
            await executeTrade(
                order,
                oppOrder,
                fillQuantity,
                remainingBeforeFill,
                type,
                outcome as OrderOutcome,
                orderType,
                orderBook
            );
            actualSpent = roundMoney(actualSpent + fillCost)

            const tradeValue = oppOrder.price * fillQuantity

            currentVolume+=tradeValue

            await orderBook.incrbyfloat(`MARKET_VOLUME:${marketId}`,tradeValue)

            await redisOrderBookUpdate(
                orderType === "LIMIT" ?order : null,
                oppOrder,
                currKey,
                oppKey,
                orderType,
                fillQuantity,
                remainingBeforeFill,
                orderBook,
            );
            const tradeEvent: TradeExecutedEventType = {
                broadcastEventType: marketBroadcastEventType.TRADE_EXECUTED,
                marketId:order.marketId,
                outcome:outcome as OrderOutcome,
                price:oppOrder.price,
                quantity:fillQuantity,
                side:order.type,
                dateTime:new Date()
            }
            trades.push(tradeEvent)
            await priceDepthUpdatePerOrder(orderType === "LIMIT" ? order:null,oppOrder,marketId,fillQuantity,depthLevelUpdates,orderBook)
            remainingQty = remainingAfterFill;
            console.log(remainingQty);
        }
        // console.log(`Depth level added events for order ${order.id}:`, depthLevelAdded);
        // console.log(`Trades executed for order ${order.id}:`, trades);
        // console.log(`Depth updates for order ${order.id}:`, depthLevelUpdates);

        if(orderType === "MARKET"){
            remainingQty = normalizeQty(remainingQty)
            if(remainingQty > EPSILON){
                await handleMarketOrderTermination(order,remainingQty,orderBook,actualSpent)
            }else if(type === "BUY" && typeof order.amount === "number"){
                await releaseUnusedMarketBuyBudget(order,actualSpent,orderBook)
            }
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
                streamPipeline.set(`MARKET_PRICE:${marketId}:${trade.outcome}`,trade.price )
            }
            const lastTrade = trades[trades.length-1]!

            const marketUpdateEvent:marketUpdateEventType = {
                broadcastEventType:marketBroadcastEventType.MARKET_UPDATED,
                marketId:marketId,
                outcome:lastTrade.outcome,
                price:lastTrade.price ?? 0.5,
                volume:currentVolume
            }

            streamPipeline.xadd("MarketDataStream","*","marketUpdated",JSON.stringify(marketUpdateEvent))
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
const releaseUnusedMarketBuyBudget = async(order:Order,actualSpent:number,orderBook:Redis) => {
    if(typeof order.amount !== "number") return

    const refundAmount = roundMoney(Math.max(order.amount - actualSpent,0))

    if(refundAmount <= EPSILON) return

    const updatedWallet = await prisma.$transaction(async(tx) => {
        const wallet = await tx.wallet.update({
            where:{userID:order.userId},
            data:{
                locked:{decrement:refundAmount},
                balance:{increment:refundAmount}
            }
        })

        await tx.transaction.create({
            data:{
                type:"TRADE_RELEASE",
                amount:refundAmount,
                description:`REFUNDED $${refundAmount} ( UNUSED MARKET BUY BUDGET )`,
                walletId:wallet.id
            }
        })

        return wallet
    })

    await orderBook.publish("WALLET_UPDATE",JSON.stringify({
        userId:order.userId,
        balance:roundMoney(updatedWallet.balance),
        locked:roundMoney(updatedWallet.locked)
    }))
}

const handleMarketOrderTermination = async(order: Order,remainingQty:number,orderBook:Redis,actualSpent:number) => {
    const refundQty = normalizeQty(remainingQty)

    if(refundQty <= EPSILON) return

    const updatedWallet = await prisma.$transaction(async(tx)=>{
        let wallet:{id:string;balance:number;locked:number} | null = null

        await tx.order.update({
            where:{id:order.id},
            data:{
                status:"PARTIAL",
                remainingQuantity:0
            }
        })
        if(order.type === "BUY"){
            const refundAmount = typeof order.amount === "number"
                ? roundMoney(Math.max(order.amount - actualSpent,0))
                : roundMoney(order.price * refundQty)

            if(refundAmount > EPSILON){
                wallet = await tx.wallet.update({
                    where:{userID:order.userId},
                    data:{
                        locked:{decrement:refundAmount},
                        balance:{increment:refundAmount}
                    }
                })

                await tx.transaction.create({
                    data:{
                        type:"TRADE_RELEASE",
                        amount:refundAmount,
                        description: typeof order.amount === "number"
                            ? `REFUNDED $${refundAmount} ( UNUSED MARKET BUY BUDGET )`
                            : `REFUNDED $${refundAmount} ( UNFILLED MARKET ORDER )`,
                        walletId:wallet.id
                    }
                })
            }
        }
        if(order.type === "SELL"){
            const refundShares = Math.min(refundQty,order.remainingQuantity)
            const updatedHolding = await tx.holdings.update({
                where:{
                    userId_marketId_outcome:{
                        userId:order.userId,
                        marketId:order.marketId,
                        outcome:order.outcome as OrderOutcome
                    }
                },
                data:{
                    lockedShares:{decrement:refundShares},
                    shares:{increment:refundShares}
                }
            })

            if(Math.abs(updatedHolding.lockedShares) < EPSILON){
                await tx.holdings.update({
                    where:{id:updatedHolding.id},
                    data:{lockedShares:0}
                })
            }
        }

        return wallet

    })

    if(updatedWallet){
        await orderBook.publish("WALLET_UPDATE",JSON.stringify({
            userId:order.userId,
            balance:roundMoney(updatedWallet.balance),
            locked:roundMoney(updatedWallet.locked)
        }))
    }
}
const priceDepthUpdatePerOrder = async(order:Order|null,oppOrder:Order,marketId:string,fillQuantity:number,depthLevelUpdates:Map<string,depthUpdatedEventType>,orderBook:Redis) => {
    if(order){
        const newPriceQty = Number(await orderBook.hincrbyfloat(`Depth:${marketId}:${order.outcome}:${order.type}`,order.price.toString(),-fillQuantity))
        if(newPriceQty > EPSILON){
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
    const newOppOrderPriceQty = Number(await orderBook.hincrbyfloat(`Depth:${marketId}:${oppOrder.outcome}:${oppOrder.type}`,oppOrder.price.toString(),-fillQuantity))
    if(newOppOrderPriceQty > EPSILON){
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
export const addAndUpdatePriceDepth = async(marketId:string,outcome:string,type:string,order:Order,orderBook:Redis,depthLevelAdded: depthAddedEventType[]) => {
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
        const newQty = Number(await orderBook.hincrbyfloat(`Depth:${marketId}:${outcome}:${type}`,order.price.toString(),order.remainingQuantity))
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
    orderType:string,
    orderBook:Redis
) => {
    const result = await prisma.$transaction(async (tx) => {
        const buyerOrder = type === "BUY" ? order : oppOrder
        const sellerOrder = type === "SELL" ? order : oppOrder
        const execPrice = oppOrder.price;
        const buyerId = buyerOrder.userId
        const sellerId = sellerOrder.userId
        const buyerWalletID = await tx.wallet.findUnique({
            where:{userID:buyerId},
            select:{
                id:true
            }
        })
        const sellerWalletID = await tx.wallet.findUnique({
            where:{userID:sellerId},
            select:{
                id:true
            }
        })
        if (!buyerWalletID || !sellerWalletID) {
            throw new Error("Wallet not found during trade execution");
        }
        await tx.trade.create({
            data: {
                marketId: order.marketId,
                buyOrderId: buyerOrder.id,
                sellOrderId: sellerOrder.id,
                buyerId: buyerId,
                sellerId: sellerId,
                outcome: outcome,
                price: oppOrder.price,
                quantity: fillQuantity,
            },
        });
        const orderRemainingAfterFill = normalizeQty(remainingQuantity - fillQuantity);
        const oppRemainingAfterFill = normalizeQty(oppOrder.remainingQuantity - fillQuantity);
        await tx.order.update({
            where: { id: order.id },
            data: {
                status:
                    orderRemainingAfterFill <= EPSILON
                        ? "FILLED"
                        : "PARTIAL",
                remainingQuantity: orderRemainingAfterFill,
            },
        });

        await tx.order.update({
            where: { id: oppOrder.id },
            data: {
                status:
                    oppRemainingAfterFill <= EPSILON
                        ? "FILLED"
                        : "PARTIAL",
                remainingQuantity: oppRemainingAfterFill,
            },
        });
        const actualCost = roundMoney(execPrice * fillQuantity);
        const isIncomingMarketBuy = orderType === "MARKET" && type === "BUY" && typeof order.amount === "number"
        const lockedPrice = buyerOrder.price
        const lockAmount = isIncomingMarketBuy ? actualCost : roundMoney(lockedPrice * fillQuantity);
        const refund = roundMoney(Math.max(lockAmount - actualCost,0));

        //buyer
        const existingHoldings = await tx.holdings.findUnique({
            where: {
                userId_marketId_outcome: { userId: buyerId, marketId: order.marketId, outcome: buyerOrder.outcome as OrderOutcome },
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
                    outcome:buyerOrder.outcome as OrderOutcome
                },
            });
        }
        await tx.wallet.update({
            where: { userID: buyerId },
            data: {
                locked: { decrement: lockAmount },
                balance: { increment: refund },
            },
        });
        await tx.transaction.create({
            data:{
                type:"TRADE_PAYOUT",
                amount:actualCost,
                description:`BOUGHT ${fillQuantity} SHARES @ ${execPrice}`,
                walletId:buyerWalletID.id
            }
        })
        if(refund > 0){
            await tx.transaction.create({
                data:{
                    type:"TRADE_RELEASE",
                    amount:refund,
                    description:`REFUNDED $${refund} ( BETTER PRICE EXECUTION )`,
                    walletId:buyerWalletID.id
                }
            })
        }
        //seller
        await tx.wallet.update({
            where: { userID: sellerId },
            data: {
                balance: { increment: actualCost },
            },
        });
        await tx.transaction.create({
            data:{
                type:"TRADE_PAYOUT",
                amount:actualCost,
                description:`SOLD ${fillQuantity} SHARES @ ${execPrice}`,
                walletId:sellerWalletID.id
            }
        })
        const sellerHolding = await tx.holdings.update({
            where: {
                userId_marketId_outcome: { userId: sellerId, marketId: order.marketId,outcome: sellerOrder.outcome as OrderOutcome },
            },
            data: {
                lockedShares: { decrement: fillQuantity }
            },
        });

        if(Math.abs(sellerHolding.lockedShares) < EPSILON){
            await tx.holdings.update({
                where:{id:sellerHolding.id},
                data:{lockedShares:0}
            })
        }
        const [buyerWallet,sellerWallet] = await Promise.all([
            tx.wallet.findUnique({
                where:{userID:buyerId}
            }),
            tx.wallet.findUnique({
                where:{
                    userID:sellerId
                }
            })
        ])

        return {buyerId,sellerId,buyerWallet,sellerWallet}
    
    });

    if(result){
        orderBook.publish("WALLET_UPDATE",JSON.stringify({
            userId:result.buyerId,
            balance:roundMoney(result.buyerWallet?.balance ?? 0),
            locked: roundMoney(result.buyerWallet?.locked ?? 0)
        }))
        orderBook.publish("WALLET_UPDATE",JSON.stringify({
            userId:result.sellerId,
            balance:roundMoney(result.sellerWallet?.balance ?? 0),
            locked: roundMoney(result.sellerWallet?.locked ?? 0)
        }))
    }
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
        const orderRemaining = normalizeQty(remainingQty - fillQuantity);
        if (orderRemaining > EPSILON) {
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
    const oppRemaining = normalizeQty(oppOrder.remainingQuantity - fillQuantity);
    if (oppRemaining > EPSILON) {
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

export const addOrderToRedisQueue = async (
    order: Order,
    orderBook: Redis,
    currKey: string,
) => {
    const time = new Date(order.createdAt).getTime();
    const priceMultiplier: number =1e13;
    const score =
        order.type === "BUY"
            ? order.price * priceMultiplier + priceMultiplier - time
            : -order.price * priceMultiplier + priceMultiplier - time;
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
