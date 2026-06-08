
import { configureStore } from "@reduxjs/toolkit"
import activeTabReducer from "./activeTab/activeTab"
import portfolioReducer from "./portfolio/portfolio"
import searchValueReducer from "./searchValue/searchValue"
import tradeReducer from "./trade/trade"
import marketReducer from "./markets/markets"
import userReducer from "./user/user"

export const store = configureStore({
    reducer:{
        user:userReducer,
        trade:tradeReducer,
        activeTab: activeTabReducer,
        portfolio: portfolioReducer,
        searchValue: searchValueReducer,
        markets: marketReducer
    }
})