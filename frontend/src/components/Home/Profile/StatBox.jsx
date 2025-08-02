import React from 'react'

const StatBox = () => {
  return (
    <div className=' border-1 rounded-img p-5 min-w-[300px]'>
      <div className=' flex flex-col gap-3'>
        <div>
            <div className=' bg-lightGreen w-[60px] h-[60px] rounded-full'>

            </div>
        </div>
        <div className=' font-secondary'>
            <p className=' text-primaryGray'>Profit/Loss</p>
            <p className=' text-primary text-3xl'>$0.00</p>
        </div>
      </div>
    </div>
  )
}

export default StatBox
