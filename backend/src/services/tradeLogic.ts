
import { OrderExecutionType, OrderOutcome,OrderSide } from "@prisma/client"
import prisma from "../prisma"
import { TradeValidationResult } from "../types/Trade"
import { redis } from "../redisClient"

export const validateTradeCriteria = async(userId:string,marketId:string,quantity:number,price:number): Promise<TradeValidationResult> => {
    const result = await prisma.$transaction<TradeValidationResult>(async (tx)=> {
        const market = await tx.market.findUnique({
            where:{id:marketId}
        })
        if(!market) return {success:false,message:`Market not found for this marketId ${marketId}`}

        if(market?.status === "ACTIVE"){
            const user = await tx.user.findUnique({
                where:{id: userId},
                include:{wallet:true}
            })
            if(!user) return {success:false,message:`User not found for this userId ${userId}`}
            
            if(user.wallet && user.wallet?.balance >= quantity*price){
                return {
                    success: true,
                    walletId : user.wallet.id
                }
            }else{
                return {success:false,message:"User has insufficient balance for trade to execute"}
            }
        }else{
            return {success:false,message:`Market has already been resolved for this marketId ${marketId}`}
        }
    })

    return result
}

export const placeOrder = async (userId: string,marketId: string,quantity: number,price: number,type: OrderSide,outcome: OrderOutcome,orderType:OrderExecutionType,walletId: string) => {
    try {
        const amount: number = Math.round(quantity*price * 100)/100
        const result = await prisma.$transaction(async (tx) => {
            let updatedWallet = null
            if (type == "BUY") {
                const wallet = await tx.wallet.findUnique({
                    where: { userID: userId },
                });

                if (!wallet) {
                    throw new Error("Wallet not found");
                }
                updatedWallet = await tx.wallet.update({
                    where: { userID: userId },
                    data: {
                        balance: { decrement: amount },
                        locked: { increment: amount },
                    },
                });
                await tx.transaction.create({
                    data: {
                        type: "TRADE_LOCK",
                        amount: amount,
                        description: `LOCKED IN $${amount.toFixed(2)} FOR TRADE`,
                        walletId: wallet.id,
                    },
                });
            } else if (type === "SELL") {
                const holdings = await tx.holdings.findUnique({
                    where: { userId_marketId_outcome: { userId, marketId,outcome } },
                });

                if (!holdings || holdings.shares < quantity) {
                    throw new Error("Insufficient shares to place SELL order");
                }

                await tx.holdings.update({
                    where: { id: holdings.id },
                    data: {
                        shares: { decrement: quantity },
                        lockedShares: {increment: quantity}
                    },
                });
            }
            const order = await tx.order.create({data:{
                userId:userId,
                marketId:marketId,
                quantity:quantity,
                remainingQuantity:quantity,
                price:price,
                type:type ,
                outcome:outcome,
                orderType:orderType,
                status:"OPEN"
            }})
            
            return {updatedWallet,order}
        })
        if(!result) return{ok:false}
        if (type === "BUY") {
            redis.publish(
                "WALLET_UPDATE",
                JSON.stringify({
                    userId: result.order.userId,
                    balance: result.updatedWallet?.balance ?? 0,
                    locked: result.updatedWallet?.locked ?? 0,
                }),
            );
        }
        await redis.lpush(`globalOrdersQueue`,JSON.stringify(result.order))
        return {ok:true,order:result.order}
    } catch (error) {
        if(error instanceof Error){
            return {ok:false,message:error.message || "UNKNOWN ERROR WHILE PLACING ORDER"}
        }
    }
}