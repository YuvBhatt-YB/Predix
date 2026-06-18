import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { createPriceFetchClient } from "../redisClient";



export const handleGetPositions = async(req:Request,res:Response) => {
    const {userId} = req.params
    let redis
    try{
        if(!userId){
            return res.status(400).json({message:"No User ID Found"})
        }
        
        const positions = await prisma.holdings.findMany({
            where:{
                userId:userId,
                shares:{gt:0}
            },
            include:{
                market:true
            },
            orderBy:{
                createdAt:"desc"
            }
        })
        console.log(positions)

        if(positions.length === 0){
            return res.status(200).json({positions:[]})
        }
        redis = createPriceFetchClient()

        const pipeline = redis.pipeline()

        for(const position of positions){
            pipeline.get(`MARKET_PRICE:${position.marketId}:${position.outcome}`)
        }

        const redisResults = await pipeline.exec()

        const formattedPositions = positions.map((position,index) => {
            const redisPrice = redisResults?.[index]?.[1]
            const currentPrice = redisPrice ? Number(redisPrice) : position.avgPrice
            const shares = Number(position.shares)
            const lockedShares = Number(position.lockedShares)
            const availableShares = shares - lockedShares
            const investedAmount = shares*Number(position.avgPrice)
            const currentValue = shares*currentPrice
            const pnl = currentValue - investedAmount
            const pnlPercent = investedAmount > 0 ? (pnl/investedAmount)*100 : 0

            return {
                id:position.id,
                marketId:position.marketId,
                marketTitle:position.market.title,
                marketImg:position.market.image,
                outcome:position.outcome,
                shares,
                lockedShares,
                availableShares,
                avgPrice:Number(position.avgPrice.toFixed(4)),
                currentPrice:Number(currentPrice.toFixed(4)),
                investedAmount:Number(investedAmount.toFixed(2)),
                currentValue:Number(currentValue.toFixed(2)),
                pnl:Number(pnl.toFixed(2)),
                pnlPercent:Number(pnlPercent.toFixed(2)),

                displayAvgPrice:`${Math.round(position.avgPrice*100)}¢`,
                displayCurrentPrice:`${Math.round(currentPrice*100)}¢`,
                displayInvestedAmount:`$${investedAmount.toFixed(2)}`,
                displayCurrentValue:`$${currentValue.toFixed(2)}`,
                displayPnl:`${pnl>=0?"+":"-"}$${Math.abs(pnl).toFixed(2)}`,
                displayPnlPercent:`${pnlPercent >=0 ? "+":""}${pnlPercent.toFixed(2)}`
            }


        })

        

        console.log(redisResults)
        
        return res.status(200).json({positions:formattedPositions})
    }catch(err){
        console.error(err)
        return res.status(500).json(
            {message:"Failed to fetch User Positions"}
        )
    }finally{
        if(redis){
            await redis.quit()
        }
    }
}

export const handleGetOpenOrders = async(req:Request,res:Response) => {
    const {userId} = req.params
    try{
        if(!userId){
            return res.status(400).json({message:"No User ID Found"})
        }
        
        const openOrders = await prisma.order.findMany({
            where:{
                userId:userId,
                status:{
                    in:["OPEN","PARTIAL"]
                },
                orderType:"LIMIT",
                remainingQuantity:{
                    gt:0
                }
            },
            include:{
                market:{
                    select:{
                        title:true,
                        image:true
                    }
                }
            },
            orderBy:{
                createdAt:"desc"
            }
        })

        if(openOrders.length === 0){
            return res.status(200).json({openOrders:[]})
        }
        
        const formattedOpenOrders = openOrders.map((order) => {
            const filledQuantity = order.quantity - order.remainingQuantity
            return {
                ...order,
                filledQuantity,
                displayPrice: `${Math.round(order.price * 100)}¢`,
                displayCreatedAt: order.createdAt.toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                })
            };
        })
        
        return res.status(200).json({message:"Successfully fetched open orders",openOrders:formattedOpenOrders})
    }catch(err){
        console.error(err)
        return res.status(500).json(
            {message:"Failed to fetch User Open Orders"}
        )
    }
}

