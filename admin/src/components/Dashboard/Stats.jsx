import React from 'react'
import StatBox from './StatBox'
import users from "../../assets/users.png"
import clock from "../../assets/clock.png"
import pending from "../../assets/pending.png"
import market from "../../assets/market.png"
const Stats = () => {
  return (
    <div className=' flex gap-3 py-8'>
      <StatBox title="Total Users" icon={users} bgColor="#ECF8F9"/>
      <StatBox title="Total Markets" icon={market} bgColor="#F7F9EC"/>
      <StatBox title="Markets Ending Today" icon={clock} bgColor="#F9ECEC"/>
      <StatBox title="Pending Resolutions" icon={pending} bgColor="#ECF8F9"/>
    </div>
  )
}

export default Stats
