import { Server, Socket } from "socket.io";
import { marketUpdateEventType } from "../types/Trade";

interface ServerToClientEvents{
    marketUpdated: (data: marketUpdateEventType[]) => void
    marketUpdatedGlobal: (data: marketUpdateEventType[]) => void
}

interface ClientToServerEvents{
    joinMarket: (marketID: string) => void
}
export function registerMarketsHandler(io:Server<ClientToServerEvents,ServerToClientEvents>){
    const nsp = io.of("/markets")
    

    nsp.on("connection",(socket:Socket<ClientToServerEvents,ServerToClientEvents>) => {
        console.log("User connected to markets",socket.id)

        socket.on("joinMarket",(marketId) => {
            socket.join(marketId)
            console.log(`User ${socket.id} joined to market ${marketId}`  )
        })
        socket.on("disconnect",() => {
            console.log(`User disconnected from markets ${socket.id}`)
        })
    })

}