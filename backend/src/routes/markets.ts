import { Router } from "express";
import { handleCreateMarket, handleGetMarkets } from "../controllers/markets";

const router = Router()

router.get("/",handleGetMarkets)
router.post("/create-market",handleCreateMarket)



export default router