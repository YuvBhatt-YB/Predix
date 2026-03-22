import React, { useEffect, useRef, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2Icon, InfoIcon } from "lucide-react"
import Chart from './Chart'



const DisplayChart = ({marketData,lastProbability,chartData,marketPageError}) => {
  const [direction,setDirection] = useState("neutral")
  const prevProbability = useRef(null)
  useEffect(() => {
    if(prevProbability === null){
      prevProbability.current = lastProbability
      return
    }
    if(lastProbability > prevProbability.current){
      setDirection("up")
    }else if (lastProbability < prevProbability.current){
      setDirection("down")
    }
    prevProbability.current = lastProbability
    const timeout = setTimeout(()=>{
      setDirection("neutral")
    },500)

    return () => clearTimeout(timeout)
  },[lastProbability])
  const color = direction === "up" ? "text-darkGreen" : direction === "down" ? "text-darkRed" : "text-primaryBlue"
  return (
      <div className="  w-full ">
          <div className=" flex gap-4 flex-col mb-4">
              <div className=" flex items-center gap-4">
                  <img
                      src={marketData.image}
                      alt=""
                      srcset=""
                      className="h-[50px] w-[50px] rounded-small"
                  />
                  <p className=" font-secondary font-semibold  md:text-2xl text-primary">
                      {marketData.title}
                  </p>
              </div>
              <div>
                  <p className=" font-secondary text-labelColor">
                      $ {marketData.totalVolume} Vol
                  </p>
              </div>
          </div>
          <div className=" flex flex-col gap-3   ">
              <p
                  className={`font-secondary font-semibold text-xl ${color} transition-colors duration-300 ease-in-out `}
              >
                  {lastProbability !== 0
                      ? lastProbability * 100
                      : marketData.currentPriceYes * 100}
                  % Chance
              </p>
              <div className=" w-full ">
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
