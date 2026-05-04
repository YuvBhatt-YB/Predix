import Redis from "ioredis"
import prisma from "../prisma"
import { createRedisClient } from "./redis"
import { includes, object } from "zod"
import { Depth, depthAddedEventType, depthUpdatedEventType, DesiredOrder, DesiredOrders, FinalDesiredOrders, Ladder, marketBroadcastEventType, Order } from "../types/Trade"
import { BOT, LP_CONFIG } from "./LP_CONFIG"
import { addAndUpdatePriceDepth, addOrderToRedisQueue } from "./engine"
import { OrderOutcome } from "@prisma/client"


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
            
        }, 300);

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
const clampPrice = (p:number) => {
    return Number(Math.min(Math.max(p,0.01),0.99).toFixed(2))
}

const clampAnchor = (price:number) => {
    return Math.max(0.05,Math.min(0.95,price))
}

const getLPstate = async(marketId:string,redis:Redis) => {
    const data = await redis.hgetall(`LP_STATE:${marketId}`)
    if(!data || Object.keys(data).length === 0) return null

    return {
        anchor:Number(data.anchor),
        skew:Number(data.skew),
        lastUpdate:Number(data.lastUpdate || 0)
    }
}
const setLPState = async(marketId:string,redis:Redis,anchor:number,skew:number) => {
    await redis.hset(`LP_STATE:${marketId}`,{
        anchor:anchor.toString(),
        skew:skew.toString(),
        lastUpdate:Date.now().toString()
    })
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
    
    if(Math.abs(inventory) > LP_CONFIG.maxInventory * 2){
        console.log("Inventory EXTREME - resetting LP")

        const existingOrders = await prisma.order.findMany({
            where:{
                userId:BOT_ID,
                marketId,
                status:"OPEN"
            }
        })

        await Promise.all(existingOrders.map(order => cancelOrder({...order,createdAt:order.createdAt.toISOString()},commandClient)))

        return
    }


    let adjustedInventory = inventory

    if(Math.abs(inventory) > LP_CONFIG.maxInventory * 1.5){
        console.log("Inventory too large, reducing aggression")
        adjustedInventory = inventory * 0.5
    }

    const rawSkew = generateSkew(adjustedInventory,LP_CONFIG.maxInventory * 2)
    const skew = rawSkew * 0.4
    const shift = skew * (LP_CONFIG.maxShift * 0.5)


    const yesAdjustedAnchor = clampAnchor(inventory > 0 ? yesAnchor - shift : yesAnchor + shift)
    const noAdjustedAnchor = clampAnchor(inventory > 0 ? noAnchor + shift : noAnchor - shift)

    const prevState = await getLPstate(marketId,commandClient)
    
    const isYesBroken = !bestYesAsk || !bestYesBid
    const isNoBroken = !bestNoAsk || !bestNoBid
    const isBookBroken = isYesBroken || isNoBroken
    
    if (isBookBroken) {
        console.log("Emergency Rebalance: Empty book detected");
    } else {
        if (prevState?.lastUpdate) {
            const timeDiff = Date.now() - prevState.lastUpdate;
            if (timeDiff < LP_CONFIG.minTimeGap) {
                console.log("Skipping Rebalance (CoolDown)");
                return;
            }
        }

        if (prevState) {
            const anchorChange = Math.abs(
                prevState.anchor - Number(yesAdjustedAnchor.toFixed(2)),
            );
            const skewChange = Math.abs(
                prevState.skew - Number(skew.toFixed(4)),
            );

            if (
                anchorChange < LP_CONFIG.minAnchorChange &&
                skewChange < LP_CONFIG.minSkewChange
            ) {
                console.log("Skipping rebalance ( No Significant Change ) ");
                return;
            }
        }
    }
    
    
    //quantity skew
    const buySize = Math.min(LP_CONFIG.maxOrderSize,Math.round(Math.max(2000,LP_CONFIG.baseOrderSize * (1-skew))))
    const sellSize = Math.min(LP_CONFIG.maxOrderSize,Math.round(Math.max(2000,LP_CONFIG.baseOrderSize * (1+skew))))

    console.log(`Inventory: ${inventory}, Skew: ${skew}, Shift: ${shift}`)
    console.log(`Buy Size: ${buySize}, Sell Size: ${sellSize}`)
    console.log(`Yes Adjusted Anchor: ${yesAdjustedAnchor}, No Adjusted Anchor: ${noAdjustedAnchor}`)

    //generate Ladders
    let yesLadder:Ladder = generateLadder(LP_CONFIG.tick,LP_CONFIG.levels,yesAdjustedAnchor)
    let noLadder:Ladder = generateLadder(LP_CONFIG.tick,LP_CONFIG.levels,noAdjustedAnchor)
    if (yesLadder.BUY.length === 0 || yesLadder.SELL.length === 0) {
        console.log("Fixing empty YES ladder");

        // force rebuild around 0.5
        const fallbackAnchor = 0.5;

        yesLadder = generateLadder(
            LP_CONFIG.tick,
            LP_CONFIG.levels,
            fallbackAnchor,
        );
    }
    if (noLadder.BUY.length === 0 || noLadder.SELL.length === 0) {
        console.log("Fixing empty NO ladder");

        // force rebuild around 0.5
        const fallbackAnchor = 0.5;

        noLadder = generateLadder(
            LP_CONFIG.tick,
            LP_CONFIG.levels,
            fallbackAnchor,
        );
    }
    
    //generate initial desired orders
    const desiredOrders = generateDesiredOrders(yesLadder,noLadder,BOT_ID,marketId,buySize,sellSize)

    

    //generate final desired orders
    const finalDesiredOrders: FinalDesiredOrders = await compareAndCreateFinalDesiredOrders(BOT_ID,marketId,desiredOrders)
    
    if(finalDesiredOrders.CREATE.length === 0 && finalDesiredOrders.CANCEL.length === 0){
        await setLPState(marketId,commandClient,Number(yesAdjustedAnchor.toFixed(2)),Number(skew.toFixed(4)))
        return
    }

    try {
        await Promise.all(
            finalDesiredOrders.CANCEL.map((order) =>
                cancelOrder(order, commandClient),
            ),
        );
        

        const createdOrders = await Promise.all(
            finalDesiredOrders.CREATE.map((order) =>
                placeOrder(order, commandClient),
            ),
        );

        const validOrders = createdOrders.filter(o => o !== null)
        console.log(`LP placed ${validOrders.length}/${finalDesiredOrders.CREATE.length} orders`);

        console.log(yesLadder);
        console.log(noLadder);
        console.log(finalDesiredOrders);

        if (validOrders.length === 0) {
            console.log(
                "LP could not place any orders, skipping state update",
            );
            return;
        }
        if (validOrders.length < finalDesiredOrders.CREATE.length * 0.5) {
            console.log("Too many failed orders, possible constraint issue");
        }

        await setLPState(
            marketId,
            commandClient,
            Number(yesAdjustedAnchor.toFixed(2)),
            Number(skew.toFixed(4)),
        );
    } catch (err) {
        console.error("LP Execution Failed", err);
    }
    
}

