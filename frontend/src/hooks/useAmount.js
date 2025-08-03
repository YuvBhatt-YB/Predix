import { calculatePayout, formatAmount, parseAmount,calculateSellAmount } from "@/utils/amount"
import { useEffect, useState } from "react"


export default function useAmount(currentPrice){
  const [selectedOption,setSelectedOption] = useState("yes")
  const [selectedCase,setSelectedCase] = useState("buy")
  const [amount,setAmount] = useState("")
  const [payoutValue,setPayoutValue] = useState(0)
  const [maxAmountReached,setMaxAmountReached] = useState(false)
  useEffect(()=>{
    setAmount("")
    setPayoutValue(0)
  },[selectedCase])
  const handleSetAmount = (e) => {
    let value = e.target.value.replace(/[^0-9.]/g,"")
    if(!value){
        setAmount("")
        setPayoutValue(0)
        return
    }
    console.log(value)
    const parts = value.split(".")
    const intPart = parts[0]
    const decPart = parts[1]
    if (parts.length > 2 || decPart && decPart.length >2 || intPart.length > 6){
      return
    }
    if (!intPart && !decPart) return;
    const rawAmount = parseAmount(value)
    if(rawAmount > 100000) {
      setMaxAmountReached((prevState) => !prevState)
      return
    }
    if (selectedCase === "buy"){
      setAmount(value ? `${formatAmount(value)}`:"")
      const payout = calculatePayout(rawAmount,selectedOption,currentPrice)
      setPayoutValue(formatAmount(payout))
    } else if (selectedCase === "sell"){
      console.log("This is sell case")
      setAmount(value ? `${formatAmount(value,"sell")}`:"")
      const payout = calculateSellAmount(rawAmount,selectedOption,currentPrice)
      setPayoutValue(formatAmount(payout))
    }
    
  }

  const handleIncrement = (inc) => {
    
    const rawAmount = parseAmount(amount)
    let newAmount = rawAmount + inc
    if(newAmount >100000) {
      setMaxAmountReached((prevState) => !prevState)
      return
    }
    const formatted = formatAmount(newAmount)
    setAmount(formatted)
    const payout = calculatePayout(newAmount,selectedOption,currentPrice)
    setPayoutValue(formatAmount(payout))
    
  }
  
  const updatePayoutOptionChange = (newOption) => {
    setSelectedOption(newOption)
    const rawAmount = parseAmount(amount)
    const payout = calculatePayout(rawAmount,newOption,currentPrice)
    setPayoutValue(formatAmount(payout))
  }

  return {
    amount,
    selectedOption,
    payoutValue,
    maxAmountReached,
    setSelectedOption,
    handleSetAmount,
    handleIncrement,
    updatePayoutOptionChange,
    currentPrice,
    selectedCase,
    setSelectedCase
  }
}

