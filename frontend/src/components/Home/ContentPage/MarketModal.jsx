import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FaAnglesUp,FaAnglesDown } from "react-icons/fa6";
import eth from "../../../assets/eth.webp"
import { Link, useNavigate } from 'react-router-dom';

const MarketModal = () => {
    const [progress,setProgress] = useState(75)
    const navigate = useNavigate()
    const handleClick = () => {[
      navigate('/home/123')
    ]}
  return (
    <div className=" border-1 font-secondar p-2 rounded-small border-borderPrimary bg-white shadow-md">
      <div className=' flex flex-col gap-3'>
        <div className='flex items-center gap-2'>
            <Progress value={progress} className="flex-1 bg-light [&>div]:bg-progress"  />
            <p className=' text-textGray'><span className='text-primary font-semibold'>17%</span> Chance</p>
        </div>
        <div className=' flex gap-2 items-center'>
          <img src={eth} alt="" srcset="" className='w-[30px] h-[30px] rounded-small' />
          <Link to="/home/1234" className=' font-semibold text-primary hover:underline hover:underline-offset-2 hover:decoration-2 leading-4.5'>Will Real Madrid win FIFA Club World Cup ?</Link>
        </div>
        <div className=' w-full flex gap-2 mt-4'>
            <Button onClick={handleClick}  size="lg" className="flex-1/2 text-darkGreen bg-lightGreen rounded-small hover:bg-darkGreen hover:text-white transition duration-200 ease-in-out cursor-pointer"><FaAnglesUp /> Buy Yes</Button>
            <Button onClick={handleClick} size="lg" className="flex-1/2 text-darkRed bg-lightRed rounded-small hover:bg-darkRed hover:text-white transition duration-200 ease-in-out cursor-pointer"><FaAnglesDown /> Buy No</Button>
        </div>
        <div>
            <p className=' text-small text-textGray'>$ 10M Vol</p>
        </div>
      </div>
    </div>
  );
}

export default MarketModal
