import { Router } from "express";
import { handleGetOpenOrders, handleGetPositions, handleGetTrades, handleGetUserStats } from "../controllers/portfolio";
import { requireAuth, requireSameUser } from "../middlewares/auth.middleware";


const router = Router()

router.get("/positions/:userId",requireAuth,requireSameUser,handleGetPositions)
router.get("/open-orders/:userId",requireAuth,requireSameUser,handleGetOpenOrders)
router.get("/trades/:userId",requireAuth,requireSameUser,handleGetTrades)
router.get("/stats/:userId",requireAuth,requireSameUser,handleGetUserStats)

export default router
