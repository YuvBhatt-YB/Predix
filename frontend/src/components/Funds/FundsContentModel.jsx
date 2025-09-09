import React from 'react'
import { MdAttachMoney } from "react-icons/md";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
const FundsContentModel = () => {
  return (
    <div className=" border-amber-700 border-2 px-2 py-6 ">
      <div>
        <Alert>
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
      <div >
        <p className=' font-main'>Welcome Yuv Bhatt</p>
        <div className=" flex gap-2 items-center font-secondary">
          <p>Your Current Balance</p>
          <div className=" px-6 py-1 border-2 rounded-small">
            <p>$0</p>
          </div>
        </div>
        <div className="flex w-full max-w-sm items-center gap-2 font-secondary">
          <Input type="number" placeholder="Enter Your Amount" />
          <Button type="submit" className="" >
            Deposit Amount
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FundsContentModel
