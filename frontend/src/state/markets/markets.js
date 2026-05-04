import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    markets : {},
    nextCursor : null,
    loading: false,
    debouncedLoading:false,
    category: "new",
    searchQuery : ""
}

const marketSlice = createSlice({
    name:"markets",
    initialState,
    reducers:{
        setLoading: (state,action) => {
            state.loading = action.payload
        },
        setDebouncedLoading: (state,action)=>{
            state.debouncedLoading = action.payload
        },
        setMarkets: (state,action) => {
            const map = {}
            action.payload.forEach(m => {
                map[m.id] = m
            })
            state.markets = map
        },
        appendMarkets: (state,action) => {
            action.payload.forEach(m => {
                state.markets[m.id] = m
            })
        },
        updateMarketRealTime: (state,action) => {
            const {marketId,price,volume} = action.payload

            if(state.markets[marketId]){
                state.markets[marketId].price = price
                state.markets[marketId].volume = volume
            }
        },
        setNextCursor:(state,action)=>{
            state.nextCursor = action.payload
        },
        setCategory:(state,action)=>{
            state.category = action.payload
        },
        setSearchQuery:(state,action)=>{
            state.searchQuery = action.payload
        },
        resetMarkets:(state)=>{
            state.markets = {},
            state.loading = false,
            state.nextCursor = null
        }
    }
})

export const {setLoading,setMarkets,setNextCursor,setCategory,setSearchQuery,resetMarkets,appendMarkets,updateMarketRealTime,setDebouncedLoading} = marketSlice.actions
export default marketSlice.reducer