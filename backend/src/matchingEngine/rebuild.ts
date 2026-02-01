import prisma from "../prisma";
import { Order } from "../types/Trade";
import { createRebuildRedisClient } from "./redis";


export const rebuildRedisFromDB = async () => {
    const redis = createRebuildRedisClient()
    try {
        await redis.flushdb()
        const openOrders = await prisma.order.findMany({
            where: {
                status: {
                    in: ["OPEN", "PARTIAL"],
                },
            },
        });

        if (!openOrders || openOrders.length === 0) return;

        console.log(openOrders);
        
    
       for (const order of openOrders){
            await redis.hset(`Order:${order.id}`,order)
            const time = new Date(order.createdAt).getTime()
            const priceMultiplier:number = 1_000_000_000_000
            const score = order.type === "BUY" ? order.price * priceMultiplier + (priceMultiplier - time) :  - order.price * priceMultiplier + (priceMultiplier - time)
            await redis.zadd(`ORDERBOOK:${order.marketId}:${order.outcome}:${order.type}`,score,order.id)
       }

    } catch (error) {
        console.error(`Error in Rebuilding OrderBook : ${error}`);
    } finally {
        await redis.quit()
    }
};