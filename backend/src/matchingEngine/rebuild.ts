import prisma from "../prisma";
import { Order } from "../types/Trade";
import { parseRedisOrder } from "./engine";
import { createDepthRebuildRedisClient, createRebuildRedisClient } from "./redis";


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


export const rebuildDepthRedisFromDB = async (markets: string[]) => {
    const client = createDepthRebuildRedisClient()
    try{
        for(const market of markets){
            for(const outcome of ["YES","NO"]){
                for (const side of ["BUY","SELL"]){
                    const id = `ORDERBOOK:${market}:${outcome}:${side}`
                    const depthId = `Depth:${market}:${outcome}:${side}`
                    const priceLevels = new Map<string,number>()
                    console.log(id)
                    const res: string[] = await client.zrange(id,0,-1)
                    if(!res || res.length === 0) continue
                    console.log(res)
                    await client.del(depthId)
                    const orderPipeline = client.pipeline()
                    
                    for(const orderId of res){
                        orderPipeline.hgetall(`Order:${orderId}`)
                    }
                    const orderResults = await orderPipeline.exec()
                    
                    if(!orderResults || orderResults.length === 0) continue
                    for(const[error,orderRaw] of orderResults){
                        if(error || !orderRaw) continue
                        const order = parseRedisOrder(orderRaw as Record<string,string>)
                        if(order.remainingQuantity <=0) continue
                        if(!priceLevels.has(String(order.price))){
                            priceLevels.set(String(order.price),order.remainingQuantity)
                        }else{
                            priceLevels.set(String(order.price),(priceLevels.get(String(order.price))! + order.remainingQuantity))
                        }
                    }
                    console.log(priceLevels)
                    const writeDepthPipeline = client.pipeline()
                    for(const [price,quantity] of priceLevels){
                        writeDepthPipeline.hset(`${depthId}`,price,quantity)
                    }

                    await writeDepthPipeline.exec()
                }
            }

        }
    }catch(error){
        console.error(`Error in Rebuilding Depth Chart : ${error}`)
    } finally {
        await client.quit()
    }
}