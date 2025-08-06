
import { configureStore } from "@reduxjs/toolkit"
import activeTabReducer from "./activeTab/activeTab"
import searchValueReducer from "./searchValue/searchValue"

export const store = configureStore({
    reducer:{
        activeTab: activeTabReducer,
        searchValue: searchValueReducer
    }
})