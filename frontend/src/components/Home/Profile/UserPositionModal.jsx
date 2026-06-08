import React from 'react'
import { FaAnglesUp,FaAnglesDown } from "react-icons/fa6";
import btc from "../../../assets/btc.webp"
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
const UserPositionModal = ({data}) => {
    const navigate = useNavigate()
  const handleExitTrade = (data) => {
    navigate(`/home/${data.marketId}?mode=exit&availableQuantity=${data.availableShares}&outcome=${data.outcome}`)
  }
  return (
    <div className=' border-1 rounded-img font-secondary shadow-sm'>
      <div className=' p-4 flex flex-col gap-4'>
        <div className=' flex flex-col  gap-2 md:flex-row md:justify-between md:gap-0'>
            <div className=' flex justify-between'>
                <div className=' flex gap-2 items-center'>
                <img src={data.marketImg} alt="" srcSet="" className=' w-[30px] h-[30px] rounded-small' />
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
                    <p className=' text-primary font-semibold'>{data.shares}</p>
                </div>
                <div className=' flex gap-2 md:block text-center'>
                    <p className=' text-primaryGray font-semibold'>Available</p>
                    <p className=' text-primary font-semibold'>{data.availableShares}</p>
                </div>
                <div className=' flex gap-2 md:block text-center'>
                    <p className=' text-primaryGray font-semibold'>Locked</p>
                    <p className=' text-primary font-semibold'>{data.lockedShares}</p>
                </div>
            </div>
        </div>
        <div className=' flex flex-col gap-2 md:flex-row md:gap-0 justify-between '>
            <div className='text-esm flex  justify-between gap-4 items-center md:items-start md:justify-start'>
                <div className=' flex flex-col  md:block text-center'>
                    <p className=' text-primaryGray font-semibold'>Avg Price</p>
                    <p className=' text-primary font-semibold'>{data.displayAvgPrice}</p>
                </div>
                <div className=' flex flex-col  md:block text-center'>
                    <p className=' text-primaryGray font-semibold'>Current</p>
                    <p className={` font-semibold ${Number(data.pnlPercent) > 0 ? "text-darkGreen" : "text-darkRed"}`}>{data.displayCurrentPrice}</p>
                </div>
                <div className=' flex flex-col  md:block text-center'>
                    <p className=' text-primaryGray font-semibold'>Invested</p>
                    <p className=' text-primary font-semibold'>{data.displayInvestedAmount}</p>
                </div>
                <div className=' flex flex-col  md:block text-center'>
                    <p className=' text-primaryGray font-semibold'>Current</p>
                    <p className={` font-semibold ${Number(data.pnlPercent) > 0 ? "text-darkGreen" : "text-darkRed"}`}>{data.displayCurrentValue}</p>
                </div>
            </div>
            <div>
                <div className={`py-2 px-3 rounded-small text-sm font-semibold flex gap-2 items-center ${Number(data.pnlPercent > 0) ? " bg-lightGreen text-darkGreen" : "bg-lightRed text-darkRed"} `}>
                    <p>{data.displayPnl}</p>
                    <p className=' text-esm'>({data.displayPnlPercent}%)</p>
                </div>
            </div>
        </div>
        <div className=' w-full flex justify-end'>
            <Button variant="outline" size="sm" className="text-primary" onClick={() => {handleExitTrade(data)}}>Exit Trade</Button>
        </div>
      </div>
    </div>
  )
}

export default UserPositionModal
