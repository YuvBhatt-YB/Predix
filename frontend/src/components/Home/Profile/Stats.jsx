import React, { useEffect } from 'react'
import StatBox from './StatBox'
import { useSelector } from 'react-redux'
import usePortfolio from '@/hooks/usePortfolio'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Loading from "@/components/ui/Loading"
import { AlertCircleIcon,BanknoteX } from "lucide-react"

const Stats = ({userId}) => {
  const {stats,statsLoading,statsError} = useSelector((state)=>state.portfolio)
  const {fetchStats} = usePortfolio(userId)
  useEffect(()=>{
    fetchStats()
  },[userId])
  if (statsLoading) {
      return (
          <div className=" w-full flex items-center gap-3">
              <div>
                  <Loading />
              </div>
              <p className="  text-primary font-semibold">Loading User Stats</p>
          </div>
      );
  }
  if (statsError) {
      return (
          <div className="flex gap-3 flex-col items-center md:flex-row">
              <Alert variant="destructive" className="max-w-md">
                  <AlertCircleIcon />
                  <AlertTitle>{statsError}</AlertTitle>
              </Alert>
              <Button
                  variant="secondary"
                  className="text-primary"
                  onClick={fetchStats}
              >
                  Retry
              </Button>
          </div>
      );
  }
  const marketTradedValue = stats.marketsTraded ? Number(stats.marketsTraded) > 10 ? stats.marketsTraded : `0${stats.marketsTraded}` : 0
  const profitLossValue = stats.profitLoss ? stats.displayProfitLoss : "$0.00"
  const profitLossClass = Number(stats.profitLoss) > 0 ? "text-darkGreen" : Number(stats.profitLoss) < 0 ? "text-darkRed" : "text-primary"
  return (
      <>
          <div className=" flex gap-3  w-full overflow-x-auto no-scrollBar whitespace-nowrap touch-auto scroll-smooth">
              <StatBox
                  title="Profit/Loss"
                  value={profitLossValue}
                  imgSrc="https://img.icons8.com/ios/50/economic-improvement.png"
                  bgColor="#ECF9F1"
                  valueClass={profitLossClass}
              />
              <StatBox
                  title="Markets Traded"
                  value={marketTradedValue}
                  imgSrc="https://img.icons8.com/ios/50/stall.png"
                  bgColor="#FEFCEB"
              />
          </div>
      </>
  );
}

export default Stats
