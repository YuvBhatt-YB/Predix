import { createEngineEventListenerRedisClient } from "./redis"
import { assignMarketToWorker } from "./worker"
import type { Worker } from "cluster"

export const startEngineEventListener = async(workers: Map<number,Worker>,workerAssignedMarkets: Map<number,string>,liquidityWorkers:Map<number,Worker>,liquidityWorkersAssignedMarkets:Map<number,string>,router: Worker) => {
    console.log("Starting engine event listener")

    const subscriber = createEngineEventListenerRedisClient()

    
    await subscriber.subscribe("engine_events")

    console.log("Subscribed to Engine Events")

    subscriber.on("message",(channel,message) => {
        console.log("EVENT RECEIVED",message)
        try{
            const event: {type:string,marketId:string} = JSON.parse(message)
            if(event.type === "NEW_MARKET"){
                console.log("New market event received:",event.marketId)
                assignMarketToWorker(workers,workerAssignedMarkets,liquidityWorkers,liquidityWorkersAssignedMarkets,router,event.marketId)
            }
        }catch(error){
            console.error("Invalid engine event",message)
        }
    })
}