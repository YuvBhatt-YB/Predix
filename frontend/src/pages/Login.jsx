import React from 'react'
import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { Link } from 'react-router-dom'
const Login = () => {
  return (
    <div className=" bg-bgColor flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 ">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium">
          <p className=' font-main font-bold text-xl text-primary'>Predix <span className='inline-block w-[5px] h-[5px] bg-primaryBlue rounded-full'></span></p>
        </Link>
        <LoginForm />
        
      </div>
    </div>
  )
}

export default Login
