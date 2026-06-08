import React, { useEffect, useRef, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2Icon, InfoIcon } from "lucide-react"
import Chart from './Chart'
import { formatVolume } from '@/utils/amount'
import { useSelector } from 'react-redux';



const DisplayChart = ({marketData,lastProbability,chartData,prices,marketPageError,volume}) => {
  const [direction,setDirection] = useState("neutral")
  const {selectedOption} = useSelector((state) => state.trade)
  const selectedPrice = prices[selectedOption] ?? lastProbability ?? 0.5
  const prevProbability = useRef(null)
  useEffect(() => {
    if(prevProbability.current === null){
      prevProbability.current = selectedPrice
      return
    }
    if(selectedPrice > prevProbability.current){
      setDirection("up")
    }else if (selectedPrice < prevProbability.current){
      setDirection("down")
    }
    prevProbability.current = selectedPrice
    const timeout = setTimeout(()=>{
      setDirection("neutral")
    },500)

    return () => clearTimeout(timeout)
  },[selectedPrice])
  const color = direction === "up" ? "text-darkGreen" : direction === "down" ? "text-darkRed" : "text-primaryBlue"
  return (
      <div className="  w-full ">
          <div className=" flex gap-4 flex-col mb-4">
              <div className=" flex items-center gap-4">
                  <img
                      src={marketData.image}
                      alt=""
                      srcSet=""
                      className="h-[50px] w-[50px] rounded-small"
                  />
                  <p className=" font-secondary font-semibold  md:text-2xl text-primary">
                      {marketData.title}
                  </p>
              </div>
              <div>
                  <p className=" font-secondary text-labelColor">
                      $ {formatVolume(volume)} Vol
                  </p>
              </div>
          </div>
          <div className=" flex flex-col gap-3   ">
              <p
                  className={`font-secondary font-semibold text-xl ${color} transition-colors duration-300 ease-in-out `}
              >
                  {(selectedPrice * 100).toFixed(0)}
                  % Chance
              </p>
              <div className=" w-full min-w-0 ">
                  {marketPageError.type === "chartData" ? (
                      <div className=' font-secondary'>
                          {" "}
                          <Alert>
                              <InfoIcon />
                              <AlertTitle>Chart Data not available for this Market !</AlertTitle>
                          </Alert>
                      </div>
                  ) : (
                      <Chart chartData={chartData} />
                  )}
              </div>
          </div>
      </div>
  );
}

export default DisplayChart
