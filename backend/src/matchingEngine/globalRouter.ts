import { parse } from "dotenv";
import { EngineEvent, Order } from "../types/Trade"
import { createRedisClient } from "./redis"

let assignedMarkets: Array<[number,string]> | null = null
let resolveReady!: () => void

const readyPromise = new Promise<void>((resolve) => {
    resolveReady = resolve
})
export const updateWorkerAssignedMarkets = (data: Array<[number,string]>) => {
    assignedMarkets = data
    resolveReady()
}

export const runRouter = async() => {
    const client = createRedisClient()
    await client.connect()
    
    await readyPromise
    
    try{
        while(true){
            const res:[string,string] | null = await client.brpop(`globalOrdersQueue`,0)
            console.log(res)
            if(!res) continue
            const parsed:EngineEvent = JSON.parse(res[1])
            console.log(parsed)
            const marketId = parsed.payload.marketId 
            const orderId = parsed.type === "PLACE_ORDER" ? parsed.payload.id : parsed.payload.orderId
            console.log(`${parsed.type} Order ${orderId} came in globalQueue. Process it`)
            for (const [worker,marketStrings] of assignedMarkets!){
                const markets = JSON.parse(marketStrings)
                if(markets.includes(marketId)){
                    console.log(`Order is for orderQueue:${String(worker)}`)
                    await client.lpush(`orderQueue:${String(worker)}`,JSON.stringify(parsed))
                    break
                }
            }
        }
    }catch(error){
            console.error(`Error in Global Router : ${error}`)
    }
}