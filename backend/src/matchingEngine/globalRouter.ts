import { Order } from "../types/Trade"
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
    const workerAssignedMarkets = new Map(assignedMarkets)
    try{
        while(true){
            const res:[string,string] | null = await client.brpop(`globalOrdersQueue`,0)
            console.log(res)
            if(!res) continue
            const parsed = JSON.parse(res[1])
            const order:Order = parsed
            console.log(`Order ${order.id} came in globalQueue. Process it`)
            for (const worker of workerAssignedMarkets.keys()){
                const parsed = workerAssignedMarkets.get(worker)
                if(!parsed) {
                    console.log(`We have no markets for this ${worker}`)
                    continue
                }
                const markets = JSON.parse(parsed)
                if(markets.includes(order.marketId)){
                    console.log(`Order is for orderQueue:${String(worker)}`)
                    await client.lpush(`orderQueue:${String(worker)}`,JSON.stringify(order))
                    break
                }
            }
        }
    }catch(error){
            console.error(`Error in Global Router : ${error}`)
    }
}