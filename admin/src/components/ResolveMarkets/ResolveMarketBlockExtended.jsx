import React from 'react'

const ResolveMarketBlockExtended = ({resolveValue,setIsExtended,marketId}) => {
    const handleExtended = () => {
        setIsExtended(false)
    }
    const handleResolve = () => {
        console.log(`Market resoled as : ${resolveValue} for market with id ${marketId}`)
        handleExtended()
    }
  return (
    <div className=' w-full h-full bg-textGray/70 fixed inset-0  flex items-center justify-center' onClick={handleExtended}>
      <div className=' bg-white border-1 border-borderPrimary rounded-[10px] font-secondary w-[700px] h-[200px] px-6 py-8 flex items-center justify-center flex-col gap-4 shadow-lg z-100' onClick={(e)=>e.stopPropagation()}>
        <div>
            <div className=' text-primary font-semibold text-center'>
            <p>Are you sure you want to resolve this market as {resolveValue.toUpperCase()} ?</p>
            <p>This will finalize the outcome and trigger payouts.</p>
        </div>
        <div className=' text-small font-semibold flex items-center justify-center gap-2 mt-3 '>
            <button className='px-8 py-2  text-white bg-primaryBlue rounded-small focus:outline-none cursor-pointer hover:bg-secondaryBlue'onClick={handleResolve} >Yes</button>
            <button className='px-8 py-2   text-gray-900 bg-white rounded-small font-semibold cursor-pointer border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 ' onClick={handleExtended}>Close</button>
        </div>
        </div>
      </div>
    </div>
  )
}

export default ResolveMarketBlockExtended
