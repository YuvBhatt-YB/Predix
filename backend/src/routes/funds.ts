import { Router } from "express";
import { handleDepositFunds, handleGetTransactions } from "../controllers/funds";
import { requireAuth, requireWalletOwner } from "../middlewares/auth.middleware";


const router = Router()

router.post("/deposit",requireAuth,requireWalletOwner,handleDepositFunds)
router.get("/transactions/:walletId",requireAuth,requireWalletOwner,handleGetTransactions)
export default router
