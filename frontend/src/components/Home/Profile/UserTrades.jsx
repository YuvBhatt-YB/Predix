import React from 'react'
import UserTradeModal from './UserTradeModal'

const UserTrades = () => {
  return (
    <div className=' w-full md:max-w-4/5'>
      <div className=' border-b-1 py-2'>
        <p className=' font-secondary font-semibold'>Current Positions</p>
      </div>
      <div className=' flex flex-col gap-3 py-4'>
        <UserTradeModal />
        <UserTradeModal />
        <UserTradeModal />
        <UserTradeModal />
        <UserTradeModal />
        <UserTradeModal />
        <UserTradeModal />
        <UserTradeModal />
      </div>
    </div>
  )
}

export default UserTrades
