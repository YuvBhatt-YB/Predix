import React from 'react'
import Chart from './Chart'



const DisplayChart = ({marketData}) => {
  return (
    <div className='  w-full '>
      <div className=' flex gap-4 flex-col mb-4'>
        <div className=' flex items-center gap-4'>
            <img src={marketData.image} alt="" srcset="" className='h-[50px] w-[50px] rounded-small' />
            <p className=' font-secondary font-semibold text-xl md:text-2xl text-primary'>{marketData.title}</p>
        </div>
        <div>
            <p className=' font-secondary text-labelColor'>$ {marketData.totalVolume} Vol</p>
        </div>
      </div>
      <div className=' flex flex-col gap-3   '>
        <p className=' font-secondary font-semibold text-xl text-primaryBlue'>{marketData.currentPriceYes * 100}% Chance</p>
        <div className=' w-full '>
          <Chart />
        </div>
      </div>
    </div>
  )
}

export default DisplayChart
