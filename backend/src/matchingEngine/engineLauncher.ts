import cluster, { Worker} from "cluster";
import prisma from "../prisma";
import os from "os";

import { runWorker } from "./worker";
import { runRouter, updateWorkerAssignedMarkets } from "./globalRouter";
import { rebuildRedisFromDB } from "./rebuild";
import { startEngineEventListener } from "./engineEventListener";
import { ensureBotSetup, runLiquidityProviderWorker } from "./liquidityProviderWorker";



interface workerEnv {
    MARKETS:string,
    ROUTER: boolean,
    BROADCASTER: boolean,
    LIQUIDITY:boolean
}
type workerMsg = {
    type: string,
    data: []
}
type addMarketMsg = {
    type:string,
    marketId:string
}


if(cluster.isPrimary){
    console.log(`Main Engine Started ${process.pid}`);

    (async()=>{
        try {
            await rebuildRedisFromDB()
            await ensureBotSetup()
            const markets = await prisma.market.findMany({select:{id:true}})
            if(markets.length === 0){
                process.exit(0)
            }
            const cpuCounts = Math.max(1,os.cpus().length -3)
            
            const marketPerWorkers = Math.ceil(markets.length/cpuCounts)
            console.log(marketPerWorkers)
            const LP_WORKERS = 2
            const marketPerLiquidityProvider = Math.ceil(markets.length/LP_WORKERS)
            console.log(marketPerLiquidityProvider)
            
            const chunks = Array.from({length:cpuCounts},(_,i) => markets.slice(i * marketPerWorkers,(i+1)* marketPerWorkers))
            const liquidityChunks = Array.from({length:LP_WORKERS},(_,i) => markets.slice(i*marketPerLiquidityProvider,(i+1)* marketPerLiquidityProvider))
            console.log(liquidityChunks)
            const workerAssignedMarkets = new Map()
            const workers = new Map<number,Worker>()
            const liquidityWorkers = new Map<number,Worker>()
            const liquidityWorkersAssignedMarkets = new Map()

            const router = cluster.fork({ROUTER:true})
            console.log(`Global Router started ${router.process.pid}`)

            chunks.forEach((chunk) => {
                const assigned = JSON.stringify(chunk.map((m)=>m.id))
                const worker = cluster.fork({
                    MARKETS:assigned
                })
                const pid = worker.process.pid
                if(pid === undefined) throw new Error("Worker PID Undefined")
                workers.set(pid,worker)
                workerAssignedMarkets.set(pid,assigned)

                console.log(`Worker ${pid} Started with ${chunk.length} Markets`)
            })
            liquidityChunks.forEach((chunk) => {
                const assigned = JSON.stringify(chunk.map((m)=>m.id))
                const worker = cluster.fork({
                    MARKETS:assigned,
                    LIQUIDITY:true
                })
                const pid = worker.process.pid
                if(pid === undefined) throw new Error("LiquidityWorker PID Undefined")
                liquidityWorkers.set(pid,worker)
                liquidityWorkersAssignedMarkets.set(pid,assigned)
                console.log(`Liquidity Worker ${pid} Started with ${chunk.length} Markets`)
            })
            try{
                await startEngineEventListener(workers,workerAssignedMarkets,liquidityWorkers,liquidityWorkersAssignedMarkets,router)
            }catch(error){
                console.error("Engine Event Listener Failed",error)
            }
            console.log(workers)
            console.log(workerAssignedMarkets)
            console.log(liquidityWorkers)
            console.log(liquidityWorkersAssignedMarkets)
            
            
            
            cluster.on("exit",(worker: Worker & {process:NodeJS.Process &{env:workerEnv}},code,signal) => {
                if(worker.process.env.ROUTER){
                    console.log(`Router ${worker.process.pid} died.Restarting`)
                    const newRouter = cluster.fork({ROUTER:true})
                    console.log(`New Router ${newRouter.process.pid} Started`)
                }else if(worker.process.env.LIQUIDITY){
                    const assigned = liquidityWorkersAssignedMarkets.get(worker.process.pid)
                    console.log(`Liquidity Worker ${worker.process.pid} died.Restarting`)
                    const newWorker = cluster.fork({MARKETS:assigned,LIQUIDITY:true})
                    const newPid = newWorker.process.pid
                    if(newPid === undefined) throw new Error("New Liquidity Worker PID Undefined")
                    liquidityWorkersAssignedMarkets.set(newPid,assigned)
                    liquidityWorkers.set(newPid,newWorker)
                    console.log(`New Liquidity Worker ${newWorker.process.pid} died.Restarting`)
                }
                else{
                    const assigned = workerAssignedMarkets.get(worker.process.pid)
                    console.log(`Worker ${worker.process.pid} died.Restarting`)
                    const newWorker = cluster.fork({MARKETS:assigned})
                    workerAssignedMarkets.set(newWorker.process.pid,assigned)
                    router.send({
                        type:"WORKER_MARKETS_UPDATE",
                        data:Array.from(workerAssignedMarkets.entries())
                    })
                }
            })

            cluster.on("message",(worker,msg)=>{
                if (msg.type == "GET_WORKER_MARKETS"){
                    worker.send({
                        type:"WORKER_MARKETS",
                        data:Array.from(workerAssignedMarkets.entries())
                    })
                }
            })
            
        } catch (error) {
            console.error("Error Loading Main Engine",error)
            process.exit(1)
        }
    })()
}else{
    
    try{
        
        if(process.env.ROUTER){ 
            process.on("message",(msg: workerMsg) => {
                if(msg.type == "WORKER_MARKETS" || msg.type == "WORKER_MARKETS_UPDATE"){
                    updateWorkerAssignedMarkets(msg.data)
                }
            })
            process.send?.({type:"GET_WORKER_MARKETS"})
            runRouter()
            
        }else if (process.env.LIQUIDITY){
            const markets = JSON.parse(process.env.MARKETS || "[]")
            process.on("message",(msg:addMarketMsg) => {
                if(msg.type == "ADD_MARKET"){
                    markets.push(msg.marketId)
                    console.log(`Worker ${process.pid} added market ${msg.marketId}`)
                }
            })
            runLiquidityProviderWorker(markets)
        }
        else{
            const markets = JSON.parse(process.env.MARKETS || "[]");
            process.on("message",(msg:addMarketMsg) => {
                if(msg.type == "ADD_MARKET"){
                    markets.push(msg.marketId)
                    console.log(`Worker ${process.pid} added market ${msg.marketId}`)
                }
            })
            runWorker(markets)
        }
    }catch(error){
        console.error(`Worker ${process.pid} error.`,error)
        process.exit(1)
    }
}