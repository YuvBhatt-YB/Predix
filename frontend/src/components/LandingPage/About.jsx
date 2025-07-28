import React from 'react'
import { Button } from "@/components/ui/button"
import btc from "../../assets/btc.webp"
import { FaAnglesUp,FaAnglesDown } from "react-icons/fa6"
import { LuMoveRight } from "react-icons/lu";
const About = () => {
  return (
    <div className='flex flex-col sm:grid sm:grid-cols-2 sm:grid-rows-3 gap-7 md:gap-5 px-2 lg:px-0 py-3.5 md:py-7'>
      <div className='row-span-2  rounded-large p-4 flex flex-col gap-5 md:gap-10 shadow-[0px_8px_24px_0px_rgba(149,_157,_165,_0.2)]'>
        <div>
          <p className=' font-main font-semibold text-primary text-3xl md:text-4xl'>Choose a Market</p>
          <div className=' text-primary mt-3 text-sm md:text-[16px]'>
            <p className=' font-secondary leading-3'>Browse markets like </p>
            <p className=' font-secondary '>“Will Bitcoin Price go to $130,000 ?”</p>
          </div>
        </div>
        <div className=' bg-bgColor px-3 md:px-5 py-6 md:py-12 rounded-b-large'>
          <div className=' font-secondary border-1 border-borderPrimary bg-white p-3.5 rounded-medium flex flex-col gap-6'>
            <div className=' text-primary flex gap-2 items-center'>
              <img src={btc} alt="" srcset="" className=' rounded-small w-[30px] h-[30px]' />
              <p className='text-sm md:text-[16px]'>Will Bitcoin Price go to $130,000  ?</p>
            </div>
            <div className=' flex flex-col gap-1 md:flex-row md:gap-0 justify-between items-end'>
              <p className=' text-textGray text-esm'>$ 270M Vol</p>
              <div className=' flex gap-2'>
                <Button  className=" bg-lightGreen text-darkGreen hover:bg-lightGreen"><FaAnglesUp />Buy Yes</Button>
                <Button className=" bg-lightRed text-darkRed hover:bg-lightRed"><FaAnglesDown />Buy No</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='  rounded-large md:rounded-t-large p-4 flex items-center shadow-[0px_8px_24px_0px_rgba(149,_157,_165,_0.2)]'>
        <div className=' flex flex-col md:flex-row justify-between gap-4 md:gap-0 md:items-center  w-full'>
          <div className=' text-primary'>
            <p className=' font-main font-semibold text-2xl '>Buy Yes/No Shares</p>
            <div className=' font-secondary '>
              <p >Trade opinions by buying <span className=' md:hidden'>outcome shares</span></p>
              <p className='hidden leading-2 md:block'>outcome shares</p>
            </div>
          </div>
          <div className=' flex gap-2'>
              <Button   className=" bg-lightGreen text-darkGreen hover:bg-lightGreen"><FaAnglesUp />Buy Yes</Button>
              <Button  className=" bg-lightRed text-darkRed hover:bg-lightRed"><FaAnglesDown />Buy No</Button>
          </div>
        </div>
      </div>
      <div className='  rounded-large md:rounded-t-large p-4 flex items-center shadow-[0px_8px_24px_0px_rgba(149,_157,_165,_0.2)]'>
        <div className=' flex flex-col md:flex-row justify-between gap-4 md:gap-0 md:items-center  w-full'>
          <div className=' text-primary'>
            <p className=' font-main font-semibold text-2xl '>Watch Price Move</p>
            <div className=' font-secondary '>
              <p >Prices change based on demand and belief</p>
            </div>
          </div>
          <div>
              <img  src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/100/external-stock-investing-flaticons-lineal-color-flat-icons.png" alt="external-stock-investing-flaticons-lineal-color-flat-icons" className='w-[50px] h-[50px] '/>
          </div>
        </div>
      </div>
      <div className='col-span-2  rounded-large p-4 flex items-center justify-between shadow-[0px_8px_24px_0px_rgba(149,_157,_165,_0.2)]'>
        <div className=' flex flex-col md:flex-row justify-between items-center w-full gap-4 md:gap-0'>
          <div className=' text-primary'>
            <p className=' font-main font-semibold text-3xl md:text-4xl'>Get Paid on Outcome</p>
            <p className=' font-secondary'>If your side wins, earn based on the market result</p>
          </div>
          <div className=' border-1 border-borderPrimary p-2 md:p-4 rounded-medium flex flex-col gap-2 md:gap-4 w-full md:w-1/2'>
            <div className=' flex gap-2 items-center'>
              <img  src="https://img.icons8.com/emoji/48/party-popper.png" alt="party-popper" className='w-[30px] h-[30px] md:w-[48px] md:h-[48px]'/>
              <p className=' text-primary text-xl md:text-2xl'>Congratulations</p>
            </div>
            <div className=' text-secondary flex flex-col md:flex-row items-start md:justify-between'>
              <p className=' text-darkGreen'>You won $1,000,000</p>
              <p className=' text-primaryGray text-esm flex items-center justify-center gap-1'>Transfer To your Bank Now <LuMoveRight /></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
