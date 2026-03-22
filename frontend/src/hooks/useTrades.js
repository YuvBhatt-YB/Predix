
import { tradesSocketRoute } from "@/socket/trades";
import { deriveVisualLevels } from "@/utils/tradeHelperFunctions";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/trade"


export default function useTrades(marketId){
    const [tradeExecuted,setTradeExecuted] = useState([])
    const [chartData,setChartData] = useState([])
    const [lastProbability,setLastProbability] = useState(0)
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
    
    console.log(lastProbability)
    useEffect(() => {
        const socket = io(tradesSocketRoute)

        socket.emit("joinTradeMarket",marketId)

        socket.on("tradeExecuted",(trades) => {
            console.log(trades)
            tradeExecutedBuffer.current.push(...trades)
            const lastTrade = trades[trades.length -1]
            setLastProbability(lastTrade.price)
        })
        socket.on("depthAdded",(depthAddedData) =>{
            console.log("depthAddedData:", depthAddedData)
            const updates = Array.isArray(depthAddedData) ? depthAddedData : [depthAddedData]
            depthAddedBuffer.current.push(...updates)
            
            console.log(depthAdded)
        })
        socket.on("depthUpdated",(depthUpdatedData) => {
            const updates = Array.isArray(depthUpdatedData) ? depthUpdatedData : [depthUpdatedData]
            depthUpdatedBuffer.current.push(...updates)
        })
        return ()=> {
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
                console.log(trades)
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
                        console.log(data)
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
        marketPageError
    }
}