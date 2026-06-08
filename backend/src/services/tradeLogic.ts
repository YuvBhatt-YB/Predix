
import { OrderExecutionType, OrderOutcome,OrderSide } from "@prisma/client"
import prisma from "../prisma"
import { TradeValidationResult } from "../types/Trade"
import { redis } from "../redisClient"

const EPSILON = 0.000001

const roundMoney = (value:number) => {
    return Math.round((value + Number.EPSILON) * 100) / 100
}

const roundQuantity = (value:number) => {
    return Math.floor((value + Number.EPSILON) * 100) / 100
}

type TradeOrderInput = {
    userId:string
    marketId:string
    quantity?:number | undefined
    price?:number | undefined
    amount?:number | undefined
    type:OrderSide
    outcome:OrderOutcome
    orderType:OrderExecutionType
}

const getMarketBuyExecutionPlan = async(marketId:string,outcome:OrderOutcome,budget:number) => {
    const sellDepth = await redis.hgetall(`Depth:${marketId}:${outcome}:SELL`)
    const sellLevels = Object.entries(sellDepth)
        .map(([price,quantity]) => ({
            price:Number(price),
            quantity:Number(quantity)
        }))
        .filter(level => level.price > 0 && level.quantity > 0)
        .sort((a,b) => a.price - b.price)

    let remainingBudget = roundMoney(budget)
    let executableQuantity = 0
    let estimatedActualCost = 0
    let maxExecutablePrice = 0

    for(const level of sellLevels){
        if(remainingBudget <= EPSILON) break

        const affordableQuantity = roundQuantity(remainingBudget / level.price)
        const fillQuantity = roundQuantity(Math.min(level.quantity,affordableQuantity))

        if(fillQuantity <= EPSILON) break

        const cost = roundMoney(fillQuantity * level.price)
        executableQuantity = roundQuantity(executableQuantity + fillQuantity)
        estimatedActualCost = roundMoney(estimatedActualCost + cost)
        remainingBudget = roundMoney(budget - estimatedActualCost)
        maxExecutablePrice = level.price

        if(fillQuantity < level.quantity) break
    }

    return {
        executableQuantity,
        maxExecutablePrice
    }
}

export const validateTradeCriteria = async({userId,marketId,quantity,price,amount,type,outcome,orderType}:TradeOrderInput): Promise<TradeValidationResult> => {
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
            
            if(type === "BUY"){
                const requiredAmount = orderType === "MARKET"
                    ? roundMoney(amount || 0)
                    : roundMoney((quantity || 0) * (price || 0))

                if(requiredAmount <= 0){
                    return {success:false,message:"Invalid trade amount"}
                }

                if(user.wallet && user.wallet.balance >= requiredAmount){
                    return {
                        success: true,
                        walletId : user.wallet.id
                    }
                }

                return {success:false,message:"User has insufficient balance for trade to execute"}
            }

            const shares = Number(quantity || 0)

            if(shares <= 0){
                return {success:false,message:"Invalid trade quantity"}
            }

            const holdings = await tx.holdings.findUnique({
                where:{userId_marketId_outcome:{userId,marketId,outcome}}
            })

            if(holdings && holdings.shares >= shares){
                return {
                    success: true
                }
            }

            return {success:false,message:"Insufficient shares to place SELL order"}
        }else{
            return {success:false,message:`Market has already been resolved for this marketId ${marketId}`}
        }
    })

    return result
}

export const placeOrder = async ({userId,marketId,quantity,price,amount,type,outcome,orderType}:TradeOrderInput) => {
    try {
        let orderQuantity:number
        let orderPrice:number
        let lockAmount = 0

        if(type === "BUY" && orderType === "MARKET"){
            const budget = roundMoney(amount || 0)

            if(budget <= 0){
                return {ok:false,message:"Invalid trade amount"}
            }

            const plan = await getMarketBuyExecutionPlan(marketId,outcome,budget)

            if(plan.executableQuantity <= EPSILON || plan.maxExecutablePrice <= 0){
                return {ok:false,message:"No liquidity available"}
            }

            orderQuantity = plan.executableQuantity
            orderPrice = plan.maxExecutablePrice
            lockAmount = budget
        }else{
            if(quantity === undefined || price === undefined){
                return {ok:false,message:"Invalid trade quantity or price"}
            }

            orderQuantity = quantity
            orderPrice = price
            lockAmount = roundMoney(orderQuantity * orderPrice)
        }

        const result = await prisma.$transaction(async (tx) => {
            let updatedWallet = null
            if (type == "BUY") {
                const wallet = await tx.wallet.findUnique({
                    where: { userID: userId },
                });

                if (!wallet) {
                    throw new Error("Wallet not found");
                }
                if(wallet.balance < lockAmount){
                    throw new Error("Insufficient balance to place BUY order")
                }
                updatedWallet = await tx.wallet.update({
                    where: { userID: userId },
                    data: {
                        balance: { decrement: lockAmount },
                        locked: { increment: lockAmount },
                    },
                });
                await tx.transaction.create({
                    data: {
                        type: "TRADE_LOCK",
                        amount: lockAmount,
                        description: `LOCKED IN $${lockAmount.toFixed(2)} FOR TRADE`,
                        walletId: wallet.id,
                    },
                });
            } else if (type === "SELL") {
                const holdings = await tx.holdings.findUnique({
                    where: { userId_marketId_outcome: { userId, marketId,outcome } },
                });

                if (!holdings || holdings.shares < orderQuantity) {
                    throw new Error("Insufficient shares to place SELL order");
                }

                await tx.holdings.update({
                    where: { id: holdings.id },
                    data: {
                        shares: { decrement: orderQuantity },
                        lockedShares: {increment: orderQuantity}
                    },
                });
            }
            const order = await tx.order.create({data:{
                userId:userId,
                marketId:marketId,
                quantity:orderQuantity,
                remainingQuantity:orderQuantity,
                price:orderPrice,
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
        const queuedOrder = type === "BUY" && orderType === "MARKET"
            ? {...result.order,amount:lockAmount}
            : result.order
        await redis.lpush(`globalOrdersQueue`,JSON.stringify({type:"PLACE_ORDER",payload:queuedOrder}))
        return {ok:true,order:result.order}
    } catch (error) {
        if(error instanceof Error){
            return {ok:false,message:error.message || "UNKNOWN ERROR WHILE PLACING ORDER"}
        }
    }
}
