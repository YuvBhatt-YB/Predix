import React, { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { setTradingActivityTab } from '@/state/portfolio/portfolio'
import UserPositions from './UserPositions'
import UserOrders from './UserOrders'
import UserTrades from './UserTrades'
import usePortfolio from '@/hooks/usePortfolio'

const components = [
  {title:"Current Positions",tab:"positions"},
  {title:"Open Orders",tab:"open-orders"},
  {title:"Trade History",tab:"history"}
]
const UserPortfolio = ({userId}) => {
  
  const dispatch = useDispatch()
  const {activeTab,fetchPositions,fetchOpenOrders,trades,fetchTrades} = usePortfolio(userId)
  useEffect(() => {
    if(!userId) return
    fetchPositions()
    fetchOpenOrders()
  },[userId])
  useEffect(() => {
    if(!userId) return
    if(activeTab === "history" && trades.length === 0){
      fetchTrades(1)
    }
  },[activeTab,userId])
  return (
    <div className=' w-full md:max-w-4/5'>
      <div className=' border-b-1 py-2 flex gap-4'>
        {components.map((component,index) => (
          <button key={index} className={`font-secondary text-sm font-semibold hover:text-primary cursor-pointer  ${activeTab === component.tab ? "text-primary" : "text-secondaryGray"}`} onClick={() => {dispatch(setTradingActivityTab(component.tab))}} >
            {component.title}
          </button>
        ))}
      </div>
      <div className=' flex flex-col gap-3 py-4'>
        {activeTab === "positions" && <UserPositions onRetry={fetchPositions} />}
        {activeTab === "open-orders" && <UserOrders onRetry={fetchOpenOrders} fetchOpenOrders={fetchOpenOrders} />}
        {activeTab === "history" && <UserTrades onRetry={fetchTrades} fetchTrades={fetchTrades} />}
      </div>
    </div>
  )
}

export default UserPortfolio
