import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import MarketBlockExtended from './MarketBlockExtended'
const MarketBlock = ({market}) => {
    const [isExtended,setIsExtended] = useState(false)
    const {title,totalVolume,status,category,image} = market
  return (
    <><div className='  font-secondary w-full flex flex-col gap-2.5 rounded-small border-1 border-borderPrimary px-3 py-6 shadow-lg'>
        <div className=' flex items-center gap-2'>
            <img src={image} alt="Bitcoin" className='w-[30px] h-[30px] rounded-small'/>
            <h1 className=' font-semibold text-small text-primary'>{title}</h1>
        </div>
        <div className='text-xs'>
            <p className=' text-textGray'>Total Volume : <span className=' text-primary'>{totalVolume}</span></p>
        </div>
        <div className='text-xs'>
            <p className=' text-textGray'>Status : <span className=' text-darkGreen'>{status}</span></p>
        </div>
        <div className='text-xs flex justify-between'>
            <div>
                <p className=' text-textGray'>Category : <span className=' text-darkRed'>{category}</span></p>
            </div>
            <div>
                <button className='text-primary underline cursor-pointer' onClick={()=>{
                    setIsExtended(true)
                }}>More Info</button>
            </div>
        </div>
    </div>
    {isExtended && <MarketBlockExtended market={market} setIsExtended={setIsExtended} />}
    </>
  )
}

export default MarketBlock
