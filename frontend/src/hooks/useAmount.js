import { setAmount, setLimitOrderPayoutValue, setLimitOrderValue, setLimitPrice, setLimitShares, setMaxAmountReached, setMaxLimitPriceReached, setMaxLimitSharesReached, setPayoutValue, setSelectedCase, setSelectedOption, setSelectedOrderType } from "@/state/trade/trade";
import { calculatePayout, formatAmount, parseAmount,calculateSellAmount, formatLimitPriceAmount, parseLimitPrice, calculateTotalLimitAmount, calculateTotalLimitPayout, formatCurrency } from "@/utils/amount"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";


export default function useAmount(currentPrice){
  const dispatch = useDispatch()
  const {amount,selectedOption,selectedCase,payoutValue,maxAmountReached,selectedOrderType,limit,maxLimitSharesReached,
    maxLimitPriceReached,limitOrderValue,limitOrderPayoutValue
  } = useSelector((state)=>state.trade)
  useEffect(()=>{
    if(!currentPrice) return
    const rawAmount = parseAmount(amount)

    if(!rawAmount){
      dispatch(setPayoutValue(0))
      return
    }
    if (selectedCase === "SELL") {
      const payout = calculateSellAmount(rawAmount, selectedOption, currentPrice)
      dispatch(setPayoutValue(formatAmount(payout)))
    }

    if (selectedCase === "BUY") {
      const payout = calculatePayout(rawAmount, selectedOption, currentPrice)
      dispatch(setPayoutValue(formatAmount(payout)))
    }
  },[amount,selectedCase,selectedOption,currentPrice?.YES,currentPrice?.NO,dispatch])
  useEffect(()=>{
    if(!currentPrice) return
    const rawPrice = parseLimitPrice(limit.price)

    if(!rawPrice){
      dispatch(setLimitOrderValue(0))
      dispatch(setLimitOrderPayoutValue(0))
      return
    }
    if(rawPrice <=0 || limit.shares <=0){
      dispatch(setLimitOrderValue(0))
      dispatch(setLimitOrderPayoutValue(0))
      return
    }
    if(selectedCase === "BUY"){
      const total = calculateTotalLimitAmount(rawPrice,limit.shares)
      const profit = calculateTotalLimitPayout(rawPrice,limit.shares)
      dispatch(setLimitOrderValue(formatCurrency(total)))
      dispatch(setLimitOrderPayoutValue(formatCurrency(profit)))
    }
    if(selectedCase === "SELL"){
      const total = calculateTotalLimitAmount(rawPrice,limit.shares)
      dispatch(setLimitOrderValue(formatCurrency(total)))
    }
  },[limit.price,limit.shares,currentPrice?.YES,currentPrice?.NO,dispatch,selectedCase,selectedOption])
  const triggerAmountShake = () => {
      dispatch(setMaxAmountReached(false));

      setTimeout(() => {
          dispatch(setMaxAmountReached(true));
      }, 0);

      setTimeout(() => {
          dispatch(setMaxAmountReached(false));
      }, 500);
  };

  const triggerLimitSharesShake = () => {
      dispatch(setMaxLimitSharesReached(false));

      setTimeout(() => {
          dispatch(setMaxLimitSharesReached(true));
      }, 0);

      setTimeout(() => {
          dispatch(setMaxLimitSharesReached(false));
      }, 500);
  };

  const triggerLimitPriceShake = () => {
      dispatch(setMaxLimitPriceReached(false));

      setTimeout(() => {
          dispatch(setMaxLimitPriceReached(true));
      }, 0);

      setTimeout(() => {
          dispatch(setMaxLimitPriceReached(false));
      }, 500);
  };
  const handleSetAmount = (e) => {
    let value = e.target.value.replace(/[^0-9.]/g,"")
    if(!value){
        dispatch(setAmount(""))
        dispatch(setPayoutValue(0))
        dispatch(setMaxAmountReached(false))
        return
    }
    
    const parts = value.split(".")
    const intPart = parts[0]
    const decPart = parts[1]
    if (parts.length > 2 || decPart && decPart.length >2 || intPart.length > 6){
      return
    }
    if (!intPart && !decPart) return;
    const rawAmount = parseAmount(value)
    if(rawAmount > 100000) {
      triggerAmountShake()
      return
    }
    dispatch(setMaxAmountReached(false))
    if (selectedCase === "BUY"){
      dispatch(setAmount(value ? `${formatAmount(value)}`:""))
      
    } else if (selectedCase === "SELL"){
      
      dispatch(setAmount(value ? `${formatAmount(value,"SELL")}`:""))
     
    }
    
    
  }

  const handleSetLimitPrice = (e) => {
    let value = e.target.value.replace(/[^0-9]/g,"")
    if(!value){
        dispatch(setMaxLimitPriceReached(false))
        dispatch(setLimitPrice(""))
        return
    }
    let price = value
    if(price > 99){
      dispatch(setMaxLimitPriceReached(true))
      return
    }
    dispatch(setMaxLimitPriceReached(false))

    dispatch(setLimitPrice(formatLimitPriceAmount(price)))
  }

  const handleIncrementLimitPrice = (inc) => {
    const rawPrice = parseLimitPrice(limit.price)
    let newPrice = rawPrice+inc
    if(newPrice>99){
      dispatch(setMaxLimitPriceReached(true))
      return
    }
    dispatch(setMaxLimitPriceReached(false))
    dispatch(setLimitPrice(formatLimitPriceAmount(newPrice)))
  }
  const handleDecrementLimitPrice = (dec) => {
    const rawPrice = parseLimitPrice(limit.price)
    let newPrice = rawPrice-dec
    if(newPrice < 0){
      dispatch(setMaxLimitPriceReached(true))
      return
    }
    
    dispatch(setMaxLimitPriceReached(false))
    dispatch(setLimitPrice(formatLimitPriceAmount(newPrice)))
  }

  const handleSetLimitShares = (e) => {
    let value = e.target.value.replace(/[^0-9.]/g,"")
    if(!value){
        dispatch(setMaxLimitSharesReached(false))
        dispatch(setLimitShares(0))
        return
    }
    let shares = Number(value)
    if(shares > 10000){
      triggerLimitSharesShake()
      return
    }
    dispatch(setMaxLimitSharesReached(false))

    dispatch(setLimitShares(shares))
  }

  const handleIncrement = (inc) => {
    
    const rawAmount = parseAmount(amount)
    let newAmount = rawAmount + inc
    if(newAmount >100000) {
      triggerAmountShake()
      return
    }
    
    dispatch(setMaxAmountReached(false))
    dispatch(setAmount(formatAmount(newAmount)))
    
  }

  const handleSharesIncrement = (inc) => {
    const shares = Number(limit.shares || 0)
    let newShares = shares + inc
    if(newShares > 10000){
      triggerLimitSharesShake()
      return
    }
    dispatch(setMaxLimitSharesReached(false))
    dispatch(setLimitShares(newShares))
  }
  const handleSharesDecrement = (dec) => {
    const shares = Number(limit.shares || 0)
    let newShares = shares - dec
    if(newShares < 0){
      triggerLimitSharesShake()
      return
    }
    dispatch(setMaxLimitSharesReached(false))
    dispatch(setLimitShares(newShares))
  }
  
  const updatePayoutOptionChange = (newOption) => {
    dispatch(setSelectedOption(newOption))
  }

  return {
    amount,
    selectedOption,
    payoutValue,
    maxAmountReached,
    setSelectedOption:(option) => dispatch(setSelectedOption(option)),
    handleSetAmount,
    handleIncrement,
    updatePayoutOptionChange,
    handleSharesIncrement,
    handleSharesDecrement,
    selectedCase,
    selectedOrderType,
    limit,
    handleSetLimitShares,
    maxLimitSharesReached,
    maxLimitPriceReached,
    handleSetLimitPrice,
    handleIncrementLimitPrice,
    handleDecrementLimitPrice,
    limitOrderValue,
    limitOrderPayoutValue,
    setSelectedCase:(value) => dispatch(setSelectedCase(value)),
    setSelectedOrderType:(value) => dispatch(setSelectedOrderType(value))
  }
}

