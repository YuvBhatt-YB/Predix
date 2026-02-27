import { Server } from "socket.io";
import { createMarketDataStreamRedisClient } from "../redisClient";
import { depthAddedEventType, depthUpdatedEventType, marketBroadcastEventType, TradeExecutedEventType } from "../types/Trade";

export async function marketDataStreamReader(io: Server) {
    const client = createMarketDataStreamRedisClient();
    console.log(`Market Data Streaming started `);
    const tradeBuffer = new Map<string, TradeExecutedEventType[]>()
    const depthAddedBuffer = new Map<string,depthAddedEventType[]>()
    const depthUpdatedBuffer = new Map<string,depthUpdatedEventType[]>()
    let lastID = "$";
    let running = true;
    setInterval(() => {
        for (const [marketId, trades] of tradeBuffer.entries()) {
            if (trades.length > 0) {
                console.log("Emitting trades to", marketId, trades.length)
                io.of(`/trades`).to(marketId).emit("tradeExecuted", trades);
                tradeBuffer.set(marketId, []);
            }
        }
        for (const [marketId, depthAdded] of depthAddedBuffer.entries()) {
            if (depthAdded.length > 0) {
                console.log("Emitting depthAdded to", marketId, depthAdded.length)
                io.of(`/trades`).to(marketId).emit("depthAdded", depthAdded);
                depthAddedBuffer.set(marketId, []);
            }
        }
        for (const [marketId, depthUpdated] of depthUpdatedBuffer.entries()) {
            if (depthUpdated.length > 0) {
                console.log("Emitting depthUpdated to", marketId, depthUpdated.length)
                io.of(`/trades`).to(marketId).emit("depthUpdated", depthUpdated);
                depthUpdatedBuffer.set(marketId, []);
            }
        }
    }, 50);
    while (running) {
        try {
            const latestStreamData = await client.xread(
                "BLOCK",
                0,
                "STREAMS",
                `MarketDataStream`,
                lastID,
            );
            if (!latestStreamData || latestStreamData.length === 0) {
                continue;
            }
            const streamEntry = latestStreamData[0];
            if (!streamEntry) {
                continue;
            }
            const [streamName, streamData] = streamEntry;
            console.log(streamName);
            for (const [streamDataID, data] of streamData) {
                const [eventType, eventData] = data;
                if (!eventType || !eventData) {
                    console.warn(`Invalid stream data format: ${data}`);
                    continue;
                }
                switch (eventType) {
                    case "priceLevelAdded":
                        const depthAdded: depthAddedEventType = JSON.parse(eventData);
                        if(!depthAddedBuffer.has(depthAdded.marketId)){
                            depthAddedBuffer.set(depthAdded.marketId,[])
                        }
                        depthAddedBuffer.get(depthAdded.marketId)!.push(depthAdded)
                        console.log(depthAdded)
                        break;
                    case "tradeExecuted":
                        const tradeExecuted: TradeExecutedEventType = JSON.parse(eventData);
                        if(!tradeBuffer.has(tradeExecuted.marketId)){
                            tradeBuffer.set(tradeExecuted.marketId,[])
                        }
                        tradeBuffer.get(tradeExecuted.marketId)!.push(tradeExecuted)
                        console.log(tradeExecuted)
                        break;
                    case "priceLevelUpdated":
                        const depthUpdated: depthUpdatedEventType = JSON.parse(eventData);
                        if(!depthUpdatedBuffer.has(depthUpdated.marketId)){
                            depthUpdatedBuffer.set(depthUpdated.marketId,[])
                        }
                        depthUpdatedBuffer.get(depthUpdated.marketId)!.push(depthUpdated)
                        console.log(depthUpdated)
                        break;
                    default:
                        console.warn(`Unknown event type: ${eventType}`);
                }
                lastID = streamDataID;
            }
        } catch (error) {
            console.error(`Error in Market Data Stream : ${error}`);
        }
    }
}