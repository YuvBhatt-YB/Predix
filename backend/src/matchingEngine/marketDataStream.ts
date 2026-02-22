import { depthAddedEventType, depthUpdatedEventType, marketBroadcastEventType, TradeExecutedEventType } from "../types/Trade";
import { createMarketDataStreamRedisClient } from "./redis"


export const marketDataStream = async () => {
    const client = createMarketDataStreamRedisClient()

    console.log(`Market Data Stream started ${process.pid}`)
    let lastID = "$"
    let running = true;

    while(running){
        try{
            const latestStreamData = await client.xread("BLOCK",0,"STREAMS",`MarketDataStream`,lastID)
            if(!latestStreamData || latestStreamData.length === 0) {
                continue
            }
            const streamEntry = latestStreamData[0]
            if(!streamEntry){
                continue
            }
            const [streamName,streamData] = streamEntry
            console.log(streamName)
            for(const [streamDataID,data] of streamData){
                const [eventType,eventData] = data
                if(!eventType || !eventData){
                    console.warn(`Invalid stream data format: ${data}`)
                    continue
                }
                switch(eventType){
                    case "priceLevelAdded":
                        const depthAdded:depthAddedEventType  = JSON.parse(eventData)
                        process.send?.({
                            type:marketBroadcastEventType.DEPTH_ADDED,
                            data:depthAdded
                        })
                        break
                    case "tradeExecuted":
                        const tradeExecuted:TradeExecutedEventType = JSON.parse(eventData)
                        process.send?.({
                            type:marketBroadcastEventType.TRADE_EXECUTED,
                            data:tradeExecuted
                        })
                        break;
                    case "priceLevelUpdated":
                        const depthUpdated:depthUpdatedEventType = JSON.parse(eventData)
                        process.send?.({
                            type:marketBroadcastEventType.DEPTH_UPDATED,
                            data:depthUpdated
                        })
                        break;
                    default:
                        console.warn(`Unknown event type: ${eventType}`)
                }
                lastID = streamDataID
            }
        }catch(error){
            console.error(`Error in Market Data Stream : ${error}`)
        }
    }

}