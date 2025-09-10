import AlertBox from '@/components/Alerts/AlertBox';
import FundsContentModel from '@/components/Funds/FundsContentModel';
import { Button } from '@/components/ui/button'
import React from 'react'
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
const Funds = () => {
    const navigate = useNavigate()
    const handleBack = () => {
        navigate(`/home`)
    }
  return (
    <div className=' w-full max-width mx-auto my-4 '>
      <div>
        <Button variant="secondary" size="icon" className="size-8 mx-2 lg:mx-0" onClick={handleBack}>
            <IoIosArrowBack />
        </Button>
      </div>
      <div className='  mt-4'>
        <FundsContentModel />
      </div>
    </div>
  )
}

export default Funds
