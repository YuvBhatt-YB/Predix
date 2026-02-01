export type TradeValidationResult = {success: true,walletId: string} | {success: false,message: string}

export type Order = {
    id: string,
    userId: string,
    marketId: string,
    type: string,
    orderType:string
    outcome: string,
    quantity: number,
    remainingQuantity: number,
    price: number,
    status: string,
    createdAt: string
}