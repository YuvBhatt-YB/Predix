import Loading from "@/components/ui/Loading"
import { AlertCircleIcon,BanknoteX } from "lucide-react"
import { useSelector } from "react-redux"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import UserPositionModal from "./UserPositionModal"


const UserPositions = ({onRetry}) => {
    const {positions,positionsLoading,positionsError} = useSelector((state)=>state.portfolio)
    if(positionsLoading){
        return (
            <div className=" w-full flex items-center gap-3">
                <div><Loading /></div>
                <p className="  text-primary font-semibold">Loading Positions</p>
            </div>
        )
    }
    if (positionsError) {
        return (
            <div className="flex gap-3 flex-col items-center md:flex-row">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircleIcon />
                    <AlertTitle>{positionsError}</AlertTitle>
                </Alert>
                <Button variant="secondary" className="text-primary" onClick={onRetry}>Retry</Button>
            </div>
        );
    }
    if(positions.length === 0){
        return (
            <div >
                <Alert  className="max-w-md">
                    <BanknoteX />
                    <AlertTitle>No Current Positions</AlertTitle>
                </Alert>
               
            </div>
        );
    }
    return (
        <>
        {positions.map((position) => (
            <UserPositionModal key={position.id} data={position} />
        ))}
        </>
    )
}

export default UserPositions