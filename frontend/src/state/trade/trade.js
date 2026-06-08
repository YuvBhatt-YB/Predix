
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    selectedOption:"YES",
    selectedCase:"BUY",
    selectedOrderType:"MARKET",
    amount:"",
    payoutValue:0,
    limitOrderValue:0,
    limitOrderPayoutValue:0,
    limit:{
        price:"",
        shares:0
    },
    maxAmountReached:false,
    maxLimitPriceReached:false,
    maxLimitSharesReached:false
}

const tradeSlice = createSlice({
    name: "trade",
    initialState,
    reducers: {
        setAmount: (state, action) => {
            state.amount = action.payload;
        },
        setPayoutValue: (state, action) => {
            state.payoutValue = action.payload;
        },
        setLimitOrderValue: (state, action) => {
            state.limitOrderValue = action.payload;
        },
        setLimitOrderPayoutValue: (state, action) => {
            state.limitOrderPayoutValue = action.payload;
        },
        setLimitPrice: (state, action) => {
            state.limit.price = action.payload;
        },
        setLimitShares: (state, action) => {
            state.limit.shares = action.payload;
        },
        setSelectedOption: (state, action) => {
            state.selectedOption = action.payload;
        },
        setSelectedCase: (state, action) => {
            state.selectedCase = action.payload;
        },
        setSelectedOrderType: (state, action) => {
            state.selectedOrderType = action.payload;
        },
        setMaxAmountReached: (state, action) => {
            state.maxAmountReached = action.payload;
        },
        setMaxLimitPriceReached: (state, action) => {
            state.maxLimitPriceReached = action.payload;
        },
        setMaxLimitSharesReached: (state, action) => {
            state.maxLimitSharesReached = action.payload;
        },
        resetTrade: () => ({
            ...initialState,
            limit:{...initialState.limit}
        }),
    },
});

export const {setAmount,setPayoutValue,setSelectedOption,setSelectedCase,setMaxAmountReached,setSelectedOrderType,setLimitPrice,setLimitShares,setMaxLimitPriceReached,setMaxLimitSharesReached,setLimitOrderValue,setLimitOrderPayoutValue,resetTrade} = tradeSlice.actions
export default tradeSlice.reducer