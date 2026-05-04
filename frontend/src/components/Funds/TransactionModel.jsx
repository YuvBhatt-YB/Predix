import { transactionsDateTimeFormatter } from '@/utils/transactions-date-formatter'
import React from 'react'

const TransactionModel = ({type,description,addedAt}) => {
  const getColor = (type) => {
    switch(type){
      case "CREDIT": return "text-darkGreen"
      case "TRADE_PAYOUT": return "text-darkGreen"
      case "TRADE_RELEASE": return "text-primaryBlue"
      case "TRADE_LOCK": return "text-darkRed"
      case "LOSS": return "text-darkRed"
      default: return "text-textGray"
    }
  }
  
  return (
    <div className={`${getColor(type)} grid grid-cols-3 gap-2 md:gap-0   text-xs md:text-small py-2 font-secondary  `}>
            <p className=' font-semibold '>{type}</p>
            <p >{description}</p>
            <p className=' text-end'>{transactionsDateTimeFormatter(addedAt)}</p>
    </div>
  )
}

export default TransactionModel
