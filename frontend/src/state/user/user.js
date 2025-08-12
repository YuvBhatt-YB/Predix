
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import api from "../../api/auth"

const initialState = {
    userData: undefined,
    loading:true
}

const userSlice = createSlice({
    name:"user",
    initialState,
    reducers:{
        setUserData:(state,action)=>{
            state.userData = action.payload
        },
        setLoading:(state,action)=>{
            state.loading = action.payload
        }
    },
    extraReducers:(builder) => {
        builder.addCase(getUserData.pending,(state)=>{
            state.loading = true
        }).addCase(getUserData.fulfilled,(state,action)=>{
            state.userData = action.payload
            state.loading = false
        }).addCase(getUserData.rejected,(state)=>{
            state.userData = undefined
            state.loading = false
        })
    }
})
export const getUserData = createAsyncThunk(
    "user/getUserData",async () =>{
            const res = await api.get("/me",{withCredentials:true})
            if(!res.data.user){
                throw new Error("Not Authenticated")
            }
            return res.data.user
    }
)

export const {setUserData,setLoading} = userSlice.actions
export default userSlice.reducer