import React, { useState } from 'react'
import LoginInput from './LoginInput'
import useLogin from '../../hooks/useLogin'
import LoginErrors from './LoginErrors'

const LoginForm = () => {
    const {loginDetails,loginErrors,handleChange,handleSubmit} = useLogin()
    const [showPassword,setShowPassword] = useState(false)
  return (
    <div>
      <div className=' flex flex-col gap-5'>
        <LoginInput label="Email" placeholder="y@example.com" type="email" value={loginDetails.email} name="email" handleChange={handleChange} />
        <LoginInput label="Password"  type="password" setShowPassword={setShowPassword} showPassword={showPassword} value={loginDetails.password} name="password" handleChange={handleChange} />
      </div>
      <div className=' mt-8'>
        <LoginErrors loginErrors={loginErrors}/>
      <button className='w-[440px] font-secondary font-bold text-white text-small bg-primaryBlue py-3 rounded-small cursor-pointer hover:bg-secondaryBlue  ' onClick={handleSubmit}>Log In</button>
      </div>
      
    </div>
    
  )
}

export default LoginForm
