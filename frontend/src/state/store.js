
import { configureStore } from "@reduxjs/toolkit"
import activeTabReducer from "./activeTab/activeTab"


export const store = configureStore({
    reducer:{
        activeTab: activeTabReducer
    }
})