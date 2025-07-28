import React from 'react'

const AdditionalStats = ({formValues}) => {
  return (
    <div className=' font-secondary'>
      <p className=' text-secondaryGray font-semibold'>Preview</p>
      <div className=' mt-2'>
        <div className=' flex gap-2 items-center'>
          <img src={formValues.image} alt="" className='w-[30px] h-[30px] rounded-small'/>
          <p className=' font-semibold'>{formValues.title}</p>
        </div>
      </div>
      <div className=' text-xs flex flex-col gap-2 mt-4'>
        <p className=' text-textGray'>Description : <span className=' text-primary'>{formValues.description}</span></p>
        <p className=' text-textGray'>Category : <span className=' text-primary'>{formValues.category}</span></p>
        <p className=' text-textGray'>End Time : <span className=' text-primary'>{formValues.endTime}</span></p>
        <p className=' text-textGray'>Status : <span className=' text-primary'>{formValues.status}</span></p>
        <p className=' text-textGray'>Type : <span className=' text-primary'>{formValues.type}</span></p>
        <p className=' text-textGray'>Total Volume : <span className=' text-primary'>${formValues.totalVolume}</span></p>
        <p className=' text-textGray'>Yes Shares : <span className=' text-primary'>{formValues.yesShares}</span></p>
        <p className=' text-textGray'>No Shares : <span className=' text-primary'>{formValues.noShares}</span></p>
        <p className=' text-textGray'>Resolution : <span className=' text-darkRed'>Null</span></p>
        <div className='flex gap-1.5 items-center'>
                <p className='text-primary'>Initial Price : </p>
                <p className=' border-1 border-borderPrimary py-1 px-4 rounded-small text-darkGreen'>Yes {formValues.initialPrice.yes}</p>
                <p className=' border-1 border-borderPrimary py-1 px-4 rounded-small text-darkRed'>No {formValues.initialPrice.no}</p>
        </div>
      </div>
    </div>
  )
}

export default AdditionalStats
