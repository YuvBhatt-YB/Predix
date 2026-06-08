import React from 'react'
import { FaAnglesUp,FaAnglesDown } from "react-icons/fa6";
import btc from "../../../assets/btc.webp"
import { Button } from '@/components/ui/button';
const UserTradeModal = ({data}) => {
    
  return (
    <div className=' border-1 rounded-img font-secondary shadow-sm'>
      <div className=' p-4 flex flex-col gap-4'>
        <div className=' flex flex-col  gap-2 md:flex-row md:justify-between md:gap-0'>
            <div className=' flex justify-between'>
                <div className=' flex gap-2 items-center'>
                <img src={data.marketImage} alt="" srcSet="" className=' w-[30px] h-[30px] rounded-small' />
                <p className='text-small font-semibold font-primary'>{data.marketTitle}</p>
                </div>
                <div className=' text-esm md:hidden'>
                    {data.outcome === "YES" ? (<div className='py-2 px-6 bg-lightGreen flex items-center gap-1.5 rounded-small text-darkGreen'>
                        <p ><FaAnglesUp /> </p>
                        <p className=' font-semibold'>Yes</p>
                    </div>) : ( <div className='py-2 px-6 bg-lightRed flex items-center gap-1.5 rounded-small text-darkRed'>
                        <p ><FaAnglesDown /> </p>
                        <p className=' font-semibold'>No</p>
                    </div>)}
                    
                   
                </div>
            </div>
            <div className=' text-esm flex  gap-4 items-center md:items-start mt-2 md:mt-0'>
                <div className='hidden md:block'>
                    {data.outcome === "YES" ? (<div className='py-2 px-6 bg-lightGreen flex items-center gap-1.5 rounded-small text-darkGreen'>
                        <p ><FaAnglesUp /> </p>
                        <p className=' font-semibold'>Yes</p>
                    </div>) : ( <div className='py-2 px-6 bg-lightRed flex items-center gap-1.5 rounded-small text-darkRed'>
                        <p ><FaAnglesDown /> </p>
                        <p className=' font-semibold'>No</p>
                    </div>)}
                    
                   
                </div>
                <div className=' flex gap-2 md:block text-center'>
                    <p className=' text-primaryGray font-semibold'>Total Shares</p>
                    <p className=' text-primary font-semibold'>{data.quantity}</p>
                </div>
            </div>
        </div>
        <div className=' flex flex-col gap-2 md:flex-row md:gap-0 justify-between '>
            <div className='text-esm flex  justify-between gap-4 items-center  md:justify-start'>
                <div className=" flex flex-col text-lg  md:block text-center">
                            
                            <p className={`${data.side === "BUY" ? "text-darkGreen ": "text-darkRed"} font-semibold`}>
                                {data.side}
                            </p>
                        </div>
                <div className=' flex flex-col  md:block text-center'>
                    <p className=' text-primaryGray font-semibold'>Price</p>
                    <p className={` font-semibold text-primary`}>{data.displayPrice}</p>
                </div>
                <div className=' flex flex-col  md:block text-center'>
                    <p className=' text-primaryGray font-semibold'>Amount</p>
                    <p className=' text-primary font-semibold'>{data.displayAmount}</p>
                </div>
            </div>
            <div>
                <div
                            className={`py-2  rounded-small text-sm font-semibold text-primaryGray `}
                        >
                            <p>{data.displayDate}</p>
                        </div>
            </div>
        </div>
        
      </div>
    </div>
  )
}

export default UserTradeModal
