
import Loading from "@/components/ui/Loading"
import { AlertCircleIcon,BanknoteX } from "lucide-react"
import { useSelector } from "react-redux"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import UserTradeModal from "./UserTradeModal"
import { ArrowLeft } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

const UserTrades = ({onRetry,fetchTrades}) => {
    const {trades,tradesLoading,tradesError,tradePage,hasMoreTrades} = useSelector((state)=>state.portfolio)
    if(tradesLoading){
        return (
            <div className=" w-full flex items-center gap-3">
                <div><Loading /></div>
                <p className="  text-primary font-semibold">Loading Trades</p>
            </div>
        )
    }
    if (tradesError) {
        return (
            <div className="flex gap-3 flex-col items-center md:flex-row">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircleIcon />
                    <AlertTitle>{tradesError}</AlertTitle>
                </Alert>
                <Button variant="secondary" className="text-primary" onClick={() => onRetry(tradePage)}>Retry</Button>
            </div>
        );
    }
    if(trades.length === 0){
        return (
            <div >
                <Alert  className="max-w-md">
                    <BanknoteX />
                    <AlertTitle>No Current Trades</AlertTitle>
                </Alert>
               
            </div>
        );
    }
    return (
        <>
        {trades.map((trade) => (
            <UserTradeModal key={trade.id} data={trade} />
        ))}
        <div className="  flex justify-end">
            <div className=" flex items-center gap-2">
                <Button variant="outline" size="icon" disabled={tradePage === 1 || tradesLoading} onClick={() => fetchTrades(tradePage-1)}><ArrowLeft /></Button>
                <p className=" text-lg text-primary font-semibold">{tradePage < 10 ? `0${tradePage}`:tradePage}</p>
                <Button variant="outline" size="icon" disabled={!hasMoreTrades || tradesLoading} onClick={() => fetchTrades(tradePage+1)}><ArrowRight /></Button>
            </div>
        </div>
        </>
    )
}

export default UserTrades