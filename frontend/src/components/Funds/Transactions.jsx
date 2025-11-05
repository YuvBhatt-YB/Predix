import React, { useEffect, useState } from 'react'
import TransactionModel from './TransactionModel'
import { PiEmptyBold } from "react-icons/pi";

import Loading from '../ui/Loading';
import useTransaction from '@/hooks/useTransaction';
const Transactions = () => {
    const {transactions,loading} = useTransaction()
  return (
    <div>
      <div className=" pb-2 border-b-1 border-borderGray">
        <p className=" font-secondary font-semibold text-primary">
          Your Transactions History
        </p>
      </div>
      <div className=" mt-2 flex flex-col gap-2 ">
        {loading ? (
          <div className=' w-full flex items-center justify-center'><Loading /></div>
        ) : transactions && transactions.length > 0 ? (
          <div className=' max-h-82 overflow-y-auto custom-scrollbar'>
            {transactions.map((transaction) => (
              <TransactionModel
                key={transaction.id}
                type={transaction.type}
                description={transaction.description}
                addedAt={transaction.createdAt}
              />
            ))}
          </div>
        ) : (
          <p className=" font-semibold font-secondary text-primary flex items-center gap-2">
            <PiEmptyBold /> No Transactions Yet
          </p>
        )}
      </div>
    </div>
  );
}

export default Transactions
