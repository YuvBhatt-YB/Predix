import { Router } from "express";
import { handleGettingUserData, handleGoogle, handleLogInUser, handleLogoutUser, handleSignupUser } from "../controllers/auth";
import { validateLoginSchema } from "../middlewares/validateLoginSchema";
import passport from "passport";



const router = Router()

router.post("/signup",handleSignupUser)
router.post("/login",validateLoginSchema,handleLogInUser)
router.get("/me",handleGettingUserData)
router.post("/logout",handleLogoutUser)
router.get("/google",passport.authenticate("google",{scope:["profile","email"]}))
router.get('/google/callback',handleGoogle)
export default router