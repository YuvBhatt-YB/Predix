import { Router } from "express";
import { handleLogInUser, handleSignupUser } from "../controllers/auth";


const router = Router()

router.post("/signup",handleSignupUser)
router.post("/login",handleLogInUser)


export default router