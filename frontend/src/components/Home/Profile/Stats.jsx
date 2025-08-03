import React from 'react'
import StatBox from './StatBox'

const Stats = () => {
  return (
    <div className=' flex gap-3  w-full overflow-x-auto no-scrollBar whitespace-nowrap touch-auto scroll-smooth'>
      <StatBox  title="Profit/Loss" value="$0.00" imgSrc="https://img.icons8.com/ios/50/economic-improvement.png" bgColor="#ECF9F1" />
      <StatBox  title="Markets Traded" value="0" imgSrc="https://img.icons8.com/ios/50/stall.png" bgColor="#FEFCEB" />
    </div>
  )
}

export default Stats
