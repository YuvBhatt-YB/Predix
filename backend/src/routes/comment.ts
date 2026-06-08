import { Router } from "express";
import { handleGetComments, handlePostComment } from "../controllers/comment";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router()

router.get("/",handleGetComments)
router.post("/",requireAuth,handlePostComment)

export default router
