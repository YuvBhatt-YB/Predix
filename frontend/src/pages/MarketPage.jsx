
import Comments from '@/components/MarketPage/Comments'
import DisplayChart from '@/components/MarketPage/DisplayChart'
import Orderbook from '@/components/MarketPage/Orderbook'
import Trade from '@/components/MarketPage/Trade'

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import api from "../api/markets"
import { useDispatch, useSelector } from 'react-redux'
import Loading from '@/components/ui/Loading'
import useTrades from '@/hooks/useTrades'
import { resetTrade, setAmount, setSelectedCase, setSelectedOption } from '@/state/trade/trade';
const MarketPage = () => {
  const [searchParams] = useSearchParams()
  const {marketId} = useParams()
  const {id} = useSelector((state)=>state.user.userData)
  const [marketData,setMarketData] = useState(null)
  const {tradeExecuted,depthAdded,depthUpdated,orderBook,yesAsks,yesBids,noAsks,noBids,yesSpread,noSpread,lastProbability,chartData,marketPageError,marketUpdates,volume,prices,setPrices,setVolume} = useTrades(marketId)
  const dispatch = useDispatch()
  useEffect(() => {
      dispatch(resetTrade());
      const fetchMarketData = async () => {
          try {
              const response = await api.get(`/${marketId}`);
              const marketDetails = response.data.marketDetails;
              setMarketData(marketDetails);
              setPrices({
                  YES: marketDetails.currentYes ?? 0.5,
                  NO: marketDetails.currentNo ?? 0.5,
              });
              setVolume(marketDetails.volume);
          } catch (error) {
              console.error(error);
          }
      };
      fetchMarketData();
  }, []);
  useEffect(() => {
    const isExitMode = searchParams.get("mode") === "exit"
    if(isExitMode){
      dispatch(setSelectedCase("SELL"))
      dispatch(setSelectedOption(searchParams.get("outcome")))
      dispatch(setAmount(searchParams.get("availableQuantity")))
    }
  },[searchParams,dispatch])
  return (
    <div className=" max-width mx-auto px-2 lg:px-0 ">
      
      <div className="  lg:flex lg:justify-between lg:items-start gap-3 py-6 ">
        <div className="flex-1">
          {marketData ? (<DisplayChart marketData={marketData} lastProbability={lastProbability} prices={prices} chartData={chartData} marketPageError={marketPageError} volume={volume} />): (<Loading />)}
          
          <div className=' lg:hidden'>
            {marketData ? (<Trade  prices={prices} marketId={marketId} userId={id} />): (<Loading />)}
            
          </div>
          <Orderbook yesAsks={yesAsks} yesBids={yesBids} noAsks={noAsks} noBids={noBids} yesSpread={yesSpread} noSpread={noSpread} marketPageError={marketPageError} />
          <Comments marketId={marketId} />
          
        </div>
        <div className='max-lg:hidden'>
            {marketData ? (<Trade prices={prices} marketId={marketId} userId={id} />): (<Loading />)}
            
        </div>
      </div>
    </div>
  );
}

export default MarketPage
