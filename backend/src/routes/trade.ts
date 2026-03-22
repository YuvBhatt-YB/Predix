import { Router } from "express";
import { handleGetOrderBookData, handleGetTradeChartData, handlePostTrade } from "../controllers/trade";

const router = Router()


router.post("/",handlePostTrade)
router.get("/chartData/:marketId",handleGetTradeChartData)
router.get("/orderBookData/:marketId",handleGetOrderBookData)

export default router