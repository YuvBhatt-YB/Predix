
import { configureStore } from "@reduxjs/toolkit"
import activeTabReducer from "./activeTab/activeTab"
import searchValueReducer from "./searchValue/searchValue"
import marketReducer from "./markets/markets"
import userReducer from "./user/user"

export const store = configureStore({
    reducer:{
        user:userReducer,
        activeTab: activeTabReducer,
        searchValue: searchValueReducer,
        markets: marketReducer
    }
})