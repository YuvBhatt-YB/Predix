import React from 'react'
import { CiWallet } from "react-icons/ci";
import { Button } from "@/components/ui/button"
import ProfileButton from './Navbar/ProfileButton';
import { Link } from 'react-router-dom';

const Navbar = () => {
  
  return (
    
    <div>
      <div className=' max-width mx-auto'>
        <div className=" flex items-center justify-between px-2 lg:px-0 py-2">
          <Link to="/home" className=" font-main font-bold">
            Predix{" "}
            <span className="inline-block w-[5px] h-[5px] bg-primaryBlue rounded-full"></span>
          </Link>
          <div className="flex gap-8  items-center font-secondary">
            <div className="hidden md:flex gap-3 items-center ">
              <div className="  px-3 py-2 flex items-center justify-center gap-1 rounded-small font-semibold bg-light">
                <p className="text-primary text-xl">
                  <CiWallet />
                </p>
                <p className=" text-darkGreen">$0.00</p>
              </div>
              <Button
                size="lg"
                className="rounded-small font-semibold bg-primaryBlue hover:bg-secondaryBlue"
              >
                Deposit
              </Button>
            </div>
            <div className=" hidden self-stretch w-px bg-borderPrimary md:block"></div>
            <div>
              <ProfileButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar
