import React from 'react'
import { FaAnglesUp } from "react-icons/fa6";
import btc from "../../../assets/btc.webp"
import { Button } from '@/components/ui/button';
const UserTradeModal = () => {
  return (
    <div className=' border-1 rounded-img font-secondary shadow-sm'>
      <div className=' p-4 flex flex-col gap-4'>
        <div className=' flex flex-col  gap-2 md:flex-row md:justify-between md:gap-0'>
            <div className=' flex gap-2 items-center'>
                <img src={btc} alt="" srcset="" className=' w-[30px] h-[30px] rounded-small' />
                <p className='text-small font-semibold font-primary'>Will PI Price go to $0.50 ?</p>
            </div>
            <div className=' text-esm flex gap-8 items-center md:items-start'>
                <div >
                    <div className='py-2 px-6 bg-lightGreen flex items-center gap-1.5 rounded-small text-darkGreen'>
                        <p ><FaAnglesUp /> </p>
                        <p className=' font-semibold'>Yes</p>
                    </div>
                </div>
                <div className=' flex gap-2 md:block text-center'>
                    <p className=' text-primaryGray font-semibold'>Shares</p>
                    <p className=' text-primary font-semibold'>1000</p>
                </div>
                <div className=' flex gap-2 md:block text-center'>
                    <p className=' text-primaryGray font-semibold'>Amount</p>
                    <p className=' text-primary font-semibold'>$1000</p>
                </div>
            </div>
        </div>
        <div className=' flex justify-between items-end'>
            <div>
                <p className=' text-esm text-textGray'>$ 670M Volume</p>
            </div>
            <div>
                <Button variant="outline" size="sm" className="text-primary">Exit Trade</Button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default UserTradeModal