const normalizePrice = (price: number) => Number(price.toFixed(2)) 

const roundQty = (q:number) => Math.round(q)

const compareAndCreateFinalDesiredOrders = async(BOT_ID:string,marketId:string,desiredOrders:DesiredOrders) => {
    const toCreate: DesiredOrder[] = []
    const toCancel: Order[] = []
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
                if(Math.abs(existingOrder.remainingQuantity - order.quantity) > 1){
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

const normalize = (x:number) => Number(x.toFixed(2))
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
            quantity:roundQty(buySize),
            price:normalize(price),
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
            quantity:roundQty(sellSize),
            price:normalize(price),
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
            quantity:roundQty(buySize),
            price:normalize(price),
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
            quantity:roundQty(sellSize),
            price:normalize(price),
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
        buyLevels.push(clampPrice(anchorPrice - i * tick))
        sellLevels.push(clampPrice(anchorPrice + i * tick))
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
    
    if(!bestBid && !bestAsk){
        return Number(initialProbability.toFixed(2))
    }
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
    if(!price) console.error(" Market not found or market doesn't have initial price set") 
    return price?.currentPriceYes ?? 0.5
}

const placeOrder = async (order: DesiredOrder, commandClient: Redis) => {
    const createdOrder = await prisma.$transaction(async (tx) => {
        let finalQty = order.quantity
        if (order.type === "BUY") {
            
            const wallet = await tx.wallet.findUnique({
                where: {
                    userID: order.userId,
                },
            });
            if (!wallet) {
                console.log("LP:No Wallet Found")
                return null
            }
            const maxAffordQty = Math.floor(wallet.balance/order.price)
            finalQty = Math.min(order.quantity,maxAffordQty)

            if(finalQty <=0) return null
            const amount = finalQty * order.price;
            await tx.wallet.update({
                where: {
                    userID: order.userId,
                },
                data: {
                    balance: { decrement: amount },
                    locked: { increment: amount },
                },
            });
        } else if (order.type === "SELL") {
            
            const holdings = await tx.holdings.findUnique({
                where: {
                    userId_marketId_outcome: {
                        userId: order.userId,
                        marketId: order.marketId,
                        outcome: order.outcome,
                    },
                },
            });
            if (!holdings) {
                console.log("LP:NO Holdings Found, skipping SELL");
                return null
            }
            const availableShares = holdings.shares
            finalQty = Math.min(order.quantity,availableShares)

            if(finalQty <=0) return null
            await tx.holdings.update({
                where: {
                    userId_marketId_outcome: {
                        userId: order.userId,
                        marketId: order.marketId,
                        outcome: order.outcome,
                    },
                },
                data: {
                    shares: { decrement: finalQty},
                    lockedShares: { increment: finalQty },
                },
            });
        }
        return await tx.order.create({
            data: {
                userId: order.userId,
                marketId: order.marketId,
                type: order.type,
                orderType: order.orderType,
                outcome: order.outcome,
                quantity: finalQty,
                remainingQuantity: finalQty,
                price: order.price,
                status: "OPEN",
            },
        });
    });

    if(!createdOrder) return null

    const updatedOrder = {
        ...createdOrder,
        createdAt: createdOrder.createdAt.toISOString(),
    };

    const currKey = `ORDERBOOK:${createdOrder.marketId}:${createdOrder.outcome}:${createdOrder.type}`;
    await addOrderToRedisQueue(updatedOrder, commandClient, currKey);

    const depthLevelAdded: depthAddedEventType[] = [];

    await addAndUpdatePriceDepth(
        createdOrder.marketId,
        createdOrder.outcome,
        createdOrder.type,
        updatedOrder,
        commandClient,
        depthLevelAdded,
    );

    await Promise.all(
        depthLevelAdded.map((level) =>
            commandClient.xadd(
                `MarketDataStream`,
                "*",
                "priceLevelAdded",
                JSON.stringify(level),
            ),
        ),
    );

    return createdOrder;
};

const cancelOrder = async (orderToCancel: Order, commandClient: Redis) => {
    const { id, marketId, type, outcome, userId } = orderToCancel;
    await prisma.$transaction(async (tx) => {
        if (type === "BUY") {
            const refund =
                orderToCancel.remainingQuantity * orderToCancel.price;

            await tx.wallet.update({
                where: {
                    userID: userId,
                },
                data: {
                    balance: { increment: refund },
                    locked: { decrement: refund },
                },
            });
        } else {
            const refundShares = orderToCancel.remainingQuantity;

            await tx.holdings.update({
                where: {
                    userId_marketId_outcome: {
                        userId: userId,
                        marketId: marketId,
                        outcome: outcome as OrderOutcome,
                    },
                },
                data: {
                    shares: { increment: refundShares },
                    lockedShares: { decrement: refundShares },
                },
            });
        }

        //mark order cancel
        await tx.order.update({
            where: {
                id: id,
            },
            data: {
                status: "CANCELLED",
            },
        });
    });

    //delete order
    await commandClient.del(`Order:${id}`);

    //delete order from orderbook
    await commandClient.zrem(`ORDERBOOK:${marketId}:${outcome}:${type}`, id);

    //update order depth
    let depthLevelUpdates = new Map<string, depthUpdatedEventType>();

    await orderDepthUpdate(orderToCancel, commandClient, depthLevelUpdates);

    //broadcast depth update
    await Promise.all(
        Array.from(depthLevelUpdates.values()).map((update) =>
            commandClient.xadd(
                `MarketDataStream`,
                "*",
                "priceLevelUpdated",
                JSON.stringify(update),
            ),
        ),
    );
    //unlock funds/shares
};

const orderDepthUpdate = async (order: Order, commandClient: Redis,depthLevelUpdates:Map<string,depthUpdatedEventType>) => {
    const newPriceQty = await commandClient.hincrby(
        `Depth:${order.marketId}:${order.outcome}:${order.type}`,
        order.price.toString(),
        -order.remainingQuantity,
    );

    if (newPriceQty > 0) {
        const priceKey = `${order.marketId}:${order.outcome}:${order.type}:${order.price}`;
        const priceDepthEvent: depthUpdatedEventType = {
            broadcastEventType: marketBroadcastEventType.DEPTH_UPDATED,
            marketId: order.marketId,
            type: order.type,
            outcome: order.outcome,
            quantity: newPriceQty,
            price: order.price,
        };
        depthLevelUpdates.set(priceKey, priceDepthEvent);
    } else {
        const priceKey = `${order.marketId}:${order.outcome}:${order.type}:${order.price}`;
        const priceDepthEvent: depthUpdatedEventType = {
            broadcastEventType: marketBroadcastEventType.DEPTH_UPDATED,
            marketId: order.marketId,
            type: order.type,
            outcome: order.outcome,
            quantity: 0,
            price: order.price,
        };
        depthLevelUpdates.set(priceKey, priceDepthEvent);
        await commandClient.hdel(
            `Depth:${order.marketId}:${order.outcome}:${order.type}`,
            order.price.toString(),
        );
    }

    if (newPriceQty < 0) {
        console.error(
            "Price level quantity went negative for order ",
            order.id,
        );
    }
};

export const ensureBotSetup = async() => {

    let bot = await prisma.user.findUnique({
        where:{
            username:BOT.id
        }
    })

    if(!bot){
        bot = await prisma.user.create({
            data:{
                username:BOT.id,
                password:BOT.password,
                profileImg:"",
                email:BOT.email,
            }
        })
        console.log("LP BOT User Created")
    }
    
    const walletExists = await prisma.wallet.findUnique({
        where:{
            userID:bot.id
        }
    })


    if(!walletExists){
        await prisma.wallet.create({
            data:{
                userID:bot.id,
                balance:BOT.balance,
                locked:0
            }
        })
        console.log("LP BOT Wallet Created")
    }
}

