
import { OrderOutcome, OrderType } from "@prisma/client"
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

export const placeOrder = async (userId: string,marketId: string,quantity: number,price: number,type: string,outcome: string,walletId: string) => {
    try {
        const amount: number = quantity*price
        const orderResult = await prisma.$transaction(async (tx) => {
            if (type == "BUY") {
                await tx.wallet.update({
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
                        description: `LOCKED IN $${amount} FOR TRADE`,
                        walletId: walletId,
                    },
                });
            } else if (type === "SELL") {
                const holdings = await tx.holdings.findUnique({
                    where: { userId_marketId: { userId, marketId } },
                });

                if (!holdings || holdings.shares < quantity) {
                    return { ok: false,order: "Insufficient Shares to Sell" };
                }

                await tx.holdings.update({
                    where: { id: holdings.id },
                    data: {
                        shares: { decrement: quantity },
                    },
                });
            }
            const order = await tx.order.create({data:{
                userId:userId,
                marketId:marketId,
                quantity:quantity,
                price:price,
                type:type as OrderType,
                outcome:outcome as OrderOutcome,
                status:"OPEN"
            }})
            
            await redis.lpush(`orders:${marketId}`,JSON.stringify(order))
            return {ok:true,order:order}
        });

        return orderResult
    } catch (error) {
        console.error(error)
    }
}