import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    searchVal:""
}

const searchValueSlice = createSlice({
    name:"searchValue",
    initialState,
    reducers:{
        setSearchValue:(state,action)=>{
            state.searchVal = action.payload
        }
    }
})

export const {setSearchValue} = searchValueSlice.actions
export default searchValueSlice.reducer