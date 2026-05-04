
import { Server } from "socket.io";
import { createWalletUpdateRedisClient } from "../redisClient";
import { WalletUpdateData } from "../types/Trade";

export const startWalletSubscriber = async (io:Server) => {
    const subscriber = createWalletUpdateRedisClient()

    await subscriber.connect()
    await subscriber.subscribe("WALLET_UPDATE")

    subscriber.on("message",(channel,message) => {
        if(channel === "WALLET_UPDATE"){
            console.log("WALLET EVENT",message)
            const data:WalletUpdateData = JSON.parse(message)

            io.of("/wallet").to(data.userId).emit("walletUpdated",data)
        }
    })
    console.log("Wallet subscriber started")
}