import { appendMarkets, resetMarkets, setDebouncedLoading, setLoading, setMarkets, setNextCursor } from "@/state/markets/markets"
import { useDispatch, useSelector } from "react-redux"
import api from "../api/markets"
import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
export default function useMarketData(){
    const {loading,category,searchQuery,nextCursor,markets} = useSelector((state)=>state.markets)
    const dispatch = useDispatch()
    const location = useLocation()
    const loaderRef = useRef(null)
    const fetchMarkets = async(options = {}) => {
        const {reset = false} = options
        if(!reset && nextCursor === null) return
        if(loading) return
        dispatch(setLoading(true))
        try{
            
            const query = new URLSearchParams();
            query.append("category", category);
            if (searchQuery) query.append("search", searchQuery);
            query.append("take", "12");
            if (nextCursor !== null && !reset) query.append("cursor", nextCursor);

            console.log(`/${query.toString()}`);
            const response = await api.get(`/?${query.toString()}`)
            if(reset){
                dispatch(resetMarkets())
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
      
      if(searchQuery){
        setDebouncedLoading(true)
        const handler = setTimeout(async()=>{

            await fetchMarkets({reset:true})
            setDebouncedLoading(false)
        },500)

        return ()=> clearTimeout(handler)
      }else{
        fetchMarkets({reset:true})
      }
      
    }, [category,searchQuery,location.key]);
    useEffect(()=>{
        if(!loaderRef.current) return
        const observer = new IntersectionObserver((entries)=>{
            const target = entries[0]
            if(target.isIntersecting && !loading && nextCursor){
                console.log("This is being observed")
                fetchMarkets()
            }
        },{root:null,threshold:0.5})
        observer.observe(loaderRef.current)
        return ()=> observer.disconnect()
    },
    [loading,nextCursor,category,searchQuery])
    return {
        fetchMarkets,
        loaderRef
    }
}

