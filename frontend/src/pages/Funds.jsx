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
    <div className=' w-full max-width mx-auto '>
      <div>
        <Button variant="secondary" size="icon" className="size-8" onClick={handleBack}>
            <IoIosArrowBack />
        </Button>
      </div>
      <div className=' border-2'>
        <FundsContentModel />
      </div>
    </div>
  )
}

export default Funds
