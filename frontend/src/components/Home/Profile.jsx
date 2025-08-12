import React from 'react'
import avatar from "../../assets/avatar.png"
import UserTrades from './Profile/UserTrades'
import Stats from './Profile/Stats'
import { useSelector } from 'react-redux'
import { profileDateFormatter } from '@/utils/profile-date-formatter'
const Profile = () => {
  const {username,profileImg,createdAt} = useSelector((state)=>state.user.userData)
  return (
    <div className=' max-width mx-auto px-2 lg:px-0'>
      <div >
        <div className=' border-b-1 flex justify-between items-center py-10'>
            <div className='  flex items-center gap-3 md:gap-9'>
                <img src={profileImg} alt="" srcset="" className=' rounded-small shadow-lg w-[150px] h-[150px]' />
                <div>
                    <p className=' font-semibold text-3xl md:text-4xl text-primary'>{username}</p>
                    <p className=' text-primaryGray text-sm md:text-[16px] mt-1'>Joined At {profileDateFormatter(createdAt)}</p>
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
