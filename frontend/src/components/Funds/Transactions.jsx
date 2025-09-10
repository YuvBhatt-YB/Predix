import React, { useEffect } from 'react'
import TransactionModel from './TransactionModel'
import { PiEmptyBold } from "react-icons/pi";
const Transactions = () => {
    useEffect(()=>{
        console.log("Transaction Mounted")
    },[])
  return (
    <div>
      <div className=' pb-2 border-b-1 border-borderGray'>
        <p className=' font-secondary font-semibold text-primary'>Your Transactions History</p>
      </div>
      <div className=' mt-2 flex flex-col gap-2'>
        <p className=' font-semibold font-secondary text-primary flex items-center gap-2'><PiEmptyBold /> No Transactions Yet</p>
        <TransactionModel />
        <TransactionModel />
        <TransactionModel />
        <TransactionModel />
        <TransactionModel />
        <TransactionModel />
      </div>
    </div>
  )
}

export default Transactions
