import { useDispatch, useSelector } from "react-redux";
import api from "../api/portfolio"
import { setHasMoreTrades, setOpenOrders, setOpenOrdersError, setOpenOrdersLoading, setPositions, setPositionsError, setPositionsLoading, setStats, setStatsError, setStatsLoading, setTradePage, setTrades, setTradesError, setTradesLoading } from "@/state/portfolio/portfolio";
export default function usePortfolio(userId){
    const dispatch = useDispatch()

    const {activeTab,trades,tradePage,tradeLimit} = useSelector((state) => state.portfolio)

    const fetchPositions = async() =>{
        if(!userId) return
        try{
            
            dispatch(setPositionsLoading(true))
            dispatch(setPositionsError(null))
            const res = await api.get(`/positions/${userId}`)
            dispatch(setPositions(res.data.positions))

        }catch(error){
            console.error("Failed to fetch open positions",error)
            dispatch(setPositionsError("Failed to fetch positions"))
        }finally{
            dispatch(setPositionsLoading(false))
            
        }
    }
    const fetchOpenOrders = async() =>{
        if(!userId) return
        try{
            
            dispatch(setOpenOrdersLoading(true))
            dispatch(setOpenOrdersError(null))
            const res = await api.get(`/open-orders/${userId}`)
            dispatch(setOpenOrders(res.data.openOrders))

        }catch(error){
            console.error("Failed to fetch open positions",error)
            dispatch(setOpenOrdersError("Failed to fetch Open Orders"))
        }finally{
            dispatch(setOpenOrdersLoading(false))
            
        }
    }

    const fetchTrades = async(page = 1) => {
        if(!userId) return

        try{
            
            dispatch(setTradesLoading(true))
            dispatch(setTradesError(null))
            const res = await api.get(`/trades/${userId}?page=${page}&limit=${tradeLimit}`)
            dispatch(setTrades(res.data.trades || []))
            dispatch(setTradePage(res.data.page))
            dispatch(setHasMoreTrades(res.data.hasMore))
        }catch(error){
            console.error("Failed to fetch Trades",error)
            dispatch(setTradesError("Failed to fetch Trades"))
        }finally{
            dispatch(setTradesLoading(false))
        }
    }

    const fetchStats = async() => {
        if(!userId) return

        try{
            dispatch(setStatsLoading(true))
            dispatch(setStatsError(null))
            const res = await api.get(`/stats/${userId}`)
            dispatch(setStats(res.data.stats))
        }catch(error){
            console.error("Failed to fetch User Stats",error)
            dispatch(setStatsError("Failed to fetch Stats"))
        }finally{
            dispatch(setStatsLoading(false))
        }
    }

    return {
        activeTab,
        fetchPositions,
        fetchOpenOrders,
        fetchTrades,
        fetchStats,
        trades
    }
}