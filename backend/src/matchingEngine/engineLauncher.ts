import cluster from "cluster";
import prisma from "../prisma";
import os from "os";
import { matchingEngine } from "./engine";

if(cluster.isPrimary){
    console.log(`Main Engine Started ${process.pid}`);

    (async()=>{
        try {
            const markets = await prisma.market.findMany({select:{id:true}})
            if(markets.length === 0){
                process.exit(0)
            }
            const cpuCounts = os.cpus().length
            
            const marketPerWorkers = Math.ceil(markets.length/cpuCounts)
            
            const chunks = Array.from({length:cpuCounts},(_,i) => markets.slice(i * marketPerWorkers,(i+1)* marketPerWorkers))
            
            chunks.forEach((chunk) => {
                const worker = cluster.fork({
                    MARKETS:JSON.stringify(chunk.map((m)=>m.id))
                })

                console.log(`Worker ${worker.process.pid} Started with ${chunk.length} Markets`)

                cluster.on("exit",(worker,code,signal) => {
                    console.log(`Worker died ${worker.process.pid}. Restarting......`)
                    cluster.fork()
                })
            })
            
        } catch (error) {
            console.error("Error Loading Main Engine",error)
            process.exit(1)
        }
    })()
}else{
    const markets = JSON.parse(process.env.MARKETS || "[]");
    (async () => {
        try {
            for(let marketId of markets){
                matchingEngine(marketId)
            }
            
        } catch (error) {
            console.error(`Worker ${process.pid} error.`,error)
            process.exit(1)
        }
    })()
}