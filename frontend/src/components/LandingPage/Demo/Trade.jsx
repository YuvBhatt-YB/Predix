import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
const Trade = () => {
  const [selectedOption,setSelectedOption] = useState("yes")
  const [amount,setAmount] = useState("")
  const currentPrice = {
    yes:0.23,
    no:0.78
  }
  const formatAmount = (value) => {
    const [intPart, decPart] = value.toString().split(".");

    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return decPart !== undefined
      ? `$${formattedInt}.${decPart}`
      : `$${formattedInt}`;
  };

  const handleSetAmount = (e) => {
    let value = e.target.value
    value = value.replace(/[^0-9.]/g,"")
    const parts = value.split(".")
    if (parts.length > 2){
      return
    }
    const intPart = parts[0]
    const decPart = parts[1]

    if(decPart && decPart.length >2) return
    
    if(intPart.length > 6) return

    if(Number(value.replace("$","")) > 100000) return
    
    
    const formattedValue = intPart.replace(/\B(?=(\d{3})+(?!\d))/g,",")
    const finalValue = decPart !== undefined ? `${formattedValue}.${decPart}` : formattedValue
    
    setAmount(value ? `$${finalValue}`:"")
    console.log(value)
  }
  const handleIncrement = (inc) => {
    console.log(inc)
    const rawAmount = amount.replace(/[$,]/g,"")
    const currentAmount = Number(rawAmount || 0)
    let newAmount = currentAmount + inc
    if(newAmount >100000) return
    const formatted = formatAmount(newAmount)
    setAmount(formatted)
  }
  return (
    <Card className="w-full md:max-w-sm  ">
      <CardHeader>

        <CardTitle className="font-secondary text-primary flex justify-between">
          <div>
            <p>Buy</p>
          </div>
          <p>Market</p>
        </CardTitle>
        <div className=" bg-borderPrimary rounded-full h-[1px]"></div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className=" w-full text-secondary font-semibold flex gap-3">
          <Button
            size="lg"
            className={` ${
              selectedOption === "yes"
                ? "bg-darkGreen hover:bg-darkGreen"
                : "bg-light hover:bg-light text-primaryGray"
            } rounded-small flex-1  md:py-6 text-xl`}
            onClick={() => setSelectedOption("yes")}
          >
            <span
              className={
                selectedOption === "yes"
                  ? " text-lightGreen"
                  : "text-primaryGray"
              }
            >
              Yes
            </span>{" "}
            23¢
          </Button>
          <Button
            size="lg"
            className={` ${
              selectedOption === "no"
                ? " bg-darkRed hover:bg-darkRed text-white"
                : "bg-light text-primaryGray hover:bg-light"
            } rounded-small flex-1  md:py-6 text-xl`}
            onClick={() => setSelectedOption("no")}
          >
            <span
              className={
                selectedOption === "no" ? " text-lightRed" : "text-primaryGray"
              }
            >
              No
            </span>{" "}
            78¢
          </Button>
        </div>
        <div className=" font-secondary flex justify-between items-center  w-full">
          <div>
            <p className=" text-primary text-2xl">Amount</p>
          </div>
          <div className='  flex'>
            <input
              type="text"
              placeholder="$0"
              value={amount}
              className={`  w-full text-end  text-primary placeholder:text-borderGray focus:outline-none 
                 ${
                   amount.length <= 4
                     ? "text-5xl "
                     : amount.length <= 6
                     ? "text-4xl "
                     : "text-3xl"
                 }`}
              onChange={handleSetAmount}
            />
          </div>
        </div>
        <div className=" w-full flex justify-end ">
          <div className=" font-secondary text-esm flex gap-1">
            <Button size="sm" variant="outline" onClick={()=>handleIncrement(1)}>
              +$1
            </Button>
            <Button size="sm" variant="outline" onClick={()=>handleIncrement(10)}>
              +$10
            </Button>
            <Button size="sm" variant="outline" onClick={()=>handleIncrement(20)}>
              +$20
            </Button>
            <Button size="sm" variant="outline" onClick={()=>handleIncrement(100)}>
              +$100
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          size="lg"
          type="submit"
          className="w-full font-secondary font-semibold md:py-8 bg-primaryBlue hover:bg-secondaryBlue"
        >
          Deposit
        </Button>
        <div className="font-secondary text-primaryGray *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 mt-2">
          By clicking continue, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </CardFooter>
    </Card>
  );
}

export default Trade
