import { Request, Response } from "express";
import { tradeSchema } from "../Schemas/trade";
import prisma from "../prisma";
import { placeOrder, validateTradeCriteria } from "../services/tradeLogic";
import { redis } from "../redisClient";

export const handlePostTrade = async(req: Request,res:Response) => {
    const {quantity,price,type,outcome,userId,marketId,orderType}  = tradeSchema.parse(req.body)
    const result = await validateTradeCriteria(userId,marketId,quantity,price)
    if(result && result.success === true){
        const order = await placeOrder(userId,marketId,quantity,price,type,outcome,orderType,result.walletId) 
        return res.status(200).json(order)
    }else{
        return res.status(400).json(result)
    }
}

export const handleGetTradeChartData = async(req:Request,res:Response) => {
    const marketId: string|undefined = req.params.marketId
    try{
        if(!marketId) return res.status(400).json({message:"No Market ID Found"})
        const market = await prisma.market.findUnique({
            where:{
                id:marketId
            }
        })
        if(!market) return res.status(400).json({message:"Market Not Found"})
        const chartData = await prisma.trade.findMany({
            where:{
                marketId:marketId
            },
            select:{
                price:true,
                createdAt:true
            },
            take:100,
            orderBy:{
                createdAt:"desc"
            }
        })
        return res.status(200).json({marketId:marketId,chartData:chartData.reverse().map(t => ({time:t.createdAt,price:t.price*100}))})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:`Couldn't get chartData for marketId ${marketId}`,error:JSON.stringify(error)})
    }
}

export const handleGetOrderBookData = async(req:Request,res:Response) => {
    const marketId: string|undefined = req.params.marketId
    try{
        if(!marketId) return res.status(400).json({message:"No Market ID Found"})
        
        const market = await prisma.market.findUnique({
            where:{
                id:marketId
            }
        })

        if(!market) return res.status(400).json({message:"Market Not Found"})
        const [yesBuyRaw,yesSellRaw,noBuyRaw,noSellRaw] = await Promise.all([
            await redis.hgetall(`Depth:${marketId}:YES:BUY`),
            await redis.hgetall(`Depth:${marketId}:YES:SELL`),
            await redis.hgetall(`Depth:${marketId}:NO:BUY`),
            await redis.hgetall(`Depth:${marketId}:NO:SELL`)
        ])
        const yesBuy = Object.fromEntries(
            Object.entries(yesBuyRaw).map(([price,qty]: [string,string]) => [String(price),Number(qty)])
        )
        const yesSell = Object.fromEntries(
            Object.entries(yesSellRaw).map(([price,qty]: [string,string]) => [String(price),Number(qty)])
        )
        const noBuy = Object.fromEntries(
            Object.entries(noBuyRaw).map(([price,qty]: [string,string]) => [String(price),Number(qty)])
        )
        const noSell = Object.fromEntries(
            Object.entries(noSellRaw).map(([price,qty]: [string,string]) => [String(price),Number(qty)])
        )
        const orderBook = {
            "YES":{"BUY":yesBuy,"SELL":yesSell},
            "NO":{"BUY":noBuy,"SELL":noSell}
        }
        return res.status(200).json({marketId:marketId,orderBook:orderBook})

    }catch(error){
        console.log(error)
        return res.status(500).json({message:`Couldn't get orderBookData for marketId ${marketId}`,error:JSON.stringify(error)})
    }
}

// {
//         "YES":{"BUY":{},"SELL":{}},
//         "NO":{"BUY":{},"SELL":{}}
//     }