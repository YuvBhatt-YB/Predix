import prisma from "../prisma";
import { Order } from "../types/Trade";
import { parseRedisOrder } from "./engine";
import { createDepthRebuildRedisClient, createPriceRebuildRedisClient, createRebuildRedisClient, createVolumeRebuildRedisClient } from "./redis";


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
                    await client.del(depthId)
                    const res: string[] = await client.zrange(id,0,-1)
                    if(!res || res.length === 0) continue
                    console.log(res)
                    const orderPipeline = client.pipeline()
                    
                    for(const orderId of res){
                        orderPipeline.hgetall(`Order:${orderId}`)
                    }
                    const orderResults = await orderPipeline.exec()
                    
                    if(!orderResults || orderResults.length === 0) continue
                    for(let i = 0; i < orderResults.length; i++){
                        const result = orderResults[i]
                        const orderId = res[i]
                        if(!result || !orderId) continue

                        const [error,orderRaw] = result
                        if(error || !orderRaw || Object.keys(orderRaw as Record<string,string>).length === 0){
                            await client.zrem(id,orderId)
                            continue
                        }

                        let order: Order
                        try{
                            order = parseRedisOrder(orderRaw as Record<string,string>)
                        }catch(error){
                            await client.zrem(id,orderId)
                            continue
                        }

                        if(order.remainingQuantity <=0 || !["OPEN","PARTIAL"].includes(order.status)){
                            await client.zrem(id,orderId)
                            continue
                        }
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

export const rebuildVolumeRedisFromDB = async () => {
    const client = createVolumeRebuildRedisClient()
    try{
        const trades = await prisma.trade.findMany({
            select:{
                marketId:true,
                price:true,
                quantity:true
            }
        })
        const volumeMap = new Map<string,number>()

        for(const trade of trades){
            const value = trade.price*trade.quantity

            volumeMap.set(
                trade.marketId,
                (volumeMap.get(trade.marketId) || 0) + value
            )
        }
        const volumePipeline = client.pipeline()

        for (const [marketId,volume] of volumeMap){
            volumePipeline.set(`MARKET_VOLUME:${marketId}`,volume||0)
        }

        await volumePipeline.exec()
    }catch(error){
        console.error(`Error in rebuilding Volume Chart : ${error}`)
    }finally{
        await client.quit()
    }
}

export const rebuildPriceRedisFromDB = async () => {
    const client = createPriceRebuildRedisClient()
    try{
        const trades = await prisma.trade.findMany({
            orderBy:{
                createdAt:"desc"
            }
        })

        const seen = new Set()
        const pricePipeline = client.pipeline()

        for(const trade of trades){
            const key = `${trade.marketId}:${trade.outcome}`

            if(!seen.has(key)){
                pricePipeline.set(`MARKET_PRICE:${trade.marketId}:${trade.outcome}`,trade.price)
                seen.add(key)
            }
        }

        await pricePipeline.exec()
    }catch(error){
        console.error(`Error in rebuilding Price Chart : ${error}`)
    }finally{
        await client.quit()
    }
}
