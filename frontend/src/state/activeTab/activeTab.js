import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    active:"new"
}

const activeTabSlice = createSlice({
    name:"activeTab",
    initialState,
    reducers:{
        setActiveTab:(state,action)=>{
            state.active = action.payload
        }
    }
})

export const {setActiveTab} = activeTabSlice.actions
export default activeTabSlice.reducer