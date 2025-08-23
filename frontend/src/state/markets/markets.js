import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    markets : [],
    nextCursor : null,
    loading: false,
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
        setMarkets: (state,action) => {
            state.markets = action.payload
        },
        appendMarkets: (state,action) => {
            state.markets = [...state.markets,...action.payload]
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
            state.markets = [],
            state.loading = false,
            state.nextCursor = null
        }
    }
})

export const {setLoading,setMarkets,setNextCursor,setCategory,setSearchQuery,resetMarkets,appendMarkets} = marketSlice.actions
export default marketSlice.reducer