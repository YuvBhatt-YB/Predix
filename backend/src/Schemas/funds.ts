import z from "zod";

export const DepositFundsSchema = z.object({
    walletId: z.string(),
    amount: z.number("Amount must be a Number").positive().refine(val => {
        return Number(val.toFixed(2)) === val
    },{message:"Amount can only have upto 2 decimal places."})
})

export type DepositFundInput = z.infer<typeof DepositFundsSchema>