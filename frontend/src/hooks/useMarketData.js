import { setLoading } from "@/state/markets/markets"
import { useDispatch, useSelector } from "react-redux"

export default function useMarketData(){
    const {loading,category,searchQuery,nextCursor} = useSelector((state)=>state.markets)
    const dispatch = useDispatch()
    const fetchMarkets = async() => {
        if(loading) return 
        dispatch(setLoading(true))

        const query = new URLSearchParams()
        query.append("category",category)
        if(searchQuery) query.append("search",searchQuery)
        query.append("take","20")
        if(nextCursor) query.append("cursor",nextCursor)
        
        console.log(query.toString())
        dispatch(setLoading(false))

    }

    return {
        fetchMarkets
    }
}