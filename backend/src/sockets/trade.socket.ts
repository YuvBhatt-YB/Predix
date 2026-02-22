import { Server, Socket } from "socket.io";
import { depthAddedEventType, depthUpdatedEventType, marketBroadcastEventType, TradeExecutedEventType } from "../types/Trade";
import { engineEventBus } from "../event/eventBus";

interface ServerToClientEvents{
    depthAdded: (data: depthAddedEventType[]) => void,
    tradeExecuted: (data: TradeExecutedEventType[]) => void,
    depthUpdated: (data: depthUpdatedEventType[]) => void
}

interface ClientToServerEvents{
    joinTradeMarket: (marketID: string) => void
}

export function registerTradeHandlers(io: Server<ClientToServerEvents,ServerToClientEvents>){
    const nsp = io.of("/trades")
    const tradeBuffer = new Map<string, TradeExecutedEventType[]>()
    const depthAddedBuffer = new Map<string,depthAddedEventType[]>()
    const depthUpdatedBuffer = new Map<string,depthUpdatedEventType[]>()
    engineEventBus.on(marketBroadcastEventType.TRADE_EXECUTED,(trade: TradeExecutedEventType) => {
            if(!tradeBuffer.has(trade.marketId)){
                tradeBuffer.set(trade.marketId,[])
            }
            tradeBuffer.get(trade.marketId)!.push(trade)
            console.log(trade)
    })
    engineEventBus.on(marketBroadcastEventType.DEPTH_ADDED,(depthAddedData: depthAddedEventType) => {
            if(!depthAddedBuffer.has(depthAddedData.marketId)){
                depthAddedBuffer.set(depthAddedData.marketId,[])
            }
            depthAddedBuffer.get(depthAddedData.marketId)!.push(depthAddedData)
            console.log(depthAddedData)
    })
    engineEventBus.on(marketBroadcastEventType.DEPTH_UPDATED,(depthUpdatedData: depthUpdatedEventType) => {
            console.log(depthUpdatedData)
            if(!depthUpdatedBuffer.has(depthUpdatedData.marketId)){
                depthUpdatedBuffer.set(depthUpdatedData.marketId,[])
            }
            depthUpdatedBuffer.get(depthUpdatedData.marketId)!.push(depthUpdatedData)
            console.log(depthUpdatedData)
    })
    setInterval(() => {
        for (const [marketId, trades] of tradeBuffer.entries()) {
            if (trades.length > 0) {
                nsp.to(marketId).emit("tradeExecuted", trades);
                tradeBuffer.set(marketId, []);
            }
        }
        for (const [marketId, depthAdded] of depthAddedBuffer.entries()) {
            if (depthAdded.length > 0) {
                nsp.to(marketId).emit("depthAdded", depthAdded);
                depthAddedBuffer.set(marketId, []);
            }
        }
        for (const [marketId, depthUpdated] of depthUpdatedBuffer.entries()) {
            if (depthUpdated.length > 0) {
                nsp.to(marketId).emit("depthUpdated", depthUpdated);
                depthUpdatedBuffer.set(marketId, []);
            }
        }
    }, 50);
    nsp.on("connection",(socket: Socket<ClientToServerEvents,ServerToClientEvents>) => {
        console.log("User connected to trades",socket.id)

        socket.on("joinTradeMarket",(marketID) => {
            socket.join(marketID)
            console.log(`User ${socket.id} joined to trade market ${marketID}`  )
        })

        socket.on("disconnect",() => {
            console.log(`User disconnected from trades ${socket.id}`)
        })
    })
}