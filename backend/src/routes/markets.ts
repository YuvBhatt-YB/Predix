import { Router } from "express";
import { handleCreateMarket } from "../controllers/markets";

const router = Router()

router.post("/create-market",handleCreateMarket)

export default router