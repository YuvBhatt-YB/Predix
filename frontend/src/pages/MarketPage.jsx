
import Comments from '@/components/MarketPage/Comments'
import DisplayChart from '@/components/MarketPage/DisplayChart'
import Orderbook from '@/components/MarketPage/Orderbook'
import Trade from '@/components/MarketPage/Trade'

import React from 'react'

const MarketPage = () => {
  return (
    <div className=" max-width mx-auto px-2 lg:px-0 ">
      <div className="  lg:flex lg:justify-between lg:items-start gap-3 py-6 ">
        <div className="flex-1">
          <DisplayChart />
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
