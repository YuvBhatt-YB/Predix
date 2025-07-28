import React from 'react'
import LoginForm from '../components/LogIn/LoginForm'

const Login = () => {
  return (
    <div className=' bg-bgColor w-dvw h-dvh'>
      <div className="w-full h-full  flex flex-col items-center justify-center gap-5 ">
        <div>
          <p className=' font-main font-bold text-xl text-primary'>Predix <span className='inline-block w-[5px] h-[5px] bg-primaryBlue rounded-full'></span></p>
        </div>
        <div className='border-1 rounded-medium border-borderPrimary bg-fillColor w-[500px] pt-7  '>
          <div className=' text-center'>
            <p className=' font-main font-bold text-2xl text-primary'>Welcome to <span className=' text-primaryBlue'>Predix</span> Admin portal</p>
            <p className=' font-secondary text-small text-primary'>Enter your Admin Credentials</p>
          </div>
          <div className=' flex items-center justify-center mt-6 w-full pb-8'>
            <LoginForm />
          </div>
        </div>
      </div>
    </div> 
  )
}

export default Login
