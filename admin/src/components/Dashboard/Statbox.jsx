import React from 'react'

const StatBox = ({icon,bgColor,title}) => {
  return (
    <div className=' border-1 border-borderPrimary w-[177px] px-6 py-2 rounded-xl'>
      <div style={{backgroundColor:bgColor}} className={`w-[40px] h-[40px] rounded-full flex items-center justify-center`}>
        <img src={icon} alt="Users Image" srcSet="" />
      </div>
      <div className='mt-2 font-secondary'>
        <p className=' text-xs text-primaryGray'>{title}</p>
        <p className=' text-2xl text-primary font-semibold'>0</p>
      </div>
    </div>
  )
}

export default StatBox
