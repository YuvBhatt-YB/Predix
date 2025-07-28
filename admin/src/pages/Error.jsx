import React from 'react'
import { NavLink } from 'react-router-dom'
import error from "../assets/error.png"
const Error = () => {
  return (
    <div className=' w-dvw h-dvh bg-white flex flex-col items-center justify-center'>
      <div className=' text-center flex items-center justify-center flex-col gap-2 ' >
        <img src={error} alt="" srcset=""  />
        <div className=' mb-4'>
            <h1 className=' font-main font-bold text-primary text-5xl ml-12'>Oops...</h1>
            <p className='font-secondary text-xl text-labelColor mt-2'>Seems like something went wrong</p>
        </div>
      </div>
      <div>
        <NavLink to="/"><button className="px-6 py-2 font-secondary bg-primaryBlue text-small text-white rounded-small font-semibold cursor-pointer hover:bg-secondaryBlue">Go to Home</button></NavLink>
      </div>
    </div>
  )
}

export default Error
