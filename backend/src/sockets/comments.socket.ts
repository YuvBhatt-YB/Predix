import { Server,Socket } from "socket.io";

interface ServerToClientEvents {
    newComment: (comment: any) => void
}

interface ClientToServerEvents {
    joinMarket: (marketId: string) => void
}

export function registerCommentHandlers(io: Server<ClientToServerEvents,ServerToClientEvents>){
    const nsp = io.of("/comments")

    nsp.on("connection",(socket: Socket<ClientToServerEvents,ServerToClientEvents> )=>{
        console.log("User connected to comments",socket.id)

        socket.on("joinMarket",(marketId)=>{
            socket.join(marketId)
            console.log(`User ${socket.id} joined to market ${marketId}`)
        })

        socket.on("disconnect",()=>{
            console.log(`User disconnected from comments ${socket.id}`)
        })
    })
}