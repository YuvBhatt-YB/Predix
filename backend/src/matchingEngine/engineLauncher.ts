import cluster, { Worker} from "cluster";
import prisma from "../prisma";
import os from "os";

import { runWorker } from "./worker";
import { runRouter, updateWorkerAssignedMarkets } from "./globalRouter";
import { rebuildRedisFromDB } from "./rebuild";

interface workerEnv {
    MARKETS:string,
    ROUTER: boolean,
    BROADCASTER: boolean
}
type workerMsg = {
    type: string,
    data: []
}


if(cluster.isPrimary){
    console.log(`Main Engine Started ${process.pid}`);

    (async()=>{
        try {
            await rebuildRedisFromDB()
            const markets = await prisma.market.findMany({select:{id:true}})
            if(markets.length === 0){
                process.exit(0)
            }
            const cpuCounts = (os.cpus().length) - 2
            
            const marketPerWorkers = Math.ceil(markets.length/cpuCounts)
            
            const chunks = Array.from({length:cpuCounts},(_,i) => markets.slice(i * marketPerWorkers,(i+1)* marketPerWorkers))
            const workerAssignedMarkets = new Map()

            const router = cluster.fork({ROUTER:true})
            console.log(`Global Router started ${router.process.pid}`)

            const orderBroadcaster = cluster.fork({BROADCASTER:true})
            console.log(`Order Broadcaster started ${orderBroadcaster.process.pid}`)

            chunks.forEach((chunk) => {
                const assigned = JSON.stringify(chunk.map((m)=>m.id))
                const worker = cluster.fork({
                    MARKETS:assigned
                })
                
                workerAssignedMarkets.set(worker.process.pid,assigned)

                console.log(`Worker ${worker.process.pid} Started with ${chunk.length} Markets`)


                
            })
            console.log(workerAssignedMarkets)
            
            
            
            
            cluster.on("exit",(worker: Worker & {process:NodeJS.Process &{env:workerEnv}},code,signal) => {
                if(worker.process.env.ROUTER){
                    console.log(`Router ${worker.process.pid} died.Restarting`)
                    const newRouter = cluster.fork({ROUTER:true})
                    console.log(`New Router ${newRouter.process.pid} Started`)
                }else if(worker.process.env.BROADCASTER){
                    console.log(`Order Broadcaster ${worker.process.pid} died.Restarting`)
                    const newBroadcaster = cluster.fork({BROADCASTER:true})
                    console.log(`New Order Broadcaster ${newBroadcaster.process.pid} Started`)
                }
                else{
                    const assigned = workerAssignedMarkets.get(worker.id)
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
            
        }else if(process.env.BROADCASTER){
            console.log("Broadcaster")
        }
        else{
            const markets = JSON.parse(process.env.MARKETS || "[]");
            runWorker(markets)
        }
    }catch(error){
        console.error(`Worker ${process.pid} error.`,error)
        process.exit(1)
    }
}