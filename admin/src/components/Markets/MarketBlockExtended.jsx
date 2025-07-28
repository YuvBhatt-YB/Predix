import React from 'react'

const MarketBlockExtended = ({market,setIsExtended}) => {
  const {
    title,
    totalVolume,
    category,
    status,
    createdAt,
    endTime,
    yesShares,
    noShares,
    initialPrice,
    currentPrice,
    resolution} 
    = market
    const handleExtended = () => {
        setIsExtended(false)
    }
  return (
    <div className=' w-full h-full bg-textGray/70 fixed inset-0  flex items-center justify-center' onClick={handleExtended}>
      <div className=' bg-white border-1 border-borderPrimary rounded-[10px] font-secondary w-[700px] h-[500px] px-6 py-8 shadow-lg z-100' onClick={(e)=>e.stopPropagation()}>
        <div className=' flex items-center gap-2 pb-3 border-b-1 border-borderPrimary'>
            <img src="https://polymarket.com/_next/image?url=https%3A%2F%2Fpolymarket-upload.s3.us-east-2.amazonaws.com%2FBTC%2Bfullsize.png&w=96&q=75" alt="Bitcoin" className='w-[50px] h-[50px] rounded-small'/>
            <h1 className=' font-semibold  text-primary'>{title}</h1>
        </div>
        <div className=' flex flex-col gap-1.5 mt-4 '>
            <p className=' text-textGray'>Total Volume : <span className=''>{totalVolume}</span></p>
            <p className=' text-textGray'>Status : <span className='text-darkGreen'>{status}</span></p>
            <p className=' text-textGray'>Category : <span className='text-darkRed'>{category}</span></p>
            <p className=' text-textGray'>Created At : <span className=''>{createdAt}</span></p>
            <p className=' text-textGray'>End Time : <span className=''>{endTime}</span></p>
            <p className=' text-textGray'>Yes Shares : <span className=''>{yesShares}</span></p>
            <p className=' text-textGray'>No Shares : <span className=''>{noShares}</span></p>
            <p className=' text-textGray'>Resolution : <span className=' text-darkRed'>{resolution || "Null"}</span></p>
        </div>
        <div className=' mt-8 '>
            <div className='flex gap-1.5 items-center'>
                <p className='text-primary'>Initial Price : </p>
                <p className=' border-1 border-borderPrimary py-1 px-4 rounded-small text-darkGreen'>Yes {initialPrice.yes}</p>
                <p className=' border-1 border-borderPrimary py-1 px-4 rounded-small text-darkRed'>No {initialPrice.no}</p>
            </div>
            <div className=' flex justify-between mt-1.5 w-full '>
                <div className='flex gap-1.5 items-center'>
                <p className='text-primary'>Current Price : </p>
                <p className=' border-1 border-borderPrimary py-1 px-4 rounded-small text-darkGreen'>Yes {currentPrice.yes}</p>
                <p className=' border-1 border-borderPrimary py-1 px-4 rounded-small text-darkRed'>No {currentPrice.no}</p>
                </div>
                <button className='px-6 py-2  text-gray-900 bg-white rounded-small font-semibold cursor-pointer border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 ' onClick={handleExtended}>Close</button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default MarketBlockExtended
