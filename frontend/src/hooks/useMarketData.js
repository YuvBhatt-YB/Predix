import { resetMarkets, setLoading, setMarkets, setNextCursor } from "@/state/markets/markets"
import { useDispatch, useSelector } from "react-redux"
import api from "../api/markets"
import { useEffect } from "react"
export default function useMarketData(){
    const {loading,category,searchQuery,nextCursor,markets} = useSelector((state)=>state.markets)
    const dispatch = useDispatch()
    const fetchMarkets = async({reset = false}) => {
        console.log(markets)
        if(!reset && loading) return 
        dispatch(setLoading(true))
        if(reset) dispatch(resetMarkets())
        const query = new URLSearchParams()
        query.append("category",category)
        if(searchQuery) query.append("search",searchQuery)
        query.append("take","10")
        if(!reset && nextCursor) query.append("cursor",nextCursor)
        
        console.log(query.toString())
        dispatch(setLoading(false))

        const res =  await api.get(`/?${query.toString()}`)
        
        dispatch(setMarkets(res.data.markets))
        dispatch(setMarkets(res.data.markets))
        dispatch(setNextCursor(res.data.nextCursor || null))
        dispatch(setLoading(false))
        console.log(markets)
    }

    useEffect(()=>{
        fetchMarkets({reset:true})
    },[category,searchQuery])
    
    useEffect(() => {
      const handleScroll = () => {
        if (
          window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 500 &&
          !loading &&
          nextCursor
        ) {
          fetchMarkets()
        }
      };
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, [loading, nextCursor,category,searchQuery]);

    return {
        fetchMarkets
    }
}