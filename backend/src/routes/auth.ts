import { Router } from "express";
import { handleGettingUserData, handleLogInUser, handleLogoutUser, handleSignupUser } from "../controllers/auth";
import { validateLoginSchema } from "../middlewares/validateLoginSchema";



const router = Router()

router.post("/signup",handleSignupUser)
router.post("/login",validateLoginSchema,handleLogInUser)
router.get("/me",handleGettingUserData)
router.post("/logout",handleLogoutUser)

export default router