import { Order } from "../types/Trade";
import Redis from "ioredis";

import prisma from "../prisma";
import { OrderOutcome } from "@prisma/client";

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
        let remainingQty = remainingQuantity;
        if(orderType === "LIMIT"){
            await addOrderToRedisQueue(order, orderBook, currKey);
        }
        while (remainingQty > 0) {
            console.log(remainingQty);
            console.log(currKey);
            console.log(oppKey);

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
            console.log(oppOrder);
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
            console.log(fillQuantity);
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
            remainingQty -= fillQuantity;
            console.log(remainingQty);
        }
        if(orderType === "MARKET" && remainingQty === remainingQuantity){
            await handleMarketOrderTermination(order,remainingQty)
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
                userId_marketId: { userId: buyerId, marketId: order.marketId },
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
        //seller
        await tx.wallet.update({
            where: { userID: sellerId },
            data: {
                balance: { increment: actualCost },
            },
        });
        await tx.holdings.update({
            where: {
                userId_marketId: { userId: sellerId, marketId: order.marketId },
            },
            data: {
                lockedShares: { decrement: fillQuantity },
            },
        });
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

const parseRedisOrder = (raw: Record<string, string>): Order => {
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
