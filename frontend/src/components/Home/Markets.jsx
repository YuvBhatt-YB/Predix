import React from 'react'

import Search from './ContentPage/Search'
import MarketModal from './ContentPage/MarketModal'
import { useSelector } from 'react-redux'

const Markets = () => {
  const activeTab = useSelector((state) => state.activeTab.active)
  return (
    <div >
      <div className="max-width mx-auto px-2 lg:px-0">
        <p>{activeTab}</p>
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
