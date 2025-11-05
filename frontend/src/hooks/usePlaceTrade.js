import { parseAmount } from "@/utils/amount"

export default function usePlaceTrade(){

    const placeTrade = (tradeDetails) => {
        const {amount,selectedCase,selectedOption} = tradeDetails
        const parsedAmount = parseAmount(amount)
        console.log(`${parsedAmount} , ${selectedCase} for ${selectedOption}`)
    }

    return {
        placeTrade
    }
}