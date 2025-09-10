import React from 'react'
import { MdAttachMoney } from "react-icons/md";
import { TbMoneybag } from "react-icons/tb";
import { GoClock } from "react-icons/go";
import { FaPaypal } from "react-icons/fa";
import { IoIosCard } from "react-icons/io";
import { FaBitcoin } from "react-icons/fa";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

import PaymentButton from './PaymentButton';
import AddFunds from './AddFunds';
import Transactions from './Transactions';
import { useSelector } from 'react-redux';
const FundsContentModel = () => {
  const {username,wallet} = useSelector((state)=>state.user.userData)
  return (
    <div className="  px-2 lg:px-0 py-6 ">
      {username}
      {JSON.stringify(wallet)}
      <div>
        <Alert className="max-lg:flex max-lg:flex-col max-lg:gap-2 ">
          <MdAttachMoney />
          <AlertTitle className=" font-main font-semibold text-primary">
            Alert: Demo Mode Only
          </AlertTitle>
          <AlertDescription className=" font-secondary ">
            Deposits and Withdrawals with real money are not available at this
            time. You can use demo funds to explore the platform. Real money
            support will be added in a future update.
          </AlertDescription>
        </Alert>
      </div>
      <div className=" mt-4 ">
        <p className=" font-main text-3xl text-primaryGray">
          Welcome <span className=" font-semibold text-primary">{username}</span>
        </p>
        <div className=" font-secondary flex gap-2 items-center mt-4">
          <div className=" w-[60px] h-[60px] rounded-full flex items-center justify-center bg-lightGreen">
            <TbMoneybag className=" text-xl text-primary" />
          </div>
          <div>
            <p className=" text-small leading-3 text-primaryGray">
              Current Balance
            </p>
            <p className=" font-semibold text-2xl text-primary">${wallet.balance}</p>
          </div>
          
        </div>
        <AddFunds />
        <div className=' mt-6 '>
          <div>
            <Alert className="md:max-w-xs">
              <GoClock />
              <AlertTitle>Coming Soon !</AlertTitle>
            </Alert>
          </div>
          <div className=' mt-2 flex flex-col md:flex-row gap-2'>
            <PaymentButton icon={<FaPaypal/>} title="Deposit with PayPal" limit="$10000" />
            <PaymentButton icon={<IoIosCard />} title="Deposit with Card" limit="$10000" />
            <PaymentButton icon={<FaBitcoin />} title="Deposit with Crypto"  />
          </div>
        </div>
      </div>
      <div className=' mt-4'>
        <Transactions />
      </div>
    </div>
  );
}

export default FundsContentModel
