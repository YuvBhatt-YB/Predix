import { Request, Response } from "express"

import prisma from "../prisma"
import { includes, ZodError } from "zod"
import { DepositFundsSchema } from "../Schemas/funds"


export const handleDepositFunds = async(req: Request,res: Response) => {
    try{
        const {walletId,amount}= DepositFundsSchema.parse(req.body)
        const wallet = await prisma.wallet.findUnique({
            where:{id:walletId}
        })
        if(!wallet){
            return res.status(404).json({message:"Wallet Not Found"})
        }
        if(amount > 100000){
            return res.status(400).json({message:"Currently Amount only upto $100,000 can be deposited "})
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
        return res.json({message:`Deposited Amount ${amount} to Wallet Id ${walletId}` })
    }catch(error: any){
        console.log(error)
        if(error instanceof ZodError){
            return res.status(400).json({message:error.issues[0]?.message})
        }
    }
    
}

export const handleGetTransactions = async(req:Request,res:Response) => {
    const walletId: any = req.params.walletId
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          walletId: walletId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.json({ transactions: transactions });
    } catch (error) {
        return res.status(404).json({message:"Could not load transactions. Please try again later."})
    }
}