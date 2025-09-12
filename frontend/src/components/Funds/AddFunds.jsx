import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatAmount, parseAmount } from '@/utils/amount'
import AlertBox from '../Alerts/AlertBox'
import api from "../../api/funds"
import { useSelector } from 'react-redux'
const AddFunds = () => {
  const [amount,setAmount] = useState("")
  const [error,setError] = useState("")
  const {wallet} = useSelector((state) => state.user.userData)
  const handleSetAmount = (amount) => {
    const value = amount.replace(/[^0-9.]/g,"")
    const parts = amount.split(".")
    const decParts = parts[1]
    if(parts.length > 2 || decParts && decParts.length > 2){
      return
    }
    setError("")
    setAmount(value ? formatAmount(value) : "")
  }
  const handleDeposit = async() => {
    const parsedAmount = parseAmount(amount)
    const data = {
      walletId:wallet.id,
      amount:parsedAmount
    }
    try{
      const response = await api.post("/deposit",data)
      setAmount("")
      setError("")
    }catch(error){
      setError(error.response.data.message || "Something went wrong")
    }
    console.log(parsedAmount)
  }
  return (
    <div>
      <div className="flex flex-col md:flex-row w-full md:max-w-lg items-center gap-2 font-secondary mt-8">
        <Input
          type="text"
          placeholder="Enter Your Amount"
          value={amount}
          className="rounded-small   text-primary focus:outline-none focus:ring-0 focus:border-none "
          onChange={(e) => handleSetAmount(e.target.value)}
        />
        <Button
          type="submit"
          className="max-md:w-full rounded-small bg-primaryBlue hover:bg-secondaryBlue"
          onClick={handleDeposit}
        >
          Deposit Amount
        </Button>
      </div>
      <div className='inline-block mt-1'>
        {error && <AlertBox message={error} />}
      </div>
    </div>
  );
}

export default AddFunds
