import React from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className=' max-width mx-auto flex justify-between items-center py-2'>
      <div>
        <p className=' font-main font-bold'>Predix <span className='inline-block w-[5px] h-[5px] bg-primaryBlue rounded-full'></span></p>
      </div>
      <div>
        <NavLink to="login"><button className="px-6 py-2 font-secondary bg-primaryBlue text-small text-white rounded-small font-semibold cursor-pointer hover:bg-secondaryBlue">Log Out</button></NavLink>
      </div>
    </div>
  )
}

export default Navbar
