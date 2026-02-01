
import Redis from "ioredis"
import { Order } from "../types/Trade"
import { matchOrder } from "./engine"
import { createRedisClient } from "./redis"

export const runWorker = async (markets: string[]) => {

    const client = createRedisClient()
    await client.connect()

    const orderBook = createRedisClient()
    await orderBook.connect()

    console.log(`Worker ready ${process.pid} ready for ${markets.length} markets. `)

    listentoWorkerQueue(String(process.pid),client,orderBook)
}
const listentoWorkerQueue = async(workerId:string,client:Redis,orderBook:Redis) => {

    while(true){
        try{
            const res:[string,string]|null = await client.brpop(`orderQueue:${workerId}`,0)
            if(!res) continue
            console.log(`Order recieved for Worker ${workerId}`)
            console.log(res)
            const parsed = JSON.parse(res[1])
            const order:Order = parsed
            const marketId = order.marketId
            await matchOrder(order,marketId,orderBook)

        }catch(error){
            console.error(`Error in listener for Worker${workerId} : ${error} `)
        }
    }
}