export const handleGetTrades = async(req:Request,res:Response) => {
    const {userId} = req.params
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20

    const skip = (page-1)*limit
    try{
        if(!userId){
            return res.status(400).json({message:"No User ID Found"})
        }
        
        const trades = await prisma.trade.findMany({
            where:{
                OR:[
                    {buyerId:userId},
                    {sellerId:userId}
                ]
            },
            include:{
                market:{
                    select:{
                        id:true,
                        title:true,
                        image:true
                    }
                }
            }
            ,
            orderBy:{
                createdAt:"desc"
            },
            skip,
            take:limit+1
        })
        console.log(trades)

        if(trades.length === 0){
            return res.status(200).json({trades:[],hasMore:false,page:page,limit:limit})
        }

        const hasMore = trades.length > limit
          const formattedTrades = trades.slice(0,limit).map(trade => {
            const side = trade.buyerId === userId ? "BUY" : "SELL"
            const amount = trade.price * trade.quantity

            return {
                id:trade.id,
                marketId:trade.marketId,
                marketTitle:trade.market.title,
                marketImage:trade.market.image,
                side,
                outcome:trade.outcome,
                price:trade.price,
                displayPrice:`${Math.round(trade.price*100)}¢`,
                quantity:trade.quantity,
                amount:Number(amount.toFixed(2)),
                displayAmount:`$${amount.toFixed(2)}`,
                createdAt:trade.createdAt,
                displayDate:trade.createdAt.toLocaleString("en-IN",{
                    day:"2-digit",
                    month:"short",
                    year:"numeric",
                    hour:"numeric",
                    minute:"2-digit",
                    hour12:true
                })
            }
        })
        
        return res.status(200).json({trades:formattedTrades,hasMore:hasMore,page:page,limit:limit})
    }catch(err){
        console.error(err)
        return res.status(500).json(
            {message:"Failed to fetch User Trades"}
        )
    }
}

export const handleGetUserStats = async(req:Request,res:Response) => {
    const {userId} = req.params
    let redis
    try{
        if(!userId){
            return res.status(400).json({message:"No User ID Found"})
        }
        let pnl:number = 0
        const positions = await prisma.holdings.findMany({
            where:{
                userId:userId,
                shares:{gt:0}
            },
            orderBy:{
                createdAt:"desc"
            }
        })
        console.log(positions)
        if (positions.length === 0) {
            const marketsTraded = await prisma.trade.groupBy({
                by: ["marketId"],
                where: {
                    OR: [{ buyerId: userId }, { sellerId: userId }],
                },
            });

            return res.status(200).json({
                message: "Successfully fetched User Stats",
                stats: {
                    profitLoss: 0,
                    displayProfitLoss: "$0.00",
                    marketsTraded: marketsTraded.length,
                },
            });
        }
        redis = createPriceFetchClient()

        const pipeline = redis.pipeline()

        for(const position of positions){
            pipeline.get(`MARKET_PRICE:${position.marketId}:${position.outcome}`)
        }

        const redisResults = await pipeline.exec()
        
        positions.forEach((position,index) => {
            const redisPrice = redisResults?.[index]?.[1]
            const currentPrice = redisPrice ? Number(redisPrice) : position.avgPrice
            const shares = Number(position.shares)
            const investedAmount = shares*Number(position.avgPrice)
            const currentValue = shares*currentPrice
            const pnlPerPosition = currentValue - investedAmount
            pnl+=pnlPerPosition
        })

        

        console.log(redisResults)
        console.log(pnl)

        const marketsTraded = await prisma.trade.groupBy({
            by:["marketId"],
            where:{
                OR:[
                    {buyerId:userId},
                    {sellerId:userId}
                ]
            }
        })

        console.log(marketsTraded)

        const formattedPnl = pnl > 0 ? `+$${Math.abs(pnl).toFixed(2)}` : pnl < 0 ? `-$${Math.abs(pnl).toFixed(2)}` : "$0.0"
        
        const stats = {
            profitLoss:Number(pnl.toFixed(2)),
            displayProfitLoss:formattedPnl,
            marketsTraded:marketsTraded.length
        }
        
        return res.status(200).json({message:"Successfully fetched User Stats",stats:stats})
    }catch(err){
        console.error(err)
        return res.status(500).json(
            {message:"Failed to fetch User Stats"}
        )
    }finally{
        if(redis){
            await redis.quit()
        }
    }
}
