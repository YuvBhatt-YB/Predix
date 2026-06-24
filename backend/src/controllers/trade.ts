import { Request, Response } from "express";
import { tradeSchema } from "../Schemas/trade";
import prisma from "../prisma";
import { placeOrder, validateTradeCriteria } from "../services/tradeLogic";
import { redis } from "../redisClient";
import { getParamString } from "../services/paramsHelper";

const rebuildMarketDepthFromOrderBook = async(marketId:string) => {
    for(const outcome of ["YES","NO"]){
        for(const side of ["BUY","SELL"]){
            const orderBookKey = `ORDERBOOK:${marketId}:${outcome}:${side}`
            const depthKey = `Depth:${marketId}:${outcome}:${side}`
            const orderIds = await redis.zrange(orderBookKey,0,-1)
            const priceLevels = new Map<string,number>()

            await redis.del(depthKey)

            if(!orderIds || orderIds.length === 0) continue

            const orderPipeline = redis.pipeline()
            for(const orderId of orderIds){
                orderPipeline.hgetall(`Order:${orderId}`)
            }

            const orderResults = await orderPipeline.exec()
            const writePipeline = redis.pipeline()

            for(let i = 0; i < orderIds.length; i++){
                const orderId = orderIds[i]
                const result = orderResults?.[i]
                if(!orderId || !result) continue

                const [error,rawOrder] = result
                const order = rawOrder as Record<string,string>

                if(error || !order || Object.keys(order).length === 0){
                    writePipeline.zrem(orderBookKey,orderId)
                    continue
                }

                const remainingQuantity = Number(order.remainingQuantity)
                const price = Number(order.price)
                const isExecutableOrder =
                    order.marketId === marketId &&
                    order.outcome === outcome &&
                    order.type === side &&
                    typeof order.status === "string" &&
                    ["OPEN","PARTIAL"].includes(order.status) &&
                    Number.isFinite(remainingQuantity) &&
                    Number.isFinite(price) &&
                    remainingQuantity > 0 &&
                    price > 0

                if(!isExecutableOrder){
                    writePipeline.zrem(orderBookKey,orderId)
                    continue
                }

                const priceKey = String(price)
                priceLevels.set(priceKey,(priceLevels.get(priceKey) || 0) + remainingQuantity)
            }

            for(const [price,quantity] of priceLevels){
                writePipeline.hset(depthKey,price,quantity)
            }

            await writePipeline.exec()
        }
    }
}

export const handlePostTrade = async(req: Request,res:Response) => {
    try {
        const trade = tradeSchema.parse(req.body);
        const result = await validateTradeCriteria({
            userId: trade.userId,
            marketId: trade.marketId,
            quantity: trade.quantity,
            price: trade.price,
            amount: trade.amount,
            type: trade.type,
            outcome: trade.outcome,
            orderType: trade.orderType,
        });
        if (!result || result.success !== true) {
            return res.status(400).json({
                ok: false,
                message: result?.message || "Invalid trade criteria",
            });
        }
        const order = await placeOrder({
            userId: trade.userId,
            marketId: trade.marketId,
            quantity: trade.quantity,
            price: trade.price,
            amount: trade.amount,
            type: trade.type,
            outcome: trade.outcome,
            orderType: trade.orderType,
        });
        if (!order?.ok) {
            return res.status(400).json(order);
        }
        return res.status(200).json(order);
    } catch (error) {
        console.error(error)
        return res.status(400).json({
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to place order",
        });
    }
}

export const handleGetTradeChartData = async(req:Request,res:Response) => {
    const marketId = getParamString(req,"marketId")
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
    const marketId = getParamString(req,"marketId")
    try{
        if(!marketId) return res.status(400).json({message:"No Market ID Found"})
        
        const market = await prisma.market.findUnique({
            where:{
                id:marketId
            }
        })

        if(!market) return res.status(400).json({message:"Market Not Found"})
        await rebuildMarketDepthFromOrderBook(marketId)
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


export const handleCancelTrade = async(req:Request,res:Response) => {
    const orderId = getParamString(req,"orderId")
    try{
        if(!orderId){
            return res.status(400).json({message:"Order ID is required"})
        }

        const order = await prisma.order.findUnique({
            where:{
                id:orderId
            }
        })

        if(!order){
            return res.status(403).json({message:"Order not found"})
        }

        if(order.status !== "OPEN" && order.status !== "PARTIAL"){
            return res.status(400).json({message:"  You cannot cancel this order"})
        }

        await redis.lpush("globalOrdersQueue",JSON.stringify({type:"CANCEL_ORDER",payload:{orderId:order.id,userId:order.userId,marketId:order.marketId}}))

        return res.status(202).json({message:`Order canceled request received`,orderId})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:`Couldn't cancel trade`,error:JSON.stringify(error)})
    }
}
