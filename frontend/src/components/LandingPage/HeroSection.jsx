import React from 'react'
import hero from "../../assets/hero.png"
import { LuMoveRight } from "react-icons/lu";
import { Link } from 'react-router-dom';
const HeroSection = () => {
  return (
    <div className=' relative w-full overflow-hidden mt-4 '>
      <div className='    max-width mx-auto py-8 md:py-0 md:grid md:grid-cols-2'>
        <div className='  flex flex-col justify-center space-y-1.5 md:space-y-2.5 px-2 lg:px-0'>
            <div className=' font-main '>
            <h1 className=' text-5xl md:text-large leading-[0.85]'>Bet</h1>
            <h1 className='text-5xl md:text-large leading-[0.85]'>on what you</h1>
            <h1 className=' font-bold text-7xl md:text-exLarge text-primaryBlue leading-[0.85] '>Believe</h1>
        </div>
        <div className=' font-secondary'>
            <p>Trade opinions on real-world events and</p>
            <p>get rewarded for being right.</p>
        </div>
        <div className=' font-secondary'>
            <Link to="/login" className=' text-primaryGray hover:underline hover:underline-offset-1 flex items-center gap-1 '>Try Now <LuMoveRight /></Link>
        </div>
        </div>
        <div className='translate-x-1/3 hidden md:block'>
            <img src={hero} alt="" srcset="" className='w-[850px] max-w-none object-contain rounded-img' />
        </div>
      </div>
    </div>
  )
}

export default HeroSection
