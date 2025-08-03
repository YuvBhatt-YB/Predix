import React from 'react'
import CommentBlock from './CommentBlock'
import PostComment from './PostComment'

const Comments = () => {
  return (
    <div className='w-full mt-4 font-secondary'>
      <div className=' py-2 border-b-1'>
        <p className=' font-semibold text-primary '>Comments (367)</p>
      </div>
      <div className=' py-4'>
        <PostComment />
      </div>
      <div className=' py-2'>
        <CommentBlock />
        <CommentBlock />
        <CommentBlock />
      </div>
    </div>
  )
}

export default Comments
