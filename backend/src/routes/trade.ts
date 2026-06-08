import { Router } from "express";
import { handleCancelTrade, handleGetOrderBookData, handleGetTradeChartData, handlePostTrade } from "../controllers/trade";
import { requireAuth, requireOrderOwner, requireSameUser } from "../middlewares/auth.middleware";

const router = Router()


router.post("/",requireAuth,requireSameUser,handlePostTrade)
router.post("/cancel/:orderId",requireAuth,requireOrderOwner,handleCancelTrade)
router.get("/chartData/:marketId",handleGetTradeChartData)
router.get("/orderBookData/:marketId",handleGetOrderBookData)

export default router
