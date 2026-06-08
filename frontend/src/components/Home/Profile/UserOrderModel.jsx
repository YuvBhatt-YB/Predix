
import React, { useState } from 'react'
import { FaAnglesUp,FaAnglesDown } from "react-icons/fa6";
import btc from "../../../assets/btc.webp"
import { AlertCircleIcon,CheckCircle2Icon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import useUserTrade from '@/hooks/useUserTrade';
import AlertBox from '@/components/Alerts/AlertBox';

const UserOrderModel = ({ data,onRefetch }) => {
    const {cancelOrder,cancelOrderError,cancelOrderSuccess,isCancellingOrder} = useUserTrade()
    const [open, setOpen] = useState(false)
    
    return (
        <div className=" border-1 rounded-img font-secondary shadow-sm">
            <div className=" p-4 flex flex-col gap-4">

                <div className=" flex flex-col  gap-2 md:flex-row md:justify-between md:gap-0">
                    
                    <div className=" flex justify-between">
                        <div className=" flex gap-2 items-center">
                            <img
                                src={data.market.image}
                                alt=""
                                srcSet=""
                                className=" w-[30px] h-[30px] rounded-small"
                            />
                            <p className="text-small font-semibold font-primary">
                                {data.market.title}
                            </p>
                        </div>
                        <div className=" text-esm md:hidden">
                            {data.outcome === "YES" ? (
                                <div className="py-2 px-6 bg-lightGreen flex items-center gap-1.5 rounded-small text-darkGreen">
                                    <p>
                                        <FaAnglesUp />{" "}
                                    </p>
                                    <p className=" font-semibold">Yes</p>
                                </div>
                            ) : (
                                <div className="py-2 px-6 bg-lightRed flex items-center gap-1.5 rounded-small text-darkRed">
                                    <p>
                                        <FaAnglesDown />{" "}
                                    </p>
                                    <p className=" font-semibold">No</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className=" text-esm flex  gap-4 items-center md:items-start mt-2 md:mt-0">
                        <div className="hidden md:block">
                            {data.outcome === "YES" ? (
                                <div className="py-2 px-6 bg-lightGreen flex items-center gap-1.5 rounded-small text-darkGreen">
                                    <p>
                                        <FaAnglesUp />{" "}
                                    </p>
                                    <p className=" font-semibold">Yes</p>
                                </div>
                            ) : (
                                <div className="py-2 px-6 bg-lightRed flex items-center gap-1.5 rounded-small text-darkRed">
                                    <p>
                                        <FaAnglesDown />{" "}
                                    </p>
                                    <p className=" font-semibold">No</p>
                                </div>
                            )}
                        </div>
                        <div className=" flex gap-2 md:block text-center">
                            <p className=" text-primaryGray font-semibold">
                                Total Shares
                            </p>
                            <p className=" text-primary font-semibold">
                                {data.quantity}
                            </p>
                        </div>
                        <div className=" flex gap-2 md:block text-center">
                            <p className=" text-primaryGray font-semibold">
                                Available
                            </p>
                            <p className=" text-primary font-semibold">
                                {data.remainingQuantity}
                            </p>
                        </div>
                        <div className=" flex gap-2 md:block text-center">
                            <p className=" text-primaryGray font-semibold">
                                Filled
                            </p>
                            <p className=" text-primary font-semibold">
                                {data.filledQuantity}
                            </p>
                        </div>
                    </div>
                </div>
                <div className=" flex flex-col gap-2 md:flex-row md:gap-0 justify-between ">
                    <div className="text-esm flex  justify-between gap-4 items-center md:justify-start">
                        <div className=" flex flex-col text-lg  md:block text-center">
                            <p
                                className={`${data.type === "BUY" ? "text-darkGreen " : "text-darkRed"} font-semibold`}
                            >
                                {data.type}
                            </p>
                        </div>
                        <div className=" flex flex-col  md:block text-center">
                            <p className=" text-primaryGray font-semibold">
                                Price
                            </p>
                            <p className={` font-semibold text-primary`}>
                                {data.displayPrice}
                            </p>
                        </div>
                        <div className=" flex flex-col  md:block text-center">
                            <p className=" text-primaryGray font-semibold">
                                Order
                            </p>
                            <p className=" text-primary font-semibold">
                                {data.orderType}
                            </p>
                        </div>
                        <div className=" flex flex-col  md:block text-center">
                            <p className=" text-primaryGray font-semibold">
                                Status
                            </p>
                            <p className={` font-semibold text-primary`}>
                                {data.status}
                            </p>
                        </div>
                    </div>
                    <div>
                        <div
                            className={`py-2  rounded-small text-sm font-semibold text-primaryGray `}
                        >
                            <p>{data.displayCreatedAt}</p>
                        </div>
                    </div>
                </div>
                <div className=" w-full flex justify-end">
                    <AlertDialog open={open} onOpenChange={setOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-primary" disabled={isCancellingOrder}>Cancel Order</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you sure you wanna cancel your order ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will cancel the remaining {data.remainingQuantity} shares.
                                    Any filled shares will stay executed.
                                </AlertDialogDescription>
                                {cancelOrderError && (
                                    <AlertDialogDescription>
                                        <div className=" border border-borderGray p-2 text-darkRed font-semibold rounded-md mt-2 "><p className="flex gap-2 "><AlertCircleIcon  />{cancelOrderError ? cancelOrderError : "Failed to cancel Order"}</p></div>
                                    </AlertDialogDescription>
                                )}
                                {cancelOrderSuccess && (
                                    <AlertDialogDescription>
                                        <AlertDialogDescription>
                                            <div className=" border border-borderGray p-2 text-darkGreen font-semibold rounded-md mt-2 "><p className="flex gap-2 "><CheckCircle2Icon  />{cancelOrderSuccess ? cancelOrderSuccess : "Order cancelled successfully"}</p></div>
                                </AlertDialogDescription>
                                    </AlertDialogDescription>
                                )}
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Exit</AlertDialogCancel>
                                <AlertDialogAction disabled={isCancellingOrder} className=" bg-primaryBlue hover:bg-secondaryBlue" onClick={async()=>{

                                    const success= await cancelOrder(data.id)
                                    
                                    if(success){
                                        setOpen(false)

                                        setTimeout(()=>{
                                            onRefetch()
                                        },500)
                                    }
                                    
                                    }}>{isCancellingOrder ? "Cancelling" : "Cancel Order"}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
};

export default UserOrderModel
