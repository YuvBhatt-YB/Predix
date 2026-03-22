
import Redis from "ioredis"
import { Order } from "../types/Trade"
import { matchOrder } from "./engine"
import {  createRedisClient } from "./redis"
import { rebuildDepthRedisFromDB } from "./rebuild"
import type { Worker } from "cluster"

export const runWorker = async (markets: string[]) => {

    await rebuildDepthRedisFromDB(markets)

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

export const assignMarketToWorker = (workers:Map<number,Worker>,workerAssignedMarkets:Map<number,string>,liquidityWorkers:Map<number,Worker>,liquidityWorkersAssignedMarkets:Map<number,string>,router:Worker,marketId:string) => {
    const workerPids = Array.from(workers.keys())
    const liquidityWorkerPids = Array.from(liquidityWorkers.keys())
    if(workerPids.length === 0){
        console.log("There is no Worker to assign to")
        return
    }
    if(liquidityWorkerPids.length === 0){
        console.log("There is no Liquidity Worker to assign to")
        return
    }
    const hash = hashString(marketId)
    const index = hash%workerPids.length
    const lIndex = hash%liquidityWorkerPids.length
    const workerPid = workerPids[index]
    const liquidityWorkerPid = liquidityWorkerPids[lIndex]
    if(workerPid === undefined) {
        console.log("NO Worker PID Found in workerPids array")
        return
    }
    if(liquidityWorkerPid === undefined) {
        console.log("NO Liquidity Worker PID Found in liquidityWorkerPids array")
        return
    }
    const worker = workers.get(workerPid)
    const liquidityWorker = liquidityWorkers.get(liquidityWorkerPid)

    worker?.send({
        type:"ADD_MARKET",
        marketId
    })
    liquidityWorker?.send({
        type:"ADD_MARKET",
        marketId
    })

    console.log(`Assigned Market ${marketId} to worker ${workerPid}`)
    console.log(`Assigned Market ${marketId} to liquidty worker ${liquidityWorkerPid}`)

    const existing = workerAssignedMarkets.get(workerPid)
    const existingLiquidity = liquidityWorkersAssignedMarkets.get(liquidityWorkerPid) 
    const markets = existing ? JSON.parse(existing) : []
    const liquidityMarkets = existingLiquidity ? JSON.parse(existingLiquidity): []

    markets.push(marketId)
    liquidityMarkets.push(marketId)

    workerAssignedMarkets.set(workerPid,JSON.stringify(markets))
    liquidityWorkersAssignedMarkets.set(liquidityWorkerPid,JSON.stringify(liquidityMarkets))

    router.send({
        type:"WORKER_MARKETS_UPDATE",
        data:Array.from(workerAssignedMarkets.entries())
    })


}

const hashString = (str:string) => {
    let hash = 0

    for(let i = 0;i<str.length;i++){
        hash = (hash<<5) - hash + str.charCodeAt(i)
        hash |= 0
    }

    return Math.abs(hash)
}
