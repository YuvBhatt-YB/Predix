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
export enum marketBroadcastEventType{
    TRADE_EXECUTED = "TRADE_EXECUTED",
    DEPTH_UPDATED = "DEPTH_UPDATED",
    DEPTH_ADDED = "DEPTH_ADDED"
}

export type TradeExecutedEventType = {
    broadcastEventType: marketBroadcastEventType.TRADE_EXECUTED;
    marketId: string;
    side:string;
    quantity: number;
    price: number;
    dateTime: Date;
}
export type depthUpdatedEventType = {
    broadcastEventType: marketBroadcastEventType.DEPTH_UPDATED;
    marketId: string;
    type: string;
    outcome: string;
    quantity: number;
    price: number
};

export type depthAddedEventType = {
    broadcastEventType: marketBroadcastEventType.DEPTH_ADDED;
    marketId: string;
    type: string;
    outcome: string;
    quantity: number;
    price: number
}

export type MarketStreamEvent = TradeExecutedEventType | depthUpdatedEventType | depthAddedEventType

export type Depth = {
    "YES":{
        "BUY":{},
        "SELL":{}
    },
    "NO":{
        "BUY":{},
        "SELL":{}
    }
}