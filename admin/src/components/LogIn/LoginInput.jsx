import React from 'react'
import show from "../../assets/show.png"
import closed from "../../assets/closed.png"
const LoginInput = ({type,label,placeholder,value,name,showPassword,setShowPassword,handleChange}) => {
  let input;
  const className = 'w-full py-3 px-2.5 rounded-small border-1 border-borderPrimary text-primary text-small focus: outline-hoverBorderPrimary'
  
  if(type === "email"){
    input = <input type="email" name={name} value={value}  placeholder={placeholder} onChange={handleChange} className={className} />
  }else if (type === "password"){
    input = <><input type={showPassword ? "text":"password"} onChange={handleChange} name={name} value={value}  className={className} />
    {value.length > 0 && <button className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer  text-sm" onClick={() => setShowPassword((prevState)=>!prevState)}><img src={showPassword ? closed : show} alt="" srcset="" /></button>}</>
  }
  return (
    <div className=' font-secondary flex flex-col gap-1.5'>
      <label className=' text-small font-bold text-primary'>{label}</label>
      <div className=' relative w-[440px]'>{input}</div>
    </div>
  )
}

export default LoginInput
