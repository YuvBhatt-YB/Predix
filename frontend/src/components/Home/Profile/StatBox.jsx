import React from 'react'

const StatBox = ({imgSrc,bgColor,title,value,valueClass}) => {
  return (
    <div className=' border-1 rounded-img p-5 min-w-[300px]'>
      <div className=' flex flex-col gap-3'>
        <div>
            <div style={{backgroundColor:bgColor}} className=" w-[60px] h-[60px] rounded-full flex items-center justify-center">
                  <img src={imgSrc} alt="" srcSet="" className='w-[30px] h-[30px]' />
            </div>
        </div>
        <div className=' font-secondary'>
            <p className=' text-primaryGray '>{title}</p>
            <p className={` text-3xl mt-1 ${valueClass ? valueClass :"text-primary"}`}>{value}</p>
        </div>
      </div>
    </div>
  )
}

export default StatBox
