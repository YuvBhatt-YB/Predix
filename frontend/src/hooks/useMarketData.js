import { appendMarkets, resetMarkets, setLoading, setMarkets, setNextCursor } from "@/state/markets/markets"
import { useDispatch, useSelector } from "react-redux"
import api from "../api/markets"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
export default function useMarketData(){
    const {loading,category,searchQuery,nextCursor,markets} = useSelector((state)=>state.markets)
    const dispatch = useDispatch()
    const location = useLocation()
    const fetchMarkets = async(options = {}) => {
        const {reset = false} = options
        if(!reset && nextCursor === null) return
        if(loading) return
        dispatch(setLoading(true))
        try{
            
            const query = new URLSearchParams();
            query.append("category", category);
            if (searchQuery) query.append("search", searchQuery);
            query.append("take", "10");
            if (nextCursor !== null && !reset) query.append("cursor", nextCursor);

            console.log(`/${query.toString()}`);
            const response = await api.get(`/?${query.toString()}`)
            if(reset){
                dispatch(setMarkets(response.data.markets))
            }else{
                dispatch(appendMarkets(response.data.markets))
            }
            
            dispatch(setNextCursor(response.data.nextCursor))
            console.log(response)
            
        }catch(error){
            console.error(error)
        }finally{
            dispatch(setLoading(false))
        }
        
    }
    useEffect(() => {
      dispatch(resetMarkets())
      fetchMarkets({reset:true})
    }, [category,searchQuery,location.key]);
    useEffect(()=>{
        const handleScroll = () => {
            if(window.innerHeight + window.scrollY >= document.body.offsetHeight && !loading && nextCursor){
                fetchMarkets()
            }
        }
        window.addEventListener("scroll",handleScroll)
        return () => window.removeEventListener("scroll",handleScroll)
    },
    [loading,nextCursor,category,searchQuery])
    return {
        fetchMarkets
    }
}