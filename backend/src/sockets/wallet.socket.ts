import { Server, Socket } from "socket.io";
import { WalletUpdateData } from "../types/Trade";

interface ServerToClientEvents{
    walletUpdated: (data: WalletUpdateData) => void
}

interface ClientToServerEvents{
    joinWallet: (userID: string) => void
}
export function registerWalletHandler(io:Server<ClientToServerEvents,ServerToClientEvents>){
    const nsp = io.of("/wallet")
    

    nsp.on("connection",(socket:Socket<ClientToServerEvents,ServerToClientEvents>) => {
        console.log("User connected to wallet",socket.id)

        socket.on("joinWallet",(userId) => {
            socket.join(userId)
            console.log(`User ${socket.id} joined to Wallet ${userId}`  )
        })
        socket.on("disconnect",() => {
            console.log(`User disconnected from Wallet ${socket.id}`)
        })
    })

}