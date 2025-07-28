import React from 'react'
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom'
const Navbar = () => {
  return (
    <div className=' flex items-center justify-between py-2 px-2 lg:px-0 '>
      <p className=' font-main font-bold'>Predix <span className='inline-block w-[5px] h-[5px] bg-primaryBlue rounded-full'></span></p>
      <div className=' font-secondary text-small font-semibold flex gap-2.5'>
        <Link to="/signup"><Button size="sm" variant="secondary" className="text-primary">Sign Up</Button></Link>
        <Link to="login"><Button size="sm" className=" text-white bg-primaryBlue hover:bg-secondaryBlue">Log In</Button></Link>
      </div>
    </div>
  )
}

export default Navbar
