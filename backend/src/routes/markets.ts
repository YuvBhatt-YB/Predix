import { Router } from "express";
import { handleCreateMarket, handleGetMarket, handleGetMarkets } from "../controllers/markets";

const router = Router()

router.get("/",handleGetMarkets)
router.post("/create-market",handleCreateMarket)
router.get("/:marketId",handleGetMarket)


export default router