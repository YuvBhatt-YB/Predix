import { Redis } from "ioredis";
import prisma from "../prisma";

import { text } from "node:stream/consumers";
import { Order, OrderOutcome } from "@prisma/client";
import { depthUpdatedEventType, marketBroadcastEventType } from "../types/Trade";
import { redis } from "../redisClient";


export const cancelOrder = async(orderId:string,userId:string,orderBook:Redis) => {
    console.log(`Cancelled order received for ${orderId}`)
    const order = await prisma.order.findUnique({
        where:{
            id:orderId
        }
    })

    if(!order) return
    if(order.userId !== userId) return

    const cancellableStatus = ["OPEN","PARTIAL"]

    if(!cancellableStatus.includes(order.status)) return

    const depthUpdate:depthUpdatedEventType = await cancelOrderFromRedis(order,orderBook)
    const {updatedWallet} = await cancelOrderFromDB(order,userId)
    await orderBook.xadd(`MarketDataStream`,"*","priceLevelUpdated",JSON.stringify(depthUpdate))
    if(updatedWallet){
        await orderBook.publish("WALLET_UPDATE",JSON.stringify({userId,balance:updatedWallet.balance,locked:updatedWallet.locked}))
    }
    await orderBook.publish("LP_TRIGGER",order.marketId)
}

const cancelOrderFromRedis = async(order:Order,orderBook:Redis):Promise<depthUpdatedEventType> => {
    const orderBookKey = `ORDERBOOK:${order.marketId}:${order.outcome}:${order.type}`
    await orderBook.zrem(orderBookKey,order.id)
    const depthKey = `Depth:${order.marketId}:${order.outcome}:${order.type}`
    const cancelQuantity = order.remainingQuantity
    const newPriceQuantity = await orderBook.hincrby(depthKey,order.price.toString(),-cancelQuantity)
    if(Number(newPriceQuantity) <= 0){
        await orderBook.hdel(depthKey,order.price.toString())
    }

    await orderBook.del(`Order:${order.id}`)

    return {
        broadcastEventType:marketBroadcastEventType.DEPTH_UPDATED,
        marketId:order.marketId,
        outcome:order.outcome,
        type:order.type,
        price:order.price,
        quantity:Math.max(Number(newPriceQuantity),0)
    }
}

const cancelOrderFromDB = async(order:Order,userId:string) => {
    const result = await prisma.$transaction(async(tx) => {
        let updatedWallet = null
        if(order.type === "BUY"){
            const refund = Number(order.remainingQuantity) * Number(order.price)
            updatedWallet = await tx.wallet.update({
                where:{userID:userId},
                data:{
                    balance:{
                        increment:refund
                    },
                    locked:{
                        decrement:refund
                    }
                }
            })

            
        }else{
            await tx.holdings.update({
                where:{
                    userId_marketId_outcome:{
                        userId,
                        marketId:order.marketId,
                        outcome:order.outcome as OrderOutcome
                    }
                },
                data:{
                    shares:{
                        increment:order.remainingQuantity
                    },
                    lockedShares:{
                        decrement:order.remainingQuantity
                    }
                }
            })
        }


        await tx.order.update({
            where:{id:order.id},
            data:{
                status:"CANCELLED"
            }
        })

        return {updatedWallet}

    })

    return result
}