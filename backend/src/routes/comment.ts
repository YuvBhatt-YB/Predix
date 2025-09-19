import { Router } from "express";
import { handleGetComments, handlePostComment } from "../controllers/comment";

const router = Router()

router.get("/",handleGetComments)
router.post("/",handlePostComment)

export default router