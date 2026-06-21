import cluster, { Worker} from "cluster";
import prisma from "../prisma";
import os from "os";

import { runWorker } from "./worker";
import { runRouter, updateWorkerAssignedMarkets } from "./globalRouter";
import { rebuildDepthRedisFromDB, rebuildPriceRedisFromDB, rebuildRedisFromDB, rebuildVolumeRedisFromDB } from "./rebuild";
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

const parsePositiveInt = (
    value: string | undefined,
    fallback: number,
): number => {
    if (!value || value === "auto") return fallback;

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
        return fallback;
    }

    return Math.floor(parsed);
};

const chunkArray = <T>(items: T[], chunkCount: number): T[][] => {
    if (chunkCount <= 0) return [];

    const safeChunkCount = Math.min(chunkCount, items.length);

    return Array.from({ length: safeChunkCount }, (_, index) => {
        const start = Math.floor((index * items.length) / safeChunkCount);
        const end = Math.floor(((index + 1) * items.length) / safeChunkCount);

        return items.slice(start, end);
    }).filter((chunk) => chunk.length > 0);
};


if(cluster.isPrimary){
    console.log(`Main Engine Started ${process.pid}`);

    (async()=>{
        try {
            await rebuildRedisFromDB()
            await rebuildVolumeRedisFromDB()
            await rebuildPriceRedisFromDB()
            await ensureBotSetup()
            const markets = await prisma.market.findMany({select:{id:true}})
            if(markets.length === 0){
                process.exit(0)
            }

            await rebuildDepthRedisFromDB(markets.map((market) => market.id))
            const availableCpus = os.cpus().length;

            const defaultMarketWorkers =
                process.env.NODE_ENV === "production"
                    ? 1
                    : Math.max(1, availableCpus - 3);
            const defaultLiquidityWorkers =
                process.env.NODE_ENV === "production" ? 0 : 2;

            const requestedMarketWorkers = parsePositiveInt(
                process.env.ENGINE_WORKERS,
                defaultMarketWorkers,
            );

            const requestedLiquidityWorkers = parsePositiveInt(
                process.env.LIQUIDITY_WORKERS,
                defaultLiquidityWorkers,
            );
            const marketWorkerCount = Math.max(
                1,
                Math.min(requestedMarketWorkers, markets.length),
            );

            const liquidityWorkerCount = Math.max(
                0,
                Math.min(requestedLiquidityWorkers, markets.length),
            );
            console.log({
                availableCpus,
                marketCount: markets.length,
                marketWorkerCount,
                liquidityWorkerCount,
            });
            
            const chunks = chunkArray(markets, marketWorkerCount);
            const liquidityChunks = chunkArray(markets, liquidityWorkerCount);
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
                    if (!assigned) {
                        console.log(
                            `Liquidity Worker ${worker.process.pid} died but had no assigned markets. Skipping restart.`,
                        );
                        return;
                    }
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
                    if (!assigned) {
                        console.log(
                            `Worker ${worker.process.pid} died but had no assigned markets. Skipping restart.`,
                        );
                        return;
                    }
                    console.log(`Worker ${worker.process.pid} died.Restarting`)
                    const newWorker = cluster.fork({MARKETS:assigned})
                    const newPid = newWorker.process.pid;

                    if (newPid === undefined)
                        throw new Error("New Worker PID Undefined");
                    workerAssignedMarkets.set(newPid,assigned)
                    workers.set(newPid,newWorker)
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