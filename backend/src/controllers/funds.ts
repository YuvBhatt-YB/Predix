import { Request, Response } from "express"

import prisma from "../prisma"
import { includes } from "zod"
import { DepositFundsSchema } from "../Schemas/funds"


export const handleDepositFunds = async(req: Request,res: Response) => {
    const {walletId,amount}= DepositFundsSchema.parse(req.body)
    try{
        const wallet = await prisma.wallet.findUnique({
            where:{id:walletId}
        })
        if(!wallet){
            return res.status(404).json({message:"Wallet Not Found"})
        }
        await prisma.$transaction([
            prisma.wallet.update({
                where:{id:walletId},
                data:{balance: {increment: amount}}
            }),
            prisma.transaction.create({
                data:{
                    amount:amount,
                    type:"CREDIT",
                    description:`CREDITED $${amount} in the Wallet`,
                    walletId:walletId
                }
            })
        ])
        console.log(wallet)
        return res.json({message:`Deposited Amount ${amount} to Wallet Id ${walletId}` })
    }catch(error: any){
        console.log(error)
    }
    
}