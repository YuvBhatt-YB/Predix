import React, { useEffect } from 'react'

import Search from './ContentPage/Search'
import MarketModal from './ContentPage/MarketModal'
import { useDispatch, useSelector } from 'react-redux'
import { setSearchValue } from '@/state/searchValue/searchValue'
import { Button } from '../ui/button'
import useMarketData from '@/hooks/useMarketData'

const Markets = () => {
  const activeTab = useSelector((state) => state.markets.category)
  const searchVal = useSelector((state) => state.markets.searchQuery)
  const userData = useSelector((state) => state.user.userData)
  const {fetchMarkets} = useMarketData()
  return (
    <div >
      <p>{JSON.stringify(userData)}</p>
      <Button onClick={fetchMarkets}>Fetch Markets</Button>
      <div className="max-width mx-auto px-2 lg:px-0">
        <p>{activeTab}</p>
        <p>{searchVal}</p>
        <div className="w-full">
          <Search />
        </div>
        <div className="  w-full grid md:grid-cols-2 lg:grid-cols-3 gap-3 py-4">
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
          <MarketModal />
        </div>
      </div>
    </div>
  );
}

export default Markets
