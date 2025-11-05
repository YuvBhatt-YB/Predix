export type TradeValidationResult = {success: true,walletId: string} | {success: false,message: string}

export type Order = {
    id: string,
    userId: string,
    marketId: string,
    type: string,
    outcome: string,
    quantity: number,
    price: number,
    status: string,
    createdAt: string
}