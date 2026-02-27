import { Server, Socket } from "socket.io";
import { depthAddedEventType, depthUpdatedEventType, marketBroadcastEventType, TradeExecutedEventType } from "../types/Trade";


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