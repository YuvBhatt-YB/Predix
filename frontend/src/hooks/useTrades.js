
import { tradesSocketRoute } from "@/socket/trades";
import { deriveVisualLevels } from "@/utils/tradeHelperFunctions";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/trade"
import { marketsSocketRoute } from "@/socket/markets";


export default function useTrades(marketId){
    const [tradeExecuted,setTradeExecuted] = useState([])
    const [chartData,setChartData] = useState([])
    const [lastProbability,setLastProbability] = useState(0)
    const [prices,setPrices] = useState({
        YES:0,
        NO:0
    })
    const [volume,setVolume] = useState(0)
    const [marketUpdates,setMarketUpdates] = useState([])
    const [orderBook,setOrderBook] = useState({
        "YES":{"BUY":{},"SELL":{}},
        "NO":{"BUY":{},"SELL":{}}
    })
    const tradeExecutedBuffer = useRef([])
    const depthAddedBuffer = useRef([])
    const depthUpdatedBuffer = useRef([])
    const [depthAdded,setDepthAdded] = useState([])
    const [depthUpdated,setDepthUpdated] = useState([])
    const [marketPageError,setMarketPageError] = useState({})
    
    const yesAsks = useMemo(() => {
        return deriveVisualLevels(orderBook.YES.SELL,"SELL")
    },[orderBook.YES.SELL])
    const yesBids = useMemo(() => {
        return deriveVisualLevels(orderBook.YES.BUY,"BUY")
    },[orderBook.YES.BUY])
    const noAsks = useMemo(() => {
        return deriveVisualLevels(orderBook.NO.SELL,"SELL")
    },[orderBook.NO.SELL])
    const noBids = useMemo(() => {
        return deriveVisualLevels(orderBook.NO.BUY,"BUY")
    },[orderBook.NO.BUY])
    const bestYesAsk = yesAsks[0]?.price
    const bestYesBid = yesBids[0]?.price
    const yesSpread = bestYesAsk !== undefined && bestYesBid !== undefined ? bestYesAsk - bestYesBid : null
    const bestNoAsk = noAsks[0]?.price
    const bestNoBid = noBids[0]?.price
    const noSpread = bestNoAsk !== undefined && bestNoBid !== undefined ? bestNoAsk - bestNoBid : null
    
    useEffect(() => {
        const socket = io(tradesSocketRoute)

        socket.emit("joinTradeMarket",marketId)

        socket.on("tradeExecuted",(trades) => {
            tradeExecutedBuffer.current.push(...trades)
        })
        socket.on("depthAdded",(depthAddedData) =>{
            const updates = Array.isArray(depthAddedData) ? depthAddedData : [depthAddedData]
            depthAddedBuffer.current.push(...updates)
        })
        socket.on("depthUpdated",(depthUpdatedData) => {
            const updates = Array.isArray(depthUpdatedData) ? depthUpdatedData : [depthUpdatedData]
            depthUpdatedBuffer.current.push(...updates)
        })
        return ()=> {
            socket.disconnect()
        }
    },[marketId])
    useEffect(() => {
        const socket = io(marketsSocketRoute)
        socket.emit("joinMarket",marketId)
        socket.on("marketUpdated",(marketUpdatedData) => {
            const update = Array.isArray(marketUpdatedData) ? marketUpdatedData.flat()[0] : marketUpdatedData
            if(!update) return
            setMarketUpdates(prevState => [...prevState,update])
            
            setVolume(update.volume)

            if(update.outcome === "YES" || update.outcome || "NO"){
                setPrices((prev) => ({
                    ...prev,
                    [update.outcome]:update.price
                }))
            }

            if(update.outcome === "YES"){
                setLastProbability(update.price)
            }
        })
        return () => {
            socket.disconnect()
        }
    },[marketId])
    useEffect(()=>{
        const fetchChartData = async() => {
            try{
                const response = await api.get(`/chartData/${marketId}`)
                const data = response.data.chartData
                const dataPoints = data.map((dp) => {
                    return {
                        time:dp.time,
                        price:dp.price
                    }
                })
                setChartData(dataPoints)
            }catch(error){
                if(error){
                    setMarketPageError({
                        type:"chartData",
                        error:"Chart Data not found for this marketId"
                    })
                }
                
            }
        }
        const fetchOrderbookData = async() => {
            try{
                const response = await api.get(`/orderBookData/${marketId}`)
                const data = response.data.orderBook
                setOrderBook(data)
            }catch(error){
                if(error){
                    setMarketPageError({
                        type:"orderBookData",
                        error:"Orderbook Data not found for this marketId"
                    })
                }
            }
        }
        fetchChartData()
        fetchOrderbookData()
    },[marketId])
    useEffect(()=>{
        const interval = setInterval(() => {
            if (tradeExecutedBuffer.current.length > 0) {
                const trades = tradeExecutedBuffer.current
                tradeExecutedBuffer.current = []
                const newPoints = trades.map((trade) => {
                    return {
                        time:trade.dateTime,
                        price:trade.price * 100
                    }
                })
                setChartData((prevState) => [...prevState,...newPoints].slice(-100))
                setTradeExecuted((prevState) => [...trades, ...prevState].slice(0,100));
            }
            if (depthAddedBuffer.current.length > 0) {
                const updates = depthAddedBuffer.current
                depthAddedBuffer.current = []
                setOrderBook((prev) => {
                    let updatedBook = {...prev}
                    for(const data of updates){
                        const newSideData = {
                            ...updatedBook[data.outcome][data.type],
                        };
                        newSideData[data.price] = data.quantity;
                        updatedBook = {
                            ...updatedBook,
                            [data.outcome]:{
                                ...updatedBook[data.outcome],
                                [data.type]: newSideData
                            }
                        }

                        
                    }

                    return updatedBook
                })
                
                
            }
            if (depthUpdatedBuffer.current.length > 0) {
                const updates = depthUpdatedBuffer.current
                depthUpdatedBuffer.current = []
                setOrderBook((prev) => {
                    let updatedBook = {...prev}
                    for(const data of updates){
                        const newSideData = {
                            ...updatedBook[data.outcome][data.type],
                        };
                        if (data.quantity === 0) {
                            delete newSideData[data.price];
                        } else {
                            newSideData[data.price] = data.quantity;
                        }
                        updatedBook = {
                            ...updatedBook,
                            [data.outcome]: {
                                ...updatedBook[data.outcome],
                                [data.type]: newSideData,
                            },
                        };
                        
                    }
                    return updatedBook
                })
                
            }
        }, 50);
        return () => clearInterval(interval)
    },[])
    return {
        tradeExecuted,
        depthAdded,
        depthUpdated,
        orderBook,
        yesAsks,
        yesBids,
        noAsks,
        noBids,
        yesSpread,
        noSpread,
        lastProbability,
        chartData,
        marketPageError,
        marketUpdates,
        volume,
        prices,
        setPrices,
        setVolume
    }
}
