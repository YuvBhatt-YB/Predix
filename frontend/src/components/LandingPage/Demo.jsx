import React from 'react'
import DisplayChart from './Demo/DisplayChart'
import Trade from './Demo/Trade'
import Orderbook from './Demo/Orderbook'

const Demo = () => {
  return (
    <div className=' py-6 md:py-12 px-2 lg:px-0 '>
      <div className=' flex flex-col md:flex-row md:justify-between md:items-start gap-3 '>
        <div className='flex-1'>
          <DisplayChart />
          <Orderbook />
        </div>
        <Trade />
      </div>
      
      
    </div>
  )
}

export default Demo
