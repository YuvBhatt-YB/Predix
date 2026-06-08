import z from "zod";


export const tradeSchema  = z.object({
    quantity:z.number().optional(),
    price:z.number().optional(),
    amount:z.number().optional(),
    type:z.enum(["BUY","SELL"]),
    outcome:z.enum(["YES","NO"]),
    orderType:z.enum(["LIMIT","MARKET"]),
    marketId:z.string(),
    userId:z.string()
}).superRefine((data,ctx) => {
    if(data.orderType === "MARKET" && data.type === "BUY"){
        if(data.amount === undefined || data.amount <= 0){
            ctx.addIssue({
                code:"custom",
                path:["amount"],
                message:"Amount must be greater than 0"
            })
        }
        return
    }

    if(data.quantity === undefined || data.quantity <= 0){
        ctx.addIssue({
            code:"custom",
            path:["quantity"],
            message:"Quantity must be greater than 0"
        })
    }

    if(data.price === undefined || data.price <= 0){
        ctx.addIssue({
            code:"custom",
            path:["price"],
            message:"Price must be greater than 0"
        })
    }
})

export type TradeInput = z.infer<typeof tradeSchema>
