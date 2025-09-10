import { Router } from "express";
import { handleDepositFunds } from "../controllers/funds";


const router = Router()

router.post("/deposit",handleDepositFunds)

export default router