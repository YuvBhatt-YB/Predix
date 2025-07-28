import React from 'react'
import { NavLink } from 'react-router-dom'
const NavigationLink = ({path,title}) => {
  return (
    <div>
        <NavLink to={path} className={({isActive}) => {return isActive ? "px-3 py-2  text-white bg-primaryBlue rounded-small focus:outline-none" : "text-secondaryGray px-3 py-2 hover:underline"}}>
            {title}
        </NavLink>
    </div>
  )
}

export default NavigationLink
