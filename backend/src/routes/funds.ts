import { Router } from "express";
import { handleDepositFunds, handleGetTransactions } from "../controllers/funds";


const router = Router()

router.post("/deposit",handleDepositFunds)
router.get("/transactions/:walletId",handleGetTransactions)
export default router