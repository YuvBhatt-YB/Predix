import React from 'react'
import avatar from "../../assets/avatar.png"
import UserTrades from './Profile/UserTrades'
import Stats from './Profile/Stats'
const Profile = () => {
  return (
    <div className=' max-width mx-auto px-2 lg:px-0'>
      <div >
        <div className=' border-b-1 flex justify-between items-center py-10'>
            <div className='  flex items-center gap-3 md:gap-9'>
                <img src={avatar} alt="" srcset="" className=' rounded-small shadow-lg' />
                <div>
                    <p className=' font-semibold text-3xl md:text-4xl text-primary'>yuvbhatt</p>
                    <p className=' text-primaryGray text-sm md:text-[16px]'>Joined 12 July,2018</p>
                </div>
            </div>
            <div className=' hidden md:block'>
                <div >
                    <p className=' font-main font-bold text-3xl text-[#D9D9D9] '>Predix <span className='inline-block w-[10px] h-[10px] bg-[#D9D9D9] rounded-full'></span></p>
                    
                </div>
            </div>
        </div>
        <div className='  py-4'>
            <Stats />
        </div>
        <div className='  w-full '>
            <UserTrades />
        </div>
      </div>
    </div>
  )
}

export default Profile
