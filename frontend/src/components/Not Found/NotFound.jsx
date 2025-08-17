import React from 'react'

const NotFound = ({text}) => {
  return (
    <div className=' w-full flex flex-col items-center justify-center p-12 '>
      <img width="100" height="100" src="https://img.icons8.com/keek/100/thumbs-down.png" alt="thumbs-down"/>
      <p className=' text-bold font-secondary text-xl'>{text}</p>
    </div>
  )
}

export default NotFound
