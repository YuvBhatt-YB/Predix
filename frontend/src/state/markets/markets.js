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
            state.nextCursor = null,
            state.loading = false
        }
    }
})

export const {setLoading,setMarkets,setNextCursor,setCategory,setSearchQuery,resetMarkets} = marketSlice.actions
export default marketSlice.reducer