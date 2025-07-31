import React from 'react'
import { Outlet } from 'react-router-dom'
import Search from './ContentPage/Search'
import MarketModal from './ContentPage/MarketModal'

const ContentPage = ({activeTab}) => {
  return (
    <div >
      <div className="max-width mx-auto px-2 lg:px-0">
        {activeTab}
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

export default ContentPage
