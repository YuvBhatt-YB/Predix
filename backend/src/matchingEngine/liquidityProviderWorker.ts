import Redis from "ioredis"
import prisma from "../prisma"
import { createRedisClient } from "./redis"
import { object } from "zod"
import { Depth } from "../types/Trade"


export const runLiquidityProviderWorker = async(markets: string[]) => {
    console.log(`Liquidity Provider Worker started for ${markets.length} markets.`)
    console.log(`Liquidity Provider Worker Markets ${markets} `)
    console.log(markets)
    const liquidityClient = createRedisClient()
    const commandClient = createRedisClient()
    await liquidityClient.subscribe("LP_TRIGGER")
    const BOT_NAME = `LP_BOT`
    const bot = await prisma.user.findUnique({
        where:{
            username:BOT_NAME
        }
    })
    if(!bot){
        console.error("Liquidity Provider Bot doesn't exists")
        return
    }
    const BOT_ID = bot.id
    try{
        const dirtyMarkets: Set<string> = new Set()
        const processingMarkets: Set<string> = new Set()

        liquidityClient.on("message",(_,marketId) => {
            dirtyMarkets.add(marketId)
            console.log(dirtyMarkets)
        })

        setInterval(() => {
            const marketToProcess = Array.from(dirtyMarkets)
            dirtyMarkets.clear()
            for(const marketId of marketToProcess){
                safeRebalance(marketId,BOT_ID,processingMarkets,commandClient)
            }
            
        }, 50);

        setInterval(()=>{
            for(const marketId of markets){
                if(!dirtyMarkets.has(marketId)){
                    safeRebalance(marketId,BOT_ID,processingMarkets,commandClient)
                }
            }
        },2000)
    }catch(error){
        console.error(`Error in Liquidity Provider Worker : ${error}`)
    }
}
const safeRebalance = async(marketId:string,BOT_ID:string,processingMarkets: Set<string>,commandClient:Redis) => {
    if(processingMarkets.has(marketId)) return

    processingMarkets.add(marketId)

    try{
        console.log("Rebalancing Market"+marketId)
        await rebalanceMarket(marketId,BOT_ID,commandClient)
    }catch(error){
        console.error(`Rebalancing failed for Market ${marketId}`)
    }finally{
        processingMarkets.delete(marketId)
    }
}
const rebalanceMarket = async(marketId: string,BOT_ID:string,commandClient:Redis) => {
    console.log("Entered rebalanceMarket", marketId)
    
    const holding = await findHolding(BOT_ID,marketId)
    if(!holding){
        //create holding
        await createHolding(BOT_ID,marketId)
    }
    
    //get Depth
    const depth: Depth = await getDepth(marketId,commandClient)
    console.log(depth)
    
    //compute Anchor
    const bestYesBid = getBestBid(depth.YES.BUY)
    const bestYesAsk = getBestAsk(depth.YES.SELL)

    console.log(`Best Bid & Ask for market ${bestYesAsk} , ${bestYesBid}`)
    
    const anchor = await computeAnchor(bestYesBid,bestYesAsk,0.02,marketId)
    console.log(`Anchor for  ${marketId} is : ${anchor}`)
    if(!anchor) return

    
    //generate Ladders
    const yesLadder = generateLadder(0.02,3,anchor)
    console.log(yesLadder)
}

