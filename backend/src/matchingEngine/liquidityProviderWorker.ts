import Redis from "ioredis"
import prisma from "../prisma"
import { createRedisClient } from "./redis"
import { object } from "zod"
import { Depth, DesiredOrder, DesiredOrders, Ladder, Order } from "../types/Trade"
import { BOT, LP_CONFIG } from "./LP_CONFIG"


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
    
    let holdings = await findHolding(BOT_ID,marketId)
    if(!holdings.YES || !holdings.NO){
        //create holding
        await createHolding(BOT_ID,marketId)
        holdings = await findHolding(BOT_ID,marketId)
    }
    
    //get Depth
    const depth: Depth = await getDepth(marketId,commandClient)
    console.log(depth)
    
    //compute Anchor
    const bestYesBid = getBestBid(depth.YES.BUY)
    const bestYesAsk = getBestAsk(depth.YES.SELL)
    const bestNoBid = getBestBid(depth.NO.BUY)
    const bestNoAsk = getBestAsk(depth.NO.SELL)

    console.log(`Best Yes Bid & Ask for market ${bestYesAsk} , ${bestYesBid}`)
    console.log(`Best No Bid & Ask for market ${bestNoAsk} , ${bestNoBid}`)

    const yesAnchor = await computeAnchor(bestYesBid,bestYesAsk,LP_CONFIG.tick,marketId)
    const noAnchor = await computeAnchor(bestNoBid,bestNoAsk,LP_CONFIG.tick,marketId)
    console.log(`Yes Anchor for  ${marketId} is : ${yesAnchor}`)
    console.log(`No Anchor for  ${marketId} is : ${noAnchor}`)
    if(!yesAnchor) return
    if(!noAnchor) return
    
    //inventory skew
    const yesTotal = (holdings.YES?.shares || 0) + (holdings.YES?.lockedShares || 0)
    const noTotal = (holdings.NO?.shares || 0) + (holdings.NO?.lockedShares || 0)
    const inventory = yesTotal - noTotal
    const skew = generateSkew(inventory,LP_CONFIG.maxInventory)
    const shift = skew * LP_CONFIG.maxShift


    const yesAdjustedAnchor = yesAnchor - shift
    const noAdjustedAnchor = noAnchor - shift
    
    //quantity skew
    const buySize = Math.max(10,LP_CONFIG.baseOrderSize * (1 - skew))
    const sellSize = Math.max(10,LP_CONFIG.baseOrderSize * (1 + skew))

    console.log(`Inventory: ${inventory}, Skew: ${skew}, Shift: ${shift}`)
    console.log(`Buy Size: ${buySize}, Sell Size: ${sellSize}`)
    console.log(`Yes Adjusted Anchor: ${yesAdjustedAnchor}, No Adjusted Anchor: ${noAdjustedAnchor}`)

    //generate Ladders
    const yesLadder:Ladder = generateLadder(LP_CONFIG.tick,LP_CONFIG.levels,yesAdjustedAnchor)
    const noLadder:Ladder = generateLadder(LP_CONFIG.tick,LP_CONFIG.levels,noAdjustedAnchor)
    
    //generate initial desired orders
    const desiredOrders = generateDesiredOrders(yesLadder,noLadder,BOT_ID,marketId,buySize,sellSize)

    //generate final desired orders
    const finalDesiredOrders = await compareAndCreateFinalDesiredOrders(BOT_ID,marketId,desiredOrders)

    console.log(yesLadder)
    console.log(noLadder)
    console.log(finalDesiredOrders)
    
}

