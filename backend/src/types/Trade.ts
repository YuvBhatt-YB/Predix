export type TradeValidationResult =
    | { success: true; walletId: string }
    | { success: false; message: string };

export type Order = {
    id: string;
    userId: string;
    marketId: string;
    type: string;
    orderType: string;
    outcome: string;
    quantity: number;
    remainingQuantity: number;
    price: number;
    status: string;
    createdAt: string;
};
export enum orderBroadcastEventType{
    ORDER_ADDED = "ORDER_ADDED",
    ORDER_UPDATED = "ORDER_UPDATED"
}
export type orderBroadcastData = {
    broadcastEventType: orderBroadcastEventType;
    orderID: string;
    marketId: string;
    type: string;
    outcome: string;
    quantity: number;
    price: number;
};
