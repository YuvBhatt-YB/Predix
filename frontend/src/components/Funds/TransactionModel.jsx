import { transactionsDateTimeFormatter } from '@/utils/transactions-date-formatter'
import React from 'react'

const TransactionModel = ({type,description,addedAt}) => {
  return (
    <div className={`${type === "CREDIT" ? "text-darkGreen":"text-darkRed" } grid grid-cols-3 gap-2 md:gap-0   text-xs md:text-small py-2 font-secondary  `}>
            <p className=' font-semibold '>{type}</p>
            <p >{description}</p>
            <p className=' text-end'>{transactionsDateTimeFormatter(addedAt)}</p>
    </div>
  )
}

export default TransactionModel
