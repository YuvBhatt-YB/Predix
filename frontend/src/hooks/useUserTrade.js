import { parseAmount, parseLimitPrice } from "@/utils/amount"
import { useState } from "react";
import api from "@/api/trade"
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { resetTrade } from "@/state/trade/trade";

export default function useUserTrade(){
    const [cancelOrderError,setCancelOrderError] = useState(null)
    const [isCancellingOrder,setIsCancellingOrder] = useState(false)
    const [cancelOrderSuccess,setCancelOrderSuccess] = useState(null)
    const dispatch = useDispatch()
    const [isPlacingOrder,setIsPlacingOrder] = useState(false)

    const placeTrade = async({marketId,userId,selectedCase,selectedOption,selectedOrderType,amount,limit,currentPrice,orderBook}) => {
        try{
            setIsPlacingOrder(true)

            const validationError = validateOrderInput({marketId,userId,selectedCase,selectedOption,selectedOrderType,amount,limit,currentPrice})

            if(validationError){
                toast.error(validationError,{position:"bottom-center"})
                return
            }
            
            const payload = normalizeTradePayload({marketId,userId,selectedCase,selectedOption,selectedOrderType,amount,limit,currentPrice,orderBook})
            
            

            const response = await api.post("/",payload)

            if (!response.data?.ok) {
                toast.error(response.data?.message || "Failed to place order", {
                    position: "bottom-center",
                });
                return;
            }
            toast.success("Order has been placed",{position:"bottom-center"})
            dispatch(resetTrade())

        }catch(error){
            console.error(error)
            toast.error(error?.response?.data?.message || "Failed to place Order. Please try again")
        }finally{
            setIsPlacingOrder(false)
        }

        
    }

    const cancelOrder = async(orderId) => {
        try{
            setCancelOrderError(null)
            setIsCancellingOrder(true)
            setCancelOrderSuccess(null)
            const response = await api.post(`/cancel/${orderId}`)
            setCancelOrderSuccess(response.data.message || "Order Cancelled Successfully")

            return true
        }catch(error){
            setCancelOrderError(error?.response?.data?.message || "Failed to cancel Order")

            return false
        }finally{
            setIsCancellingOrder(false)
        }
    }
    const getSelectedPrice = (selectedOption, currentPrice) => {
        return  selectedOption === "YES" ? currentPrice.YES : currentPrice.NO
    }

    const normalizeTradePayload = ({marketId,userId,selectedCase,selectedOption,selectedOrderType,amount,limit,currentPrice,orderBook}) => {
        const outcome =  selectedOption
        const orderType = selectedOrderType
        const type = selectedCase

        if(orderType === "MARKET"){
            const marketPrice = getBestMarketPrice({
                selectedCase:type,selectedOption:outcome,orderBook
            })

            if (!marketPrice) {
                throw new Error("No liquidity available for this market order");
            }
            
            if(type === "BUY"){
                const rawAmount = parseAmount(amount)
                return {
                    marketId,
                    userId,
                    outcome,
                    orderType,
                    type,
                    amount:rawAmount
                }
            }
            if(type === "SELL"){
                const shares = Number(amount||0)

                return {
                    marketId,
                    userId,
                    outcome,
                    orderType,
                    type,
                    quantity:shares,
                    price:marketPrice
                }
            }
        }
        if(orderType === "LIMIT"){
            const rawLimitPrice = parseLimitPrice(limit.price)
            const price = rawLimitPrice / 100
            const quantity = Number(limit.shares || 0)

            return {
                marketId,
                userId,
                outcome,
                type,
                orderType,
                price,
                quantity
            }
        }
    }
    const validateOrderInput = ({
        marketId,
        userId,
        selectedCase,
        selectedOption,
        selectedOrderType,
        amount,
        limit,
        currentPrice,
    }) => {
        if (!marketId) return "Market not found";

        if (!userId) return "User not found";

        if (!["BUY", "SELL"].includes(selectedCase)) {
            return "Please select Buy or Sell";
        }

        if (!["YES", "NO"].includes(selectedOption)) {
            return "Please select Yes or No";
        }

        if (!["MARKET", "LIMIT"].includes(selectedOrderType)) {
            return "Please select Market or Limit order";
        }

        const selectedPrice =
            selectedOption === "YES" ? currentPrice?.YES : currentPrice?.NO;

        if (!selectedPrice || selectedPrice <= 0) {
            return "Market price is not available";
        }

        if (selectedOrderType === "MARKET") {
            const rawAmount = parseAmount(amount);

            if (!rawAmount || rawAmount <= 0) {
                return selectedCase === "BUY"
                    ? "Please enter a valid amount"
                    : "Please enter valid shares";
            }
            if(rawAmount > 100000){
                return `${selectedCase === "BUY" ? "Amount" : "Shares"} couldn't be more that 100,000`
            }
        }

        if (selectedOrderType === "LIMIT") {
            const rawPrice = parseLimitPrice(limit.price);
            const shares = Number(limit.shares || 0);

            if (!rawPrice || rawPrice <= 0) {
                return "Please enter a valid limit price";
            }

            if (rawPrice > 99) {
                return "Limit price cannot be above 99¢";
            }

            if (!shares || shares <= 0) {
                return "Please enter valid shares";
            }

            if (shares > 10000) {
                return "Shares cannot be above 10,000";
            }
        }

        return null;
    };

    const getBestMarketPrice = ({
        selectedCase,
        selectedOption,
        orderBook,
    }) => {
        const outcomeBook = orderBook?.[selectedOption];

        if (!outcomeBook) return null;

        if (selectedCase === "BUY") {
            const sellPrices = Object.keys(outcomeBook.SELL || {}).map(Number);
            if (!sellPrices.length) return null;

            return Math.min(...sellPrices); // best ask
        }

        if (selectedCase === "SELL") {
            const buyPrices = Object.keys(outcomeBook.BUY || {}).map(Number);
            if (!buyPrices.length) return null;

            return Math.max(...buyPrices); // best bid
        }

        return null;
    };

    return {
        placeTrade,
        cancelOrderError,
        cancelOrderSuccess,
        isCancellingOrder,
        cancelOrder,
        isPlacingOrder
    }
}
