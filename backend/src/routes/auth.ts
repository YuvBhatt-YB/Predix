import { Router } from "express";
import { handleLogInUser, handleSignupUser } from "../controllers/auth";
import { validateLoginSchema } from "../validators/authScema";



const router = Router()

router.post("/signup",handleSignupUser)
router.post("/login",validateLoginSchema,handleLogInUser)


export default router