const getDepth = async(marketId:string,commandClient:Redis) => {
    const yesBuyRaw = await commandClient.hgetall(`Depth:${marketId}:YES:BUY`)
    const yesSellRaw = await commandClient.hgetall(`Depth:${marketId}:YES:SELL`)
    const noBuyRaw = await commandClient.hgetall(`Depth:${marketId}:NO:BUY`)
    const noSellRaw = await commandClient.hgetall(`Depth:${marketId}:NO:SELL`)

    const parse = (raw:Record<string,string>) => {
        if(!raw || Object.keys(raw).length === 0) return {}
        return Object.fromEntries(Object.entries(raw).map(([price,quantity]) => [Number(price),Number(quantity)]))
    }

    return {
        "YES":{
            "BUY":parse(yesBuyRaw),
            "SELL":parse(yesSellRaw)
        },
        "NO":{
            "BUY":parse(noBuyRaw),
            "SELL":parse(noSellRaw)
        }
    }

}
const generateLadder = (tick:number,levels:number,anchorPrice:number) => {
    const buyLevels = []
    const sellLevels = []

    for(let i = 1;i<=levels;i++){
        buyLevels.push(Number((anchorPrice - i*tick).toFixed(2)))
        sellLevels.push(Number((anchorPrice + i*tick).toFixed(2)))
    }

    return {
        "BUY":buyLevels,
        "SELL":sellLevels
    }
}
const computeAnchor = async(bestBid:number|undefined,bestAsk:number|undefined,tick:number,marketId:string) => {
    const marketData = await prisma.market.findUnique({where:{id:marketId},select:{initialPriceYes:true}})
    const initialProbability = marketData?.initialPriceYes
    if(initialProbability === undefined) return 
    let anchor
    if(bestBid !== undefined && bestAsk !== undefined){
        anchor = (bestBid+bestAsk)/2
    }else if (bestBid !== undefined){
        anchor = bestBid + tick
    }else if (bestAsk !== undefined){
        anchor = bestAsk - tick
    }else{
        anchor = initialProbability
    }

    return Number(anchor.toFixed(2))
}
const getBestBid = (ordersObj: {}) => {
    const prices = Object.keys(ordersObj).map(Number)

    const bestBid = prices.length ? Math.max(...prices) : undefined

    return bestBid
}
const getBestAsk = (ordersObj: {}) => {
    const prices = Object.keys(ordersObj).map(Number)

    const bestAsk = prices.length ? Math.min(...prices) : undefined

    return bestAsk
}
const findHolding = async(BOT_ID:string,marketId:string) => {
    console.log("Finding holding for:", BOT_ID, marketId)
    const holdings = await prisma.holdings.findUnique({
        where:{
            userId_marketId:{
                userId:BOT_ID,
                marketId:marketId
            }
        }
    })

    return holdings
}


const createHolding = async(BOT_ID:string,marketId:string) => {
    const AVG_PRICE = await getReferencePrice(marketId) || 0.5
    const MAX_INVENTORY = 40000
    await prisma.holdings.create({
        data:{
            userId:BOT_ID,
            marketId:marketId,
            avgPrice:AVG_PRICE,
            shares:MAX_INVENTORY/2,
        }
    })
}



const getReferencePrice = async(marketId:string) => {
    const price = await prisma.market.findUnique({
        where:{
            id:marketId
        },
        select:{
            currentPriceYes:true
        }
    })
    if(!price) console.error(" Market not found or market doesnt have initial price set") 
    return price?.currentPriceYes ?? 0.5
}


export const ensureBotSetup = async() => {
    const BOT_ID = "LP_BOT"
    const BOT_PASSWORD = "NO_LOGIN"
    const BOT_EMAIL = "bot@email.com"
    const BOT_BALANCE = 10000000

    const botExists = await prisma.user.findUnique({
        where:{
            username:BOT_ID
        }
    })

    if(!botExists){
        await prisma.user.create({
            data:{
                username:BOT_ID,
                password:BOT_PASSWORD,
                profileImg:"",
                email:BOT_EMAIL
            }
        })
        console.log("LP BOT User Created")
    }
    if(!botExists) {
        console.error("LP_BOT doesn't exists")
        return
    } 
    const walletExists = await prisma.wallet.findUnique({
        where:{
            userID:botExists.id
        }
    })


    if(!walletExists){
        await prisma.wallet.create({
            data:{
                userID:botExists.id,
                balance:BOT_BALANCE,
                locked:0
            }
        })
        console.log("LP BOT Wallet Created")
    }
}