const normalizePrice = (price: number) => Number(price.toFixed(2)) 
const compareAndCreateFinalDesiredOrders = async(BOT_ID:string,marketId:string,desiredOrders:DesiredOrders) => {
    const toCreate = []
    const toCancel = []
    const allDesired = [...desiredOrders.YES,...desiredOrders.NO]
    const existingOrdersMap = new Map()

    const existingOrders = await prisma.order.findMany({
        where:{
            userId:BOT_ID,
            marketId:marketId,
            status:"OPEN"
        }
    })
    if(existingOrders.length === 0){
        for (const order of allDesired){
            toCreate.push(order)
        }
        return {
            CREATE:toCreate,
            CANCEL:[]
        }
    }else{
        for(const order of existingOrders){
            const key = `${order.outcome}-${order.type}-${normalizePrice(order.price)}`
            existingOrdersMap.set(key,order)
        }

        for (const order of allDesired){
            const key = `${order.outcome}-${order.type}-${normalizePrice(order.price)}`
            if(!existingOrdersMap.has(key)){
                toCreate.push(order)
            }else{
                const existingOrder:Order = existingOrdersMap.get(key)
                if(Math.abs(existingOrder.remainingQuantity - order.quantity) > 0.0001){
                    toCancel.push(existingOrder)
                    toCreate.push(order)
                }

                existingOrdersMap.delete(key)
            }
        }

        for(const [_,order] of existingOrdersMap){
            toCancel.push(order)
        }

        return {
            CREATE:toCreate,
            CANCEL:toCancel
        }
    }
}
const generateDesiredOrders = (yesLadder:Ladder,noLadder:Ladder,BOT_ID:string,marketId:string,buySize:number,sellSize:number) => {
    const desiredYesOrders: DesiredOrder[] = []
    const desiredNoOrders: DesiredOrder[] = []

    for(const price of yesLadder.BUY){
        desiredYesOrders.push({
            userId:BOT_ID,
            marketId:marketId,
            type:"BUY",
            orderType:"LIMIT",
            outcome:"YES",
            quantity:buySize,
            price:price,
            status:"OPEN",
            createdAt:new Date().toISOString()
        })
    }
    for(const price of yesLadder.SELL){
        desiredYesOrders.push({
            userId:BOT_ID,
            marketId:marketId,
            type:"SELL",
            orderType:"LIMIT",
            outcome:"YES",
            quantity:sellSize,
            price:price,
            status:"OPEN",
            createdAt:new Date().toISOString()
        })
    }
    for(const price of noLadder.BUY){
        desiredNoOrders.push({
            userId:BOT_ID,
            marketId:marketId,
            type:"BUY",
            orderType:"LIMIT",
            outcome:"NO",
            quantity:buySize,
            price:price,
            status:"OPEN",
            createdAt:new Date().toISOString()
        })
    }
    for(const price of noLadder.SELL){
        desiredNoOrders.push({
            userId:BOT_ID,
            marketId:marketId,
            type:"SELL",
            orderType:"LIMIT",
            outcome:"NO",
            quantity:sellSize,
            price:price,
            status:"OPEN",
            createdAt:new Date().toISOString()
        })
    }

    return {
        YES:desiredYesOrders,
        NO:desiredNoOrders
    }
}
const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value,min),max)
}

const generateSkew = (inventory: number,maxInventory:number) => {
    return clamp(inventory/maxInventory,-1,1)
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
    const holdings = await prisma.holdings.findMany({
        where:{
            userId:BOT_ID,
            marketId:marketId
        }
    })

    const yesHoldings = holdings.find(h => h.outcome === "YES")
    const noHoldings = holdings.find(h => h.outcome === "NO")

    return {
        YES:yesHoldings,
        NO:noHoldings
    }
}


const createHolding = async(BOT_ID:string,marketId:string) => {
    const AVG_PRICE = await getReferencePrice(marketId) || 0.5
    const MAX_INVENTORY = 40000
    await prisma.holdings.createMany({
        data:[
            {
                userId:BOT_ID,
                marketId:marketId,
                outcome:"YES",
                shares:MAX_INVENTORY/2,
                avgPrice:AVG_PRICE
            },
            {
                userId:BOT_ID,
                marketId:marketId,
                outcome:"NO",
                shares:MAX_INVENTORY/2,
                avgPrice:AVG_PRICE
            }
        ]
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

    const botExists = await prisma.user.findUnique({
        where:{
            username:BOT.id
        }
    })

    if(!botExists){
        await prisma.user.create({
            data:{
                username:BOT.id,
                password:BOT.password,
                profileImg:"",
                email:BOT.email,
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
                balance:BOT.balance,
                locked:0
            }
        })
        console.log("LP BOT Wallet Created")
    }
}