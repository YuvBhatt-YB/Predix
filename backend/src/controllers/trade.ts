import { Request, Response } from "express";
import { tradeSchema } from "../Schemas/trade";
import prisma from "../prisma";
import { placeOrder, validateTradeCriteria } from "../services/tradeLogic";

export const handlePostTrade = async(req: Request,res:Response) => {
    const {quantity,price,type,outcome,userId,marketId}  = tradeSchema.parse(req.body)
    const result = await validateTradeCriteria(userId,marketId,quantity,price)
    if(result && result.success === true){
        const order = await placeOrder(userId,marketId,quantity,price,type,outcome,result.walletId) 
        return res.status(200).json({order:order})
    }else{
        return res.status(404).json(result)
    }
}