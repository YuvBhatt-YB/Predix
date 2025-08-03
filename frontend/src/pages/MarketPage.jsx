
import DisplayChart from '@/components/MarketPage/DisplayChart'
import Orderbook from '@/components/MarketPage/Orderbook'
import Trade from '@/components/MarketPage/Trade'

import React from 'react'

const MarketPage = () => {
  return (
    <div className=" max-width mx-auto px-2 lg:px-0 ">
      <div className=" flex flex-col md:flex-row md:justify-between md:items-start gap-3 py-6 ">
        <div className="flex-1">
          <DisplayChart />
          <Orderbook />
        </div>
        <Trade />
      </div>
    </div>
  );
}

export default MarketPage
