import React from 'react'

const CommentBlock = () => {
  return (
    <div className=' flex gap-2  mb-4 '>
        <div>
            <img src="https://wac-cdn.atlassian.com/dam/jcr:ba03a215-2f45-40f5-8540-b2015223c918/Max-R_Headshot%20(1).jpg?cdnVersion=2881" alt="" srcset="" className=' w-[40px] h-[40px] rounded-small' />
        </div>
        <div>
            <p className=' text-sm text-primaryGray'>June 18,2025</p>
            <p>This is a Comment block</p>
        </div>
    </div>
  )
}

export default CommentBlock
