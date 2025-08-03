import React, { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { RiMoneyDollarCircleFill } from "react-icons/ri";
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
import useAmount from '@/hooks/useAmount';
import { Link } from 'react-router-dom';
const Trade = () => {
  const {
    amount,
    selectedOption,
    payoutValue,
    maxAmountReached,
    setSelectedOption,
    handleSetAmount,
    handleIncrement,
    updatePayoutOptionChange,
    currentPrice
  } = useAmount({yes:0.23,no:0.78});
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
            onClick={() => {
              setSelectedOption("yes");
              updatePayoutOptionChange("yes");
            }}
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
            onClick={() => {
              setSelectedOption("no");
              updatePayoutOptionChange("no");
            }}
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
          <div className="  flex">
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
                 } ${
                maxAmountReached === true ? "animate-shake animate-once" : ""
              }`}
              onChange={handleSetAmount}
            />
          </div>
        </div>
        <div className=" w-full flex justify-end ">
          <div className=" font-secondary text-esm flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleIncrement(1)}
            >
              +$1
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleIncrement(10)}
            >
              +$10
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleIncrement(20)}
            >
              +$20
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleIncrement(100)}
            >
              +$100
            </Button>
          </div>
        </div>

        <div
          className={` transition-all duration-500 overflow-hidden ${
            amount
              ? " opacity-100 max-h-[300px] border-t-2"
              : " opacity-0 max-h-[0px]"
          } `}
        >
          <div className=" flex items-center justify-between py-4">
            <div className=" font-secondary">
              <p className=" flex items-center text-2xl gap-2">
                Win <RiMoneyDollarCircleFill className=" text-darkGreen" />
              </p>
              <p className=" text-primaryGray text-sm">
                Avg. Price
                {selectedOption === "yes" ? (
                  <span> {currentPrice.yes}</span>
                ) : (
                  <span> {currentPrice.no}</span>
                )}
              </p>
            </div>
            <div>
              <p
                className={` text-darkGreen font-secondary font-semibold 
                 ${
                   amount.length <= 4
                     ? "text-5xl "
                     : amount.length <= 6
                     ? "text-4xl "
                     : "text-3xl"
                 }`}
              >
                {payoutValue}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
            size="lg"
            type="submit"
            className="w-full font-secondary font-semibold md:py-8 bg-primaryBlue hover:bg-secondaryBlue"
          >
            Buy {selectedOption.charAt(0).toUpperCase()}
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