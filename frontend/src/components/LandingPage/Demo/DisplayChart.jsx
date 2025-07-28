import React from 'react'
import Chart from './Chart'
import eth from "../../../assets/eth.webp"
import { chartData } from '@/utils/demo-chart-data'

const DisplayChart = () => {
  return (
    <div className='  w-full '>
      <div className=' flex gap-4 flex-col mb-4'>
        <div className=' flex items-center gap-4'>
            <img src={eth} alt="" srcset="" className='h-[50px] w-[50px] rounded-small' />
            <p className=' font-secondary font-semibold text-xl md:text-2xl text-primary'>Will Ethereum Price go to $3,000 ?</p>
        </div>
        <div>
            <p className=' font-secondary text-labelColor'>$ 270M Vol</p>
        </div>
      </div>
      <div className=' flex flex-col gap-3   '>
        <p className=' font-secondary font-semibold text-xl text-primaryBlue'>{chartData.priceHistory[chartData.priceHistory.length-1].price}% Chance</p>
        <div className=' w-full '>
          <Chart />
        </div>
      </div>
    </div>
  )
}

export default DisplayChart
