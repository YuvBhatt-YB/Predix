import { Router } from "express";
import { handlePostTrade } from "../controllers/trade";

const router = Router()


router.post("/",handlePostTrade)

export default router