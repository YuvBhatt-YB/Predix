import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { IoIosArrowDown } from "react-icons/io";
import { CiWallet } from "react-icons/ci";
import api from "../../../api/auth"
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '@/state/user/user';
const ProfileButton = () => {
  const {profileImg} = useSelector((state)=>state.user.userData)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const handleLogOut = async () => {
    try{
      const response = await api.post("/logout",{},{withCredentials:true})
      dispatch(setUserData(undefined))
      navigate("/")
    }catch(error){
      console.error("Logout Error",error)
    }
  }
  const handleNavigateFunds = () => {
    navigate(`/funds`)
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className=" md:px-2 py-1 rounded-small hover:bg-light cursor-pointer transition duration-200 ease-in-out">
          <div className=" flex items-center gap-2">
            <img
              src={profileImg}
              alt=""
              srcset=""
              className="w-[40px] h-[40px] rounded-small"
            />
            <div>
              <IoIosArrowDown />
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={8}
        collisionPadding={8}
        className="w-64 font-secondary text-primary"
      >
        <DropdownMenuLabel className="py-3 font-bold ">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="py-3" asChild><Link to="/home/profile">Profile</Link></DropdownMenuItem>
        <DropdownMenuItem className="py-3">Terms Of Use</DropdownMenuItem>
        <div className='flex flex-col gap-1.5 py-3 md:hidden'>
          <div className="  px-3 py-2 flex items-center justify-center gap-1 rounded-small font-semibold bg-light">
            <p className="text-primary text-xl">
              <CiWallet />
            </p>
            <p className=" text-darkGreen">$0.00</p>
          </div>
          <Button size="lg" className="rounded-small font-semibold bg-primaryBlue hover:bg-secondaryBlue w-full" onClick={handleNavigateFunds}>Deposit</Button>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="py-3" onClick={handleLogOut}>Log Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileButton
