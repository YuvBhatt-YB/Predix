import { Router } from "express";
import { handleCreateMarket, handleGetMarket, handleGetMarkets, handleGetMarketSummary } from "../controllers/markets";

const router = Router()

router.get("/",handleGetMarkets)
router.post("/create-market",handleCreateMarket)
router.post("/summary",handleGetMarketSummary)
router.get("/:marketId",handleGetMarket)



export default router