import { transactionsDateTimeFormatter } from '@/utils/transactions-date-formatter'
import React from 'react'

const CommentBlock = ({username,userProfileImg,text,createdAt}) => {
  return (
    <div className=' flex  gap-1 md:gap-2  mb-4 '>
        <div>
            <img src={userProfileImg} alt="" srcset="" className='w-[50px]  md:w-[40px] md:h-[40px] rounded-small' />
        </div>
        <div className=' w-full'>
            <div className='flex items-center  justify-between'>
              <p className=' text-primary text-small font-semibold'>{username}</p>
              <p className=' text-xs text-primaryGray'>{transactionsDateTimeFormatter(createdAt)}</p>
            </div>
            <p>{text}</p>
        </div>
    </div>
  )
}

export default CommentBlock
