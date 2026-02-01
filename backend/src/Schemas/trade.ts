import z from "zod";


export const tradeSchema  = z.object({
    quantity:z.number(),
    price:z.number(),
    type:z.enum(["BUY","SELL"]),
    outcome:z.enum(["YES","NO"]),
    orderType:z.enum(["LIMIT","MARKET"]),
    marketId:z.string(),
    userId:z.string()
})

export type TradeInput = z.infer<typeof tradeSchema>