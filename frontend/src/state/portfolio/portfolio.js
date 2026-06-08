import { createSlice } from "@reduxjs/toolkit"
import { set } from "zod"


const initialState = {
    activeTab:"positions",
    positions:[],
    stats:{},
    openOrders:[],
    trades:[],
    positionsLoading:false,
    openOrdersLoading:false,
    statsLoading:false,
    tradesLoading:false,
    tradePage:1,
    tradeLimit:10,
    hasMoreTrades:false,
    positionsError:null,
    openOrdersError:null,
    tradesError:null,
    statsError:null
}


const portfolioSlice = createSlice({
    name:"portfolio",
    initialState,
    reducers:{
        setTradingActivityTab:(state,action)=>{
            state.activeTab = action.payload
        },
        setStats:(state,action)=>{
            state.stats = action.payload
        },
        setPositions:(state,action)=>{
            state.positions = action.payload
        },
        setOpenOrders:(state,action)=>{
            state.openOrders = action.payload
        },
        setTrades:(state,action)=>{
            state.trades = action.payload
        },
        setTradePage:(state,action)=>{
            state.tradePage = action.payload
        },
        setHasMoreTrades:(state,action)=>{
            state.hasMoreTrades = action.payload
        },
        setPositionsLoading:(state,action)=>{
            state.positionsLoading = action.payload
        },
        setStatsLoading:(state,action)=>{
            state.statsLoading = action.payload
        },
        setOpenOrdersLoading:(state,action)=>{
            state.openOrdersLoading = action.payload
        },
        setTradesLoading:(state,action)=>{
            state.tradesLoading = action.payload
        },
        setPositionsError:(state,action)=>{
            state.positionsError = action.payload
        },
        setOpenOrdersError:(state,action)=>{
            state.openOrdersError = action.payload
        },
        setTradesError:(state,action)=>{
            state.tradesError = action.payload
        },
        setStatsError:(state,action)=>{
            state.statsError = action.payload
        }
    }
})

export const {setTradingActivityTab,setPositions,setOpenOrders,setTrades,setTradePage,setHasMoreTrades,setPositionsLoading,setOpenOrdersLoading,setTradesLoading,setPositionsError,setOpenOrdersError,setTradesError,setStatsLoading,setStatsError,setStats} = portfolioSlice.actions
export default portfolioSlice.reducer