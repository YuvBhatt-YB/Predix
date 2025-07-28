import React, { useState } from 'react'
import ResolveMarketBlockExtended from './ResolveMarketBlockExtended'

const ResolveMarketBlock = ({market}) => {
    const [isExtended,setIsExtended] = useState(false)
    const [resolveValue,setResolveValue] = useState("")
    const handleExtended = (e) => {
        setResolveValue(e.target.value)
        setIsExtended(true)
    }
    const {title,yesShares,noShares,image,endTime,id} = market
  return (
    <div>
      <><div className='  font-secondary w-full flex flex-col gap-2 rounded-small border-1 border-borderPrimary px-3 py-6 shadow-xs'>
        <div className=' flex items-center gap-2'>
            <img src={image} alt="Bitcoin" className='w-[30px] h-[30px] rounded-small'/>
            <h1 className=' font-semibold text-small text-primary'>{title}</h1>
        </div>
        <div className='text-xs'>
            <p className=' text-textGray'>End Time : <span className=' text-primary'>{endTime}</span></p>
        </div>
        <div className='text-xs'>
            <p className=' text-textGray'>Status : <span className=' text-textGray'>Awaiting Resolution</span></p>
        </div>
        <div className='text-xs'>
            <p className=' text-textGray'>Yes Shares : <span className='text-darkGreen '>{yesShares}</span></p>
        </div>
        <div className='text-xs'>
            <p className=' text-textGray'>No Shares : <span className=' text-darkRed'>{noShares}</span></p>
        </div>
        <div className=' text-xs font-semibold'>
            <div className=' flex items-center justify-center gap-2'>
                <button value="yes" className='px-3 py-2  text-white bg-darkGreen rounded-small focus:outline-none cursor-pointer hover:bg-hoverDarkGreen' onClick={handleExtended}>Resolve as Yes</button>
                <button value="no" className='px-3 py-2  text-white bg-darkRed rounded-small focus:outline-none cursor-pointer hover:bg-hoverDarkRed' onClick={handleExtended}>Resolve as No</button>
            </div>
            <div className=' flex items-center justify-center mt-2'>
                <button value="cancel" className='px-3 py-2   text-gray-900 bg-white rounded-small font-semibold cursor-pointer border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 ' onClick={handleExtended}>Cancel Market</button>
            </div>
        </div>
    </div>
    {isExtended && <ResolveMarketBlockExtended resolveValue={resolveValue} setIsExtended={setIsExtended} marketId={id}/>}
    </>
    </div>
  )
}

export default ResolveMarketBlock
