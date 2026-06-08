import React, { useMemo, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { Plus,Minus } from 'lucide-react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import useAmount from '@/hooks/useAmount';
import { Link } from 'react-router-dom';
import useUserTrade from '@/hooks/useUserTrade';
import { useDispatch } from 'react-redux';
import { setAmount, setPayoutValue } from '@/state/trade/trade';
import Loading from '../ui/Loading';
import useTrades from '@/hooks/useTrades';
const Trade = ({prices,marketId,userId}) => {
  const currentPriceYes = prices.YES
  const currentPriceNo = prices.NO
  const currentPrice = useMemo(() => ({YES:currentPriceYes,NO:currentPriceNo}),[currentPriceYes,currentPriceNo])
  const {
    amount,
    selectedOption,
    payoutValue,
    maxAmountReached,
    setSelectedOption,
    handleSetAmount,
    handleIncrement,
    updatePayoutOptionChange,
    selectedCase,
    setSelectedCase,
    selectedOrderType,
    setSelectedOrderType,
    limit,
    handleSharesIncrement,
    handleSharesDecrement,
    handleSetLimitShares,
    handleSetLimitPrice,
    maxLimitPriceReached,
    maxLimitSharesReached,
    handleIncrementLimitPrice,
    handleDecrementLimitPrice,
    limitOrderValue,
    limitOrderPayoutValue
  } = useAmount(currentPrice);
  const {placeTrade,isPlacingOrder} = useUserTrade()
  const dispatch = useDispatch()
  const {orderBook} = useTrades(marketId)
  return (
      <Card className=" w-full lg:max-w-sm  ">
          <CardHeader>
              <CardTitle className="font-secondary text-primary flex justify-between">
                  <div className=" flex gap-2">
                      <button
                          className={`${
                              selectedCase === "BUY"
                                  ? "text-primary"
                                  : " text-secondaryGray"
                          }`}
                          onClick={() => {
                              setSelectedCase("BUY");
                              dispatch(setAmount(""));
                              dispatch(setPayoutValue(0));
                          }}
                      >
                          Buy
                      </button>
                      <button
                          className={`${
                              selectedCase === "SELL"
                                  ? "text-primary"
                                  : " text-secondaryGray"
                          }`}
                          onClick={() => {
                              setSelectedCase("SELL");
                              dispatch(setAmount(""));
                              dispatch(setPayoutValue(0));
                          }}
                      >
                          Sell
                      </button>
                  </div>
                  <div>
                      <Select
                          value={selectedOrderType}
                          onValueChange={(value) => {
                              setSelectedOrderType(value);
                          }}
                      >
                          <SelectTrigger className="w-full min-w-30 text-primary font-semibold data-[placeholder]:text-primary">
                              <SelectValue placeholder="Market" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectGroup>
                                  <SelectItem
                                      value="MARKET"
                                      className="font-semibold text-primary"
                                  >
                                      Market
                                  </SelectItem>
                                  <SelectItem
                                      value="LIMIT"
                                      className="font-semibold text-primary"
                                  >
                                      Limit
                                  </SelectItem>
                              </SelectGroup>
                          </SelectContent>
                      </Select>
                  </div>
              </CardTitle>
              <div className=" bg-borderPrimary rounded-full h-[1px]"></div>
          </CardHeader>
          <CardContent>
              <div className=" w-full text-secondary font-semibold flex gap-3">
                  <Button
                      size="lg"
                      className={` ${
                          selectedOption === "YES"
                              ? "bg-darkGreen hover:bg-darkGreen"
                              : "bg-light hover:bg-light text-primaryGray"
                      } rounded-small flex-1  md:py-6 text-xl`}
                      onClick={() => {
                          setSelectedOption("YES");
                          updatePayoutOptionChange("YES");
                      }}
                  >
                      <span
                          className={
                              selectedOption === "YES"
                                  ? " text-lightGreen"
                                  : "text-primaryGray"
                          }
                      >
                          Yes
                      </span>{" "}
                      {(currentPriceYes * 100).toFixed(0)}¢
                  </Button>
                  <Button
                      size="lg"
                      className={` ${
                          selectedOption === "NO"
                              ? " bg-darkRed hover:bg-darkRed text-white"
                              : "bg-light text-primaryGray hover:bg-light"
                      } rounded-small flex-1  md:py-6 text-xl`}
                      onClick={() => {
                          setSelectedOption("NO");
                          updatePayoutOptionChange("NO");
                      }}
                  >
                      <span
                          className={
                              selectedOption === "NO"
                                  ? " text-lightRed"
                                  : "text-primaryGray"
                          }
                      >
                          No
                      </span>{" "}
                      {(currentPriceNo * 100).toFixed(0)}¢
                  </Button>
              </div>
              {selectedOrderType === "MARKET" && (
                  <div className="grid gap-4 mt-4">
                      <div className=" font-secondary flex justify-between items-center  w-full ">
                          <div>
                              {selectedCase === "BUY" ? (
                                  <p className=" text-primary text-2xl">
                                      Amount
                                  </p>
                              ) : (
                                  <p className=" text-primary text-2xl">
                                      Shares
                                  </p>
                              )}
                          </div>
                          <div className="  flex">
                              <input
                                  type="text"
                                  placeholder={`${selectedCase === "BUY" ? "$0" : "0"}`}
                                  value={amount}
                                  className={`  w-full text-end  text-primary placeholder:text-borderGray focus:outline-none 
                 ${
                     amount.length <= 4
                         ? "text-5xl "
                         : amount.length <= 6
                           ? "text-4xl "
                           : "text-3xl"
                 } ${
                     maxAmountReached === true
                         ? "animate-shake animate-once"
                         : ""
                 }`}
                                  onChange={handleSetAmount}
                              />
                          </div>
                      </div>
                      {selectedCase === "BUY" && (
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
                      )}

                      <div
                          className={`transition-all duration-500 overflow-hidden  ${
                              amount
                                  ? " opacity-100 max-h-[300px] border-t-2"
                                  : "  opacity-0 max-h-[0px]"
                          } `}
                      >
                          <div className=" flex items-center justify-between py-4">
                              <div className=" font-secondary">
                                  <p
                                      className={` flex items-center ${selectedCase === "BUY" ? "text-2xl" : "text-xl"} gap-2`}
                                  >
                                      {selectedCase === "BUY"
                                          ? "Amount"
                                          : "You'll recieve"}{" "}
                                      <RiMoneyDollarCircleFill className=" text-darkGreen" />
                                  </p>
                                  <p className=" text-primaryGray text-sm">
                                      Avg. Price
                                      {selectedOption === "YES" ? (
                                          <span> {currentPrice.YES}</span>
                                      ) : (
                                          <span> {currentPrice.NO}</span>
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
                  </div>
              )}
              {selectedOrderType === "LIMIT" && (
                  <div className="mt-4">
                      <div className="flex justify-between border-b border-borderPrimary pb-5 items-center">
                          <p className="text-primary text-lg font-semibold">
                              Limit Price
                          </p>
                          <div
                              className={`flex border border-borderPrimary w-full max-w-35 justify-between px-1 py-2 rounded-lg ${maxLimitPriceReached ? "animate-shake animate-once" : ""}`}
                          >
                              <button>
                                  <Plus
                                      className=" bg-gray-50 p-0.5 rounded-sm"
                                      onClick={() => {
                                          handleIncrementLimitPrice(1);
                                      }}
                                  />
                              </button>
                              <input
                                  type="text"
                                  value={
                                      limit.price === "0¢" ? "" : limit.price
                                  }
                                  className={`text-primary  w-full max-w-15 text-center placeholder:text-borderGray focus:outline-none font-semibold text-lg `}
                                  placeholder="0¢"
                                  onChange={handleSetLimitPrice}
                              />
                              <button>
                                  <Minus
                                      className=" bg-gray-50 p-0.5 rounded-sm"
                                      onClick={() => {
                                          handleDecrementLimitPrice(1);
                                      }}
                                  />
                              </button>
                          </div>
                      </div>
                      <div className="flex flex-col gap-3 pt-3 border-b border-borderPrimary pb-5">
                          <div className="flex justify-between items-center">
                              <p className=" text-primary text-lg font-semibold">
                                  Shares
                              </p>
                              <input
                                  type="text"
                                  className={`border rounded-lg p-2 w-full max-w-40 placeholder:text-borderGray text-right text-lg font-semibold ${maxLimitSharesReached ? "animate-shake animate-once" : ""}`}
                                  placeholder="0"
                                  value={limit.shares === 0 ? "" : limit.shares}
                                  onChange={handleSetLimitShares}
                              />
                          </div>
                          <div className="flex justify-end">
                              <div className="flex gap-1 text-secondaryGray font-semibold">
                                  <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSharesDecrement(100)}
                                  >
                                      -100
                                  </Button>
                                  <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSharesDecrement(10)}
                                  >
                                      -10
                                  </Button>
                                  <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSharesIncrement(10)}
                                  >
                                      +10
                                  </Button>
                                  <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSharesIncrement(100)}
                                  >
                                      +100
                                  </Button>
                              </div>
                          </div>
                      </div>
                      {selectedCase === "BUY" && (
                          <div className=" flex flex-col gap-1 pt-2">
                              <div className=" flex justify-between font-semibold text-xl ">
                                  <p className="text-primary">Total</p>
                                  <p className=" text-primaryBlue">
                                      ${limitOrderValue}
                                  </p>
                              </div>
                              <div className=" flex justify-between font-semibold text-xl ">
                                  <p className="text-primary">To win</p>
                                  <p className=" text-darkGreen">
                                      ${limitOrderPayoutValue}
                                  </p>
                              </div>
                          </div>
                      )}
                      {selectedCase === "SELL" && (
                          <div className="pt-2">
                              <div className=" flex justify-between font-semibold text-xl ">
                                  <p className="text-primary">You'll receive</p>
                                  <p className=" text-darkGreen">
                                      ${limitOrderValue}
                                  </p>
                              </div>
                          </div>
                      )}
                  </div>
              )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
              <Button
                  disabled={isPlacingOrder}
                  size="lg"
                  type="submit"
                  className="w-full font-secondary font-semibold md:py-8 bg-primaryBlue hover:bg-secondaryBlue"
                  onClick={() =>
                      placeTrade({
                          marketId,
                          userId,
                          selectedCase,
                          selectedOption,
                          selectedOrderType,
                          amount,
                          limit,
                          currentPrice,
                          orderBook
                      })
                  }
              >
                  {isPlacingOrder ? (
                      <div><Loading /></div>
                  ) : (
                      <p>
                          {selectedCase === "BUY" ? "Buy" : "Sell"}{" "}
                          {selectedOption.charAt(0).toUpperCase() +
                              selectedOption.slice(1).toLowerCase()}
                      </p>
                  )}
              </Button>
              <div className="font-secondary text-primaryGray *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 mt-2">
                  By clicking continue, you agree to our{" "}
                  <a href="#">Terms of Service</a> and{" "}
                  <a href="#">Privacy Policy</a>.
              </div>
          </CardFooter>
      </Card>
  );
}

export default Trade