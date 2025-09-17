
import Comments from '@/components/MarketPage/Comments'
import DisplayChart from '@/components/MarketPage/DisplayChart'
import Orderbook from '@/components/MarketPage/Orderbook'
import Trade from '@/components/MarketPage/Trade'

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from "../api/markets"
import { useSelector } from 'react-redux'
const MarketPage = () => {
  const {marketId} = useParams()
  const {profileImg} = useSelector((state)=>state.user.userData)
  const [marketData,setMarketData] = useState({})
  useEffect(()=>{
    const fetchMarketData = async () => {
      const query = `/${marketId}`
      console.log(query)
      const response = await api.get(`/${marketId}`)
      setMarketData(response.data.marketDetails)
      console.log(response)
    }
    fetchMarketData()
  },[])
  return (
    <div className=" max-width mx-auto px-2 lg:px-0 ">
      <p>{marketId}</p>
      <p>{profileImg}</p>
      <div className="  lg:flex lg:justify-between lg:items-start gap-3 py-6 ">
        <div className="flex-1">
          <DisplayChart marketData={marketData} />
          <div className=' lg:hidden'>
            <Trade />
          </div>
          <Orderbook />
          <Comments />
          
        </div>
        <div className='max-lg:hidden'>
            <Trade />
        </div>
      </div>
    </div>
  );
}

export default MarketPage
