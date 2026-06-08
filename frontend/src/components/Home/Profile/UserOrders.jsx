import { useSelector } from "react-redux"
import UserOrderModel from "./UserOrderModel";
import Loading from "@/components/ui/Loading"
import { AlertCircleIcon,BanknoteX } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"


const UserOrders = ({ onRetry,fetchOpenOrders }) => {
    const { openOrders, openOrdersLoading, openOrdersError } = useSelector(
        (state) => state.portfolio,
    );
    if (openOrdersLoading) {
        return (
            <div className=" w-full flex items-center gap-3">
                <p>
                    <Loading />
                </p>
                <p className="  text-primary font-semibold">
                    Loading Orders
                </p>
            </div>
        );
    }
    if (openOrdersError) {
        return (
            <div className="flex gap-3 flex-col items-center md:flex-row">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircleIcon />
                    <AlertTitle>{openOrdersError}</AlertTitle>
                </Alert>
                <Button
                    variant="secondary"
                    className="text-primary"
                    onClick={onRetry}
                >
                    Retry
                </Button>
            </div>
        );
    }
    if (openOrders.length === 0) {
        return (
            <div>
                <Alert className="max-w-md">
                    <BanknoteX />
                    <AlertTitle>No Current Orders</AlertTitle>
                </Alert>
            </div>
        );
    }
    return (
        <>
            {openOrders.map((order) => (
                <UserOrderModel key={order.id} data={order} onRefetch={fetchOpenOrders} />
            ))}
        </>
    );
};

export default UserOrders