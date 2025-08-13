import { NextFunction, Request, Response } from "express";
import {  signUpSchema } from "../Schemas/auth";
import { generateProfileImg } from "../services/generateProfileImg";
import { createHashedPassword } from "../services/createHashPassword";
import { PrismaClient, Prisma } from "@prisma/client";

import passport from "passport";
import { UserFromSession } from "../types/UserFromSession";

const prisma = new PrismaClient();

export const handleSignupUser = async (req: Request, res: Response) => {
  try {
    const parsed = signUpSchema.parse(req.body);

    const avatarURL = generateProfileImg(parsed.username);
    const hashedPassword = await createHashedPassword(parsed.password);
    const user = await prisma.user.create({
      data: {
        username: parsed.username,
        email: parsed.email,
        password: hashedPassword,
        profileImg: avatarURL,
        wallet:{
          create:{
            balance:0
          }
        }
      },
      include:{wallet:true}
    });
    
    req.login(user,(err)=>{
      if(err){
        return res.status(500).json({message:"Login after signup failed"})
      }
      return res.json({
            message:"Logged in Successfully"
        })
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = error.meta?.target;

      if (Array.isArray(target)) {
        if (target.includes("username")) {
          return res.status(400).json({ message: "Username aleady exists" });
        }
        if (target.includes("email")) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      return res.status(400).json({ message: "Database Error" });
    }
    return res.status(400).json({ message: "Server didn't respond" });
  }
};

export const handleLogInUser = async (req: Request, res: Response) => {
  passport.authenticate("local", (err: unknown, user: Express.User | false , info: {message?: string}) => {
    if (err) return res.status(400).json({ message: "Internal Server Error" });

    if (!user) {
      return res.status(400).json({message: info?.message || "Invalid Credentials"});
    }
    req.logIn(user,(err:unknown) => {
        if(err){
            return res.status(500).json({message:"Login Failed"})
        }

        return res.json({
            message:"Logged in Successfully"
        })
    })
  })(req,res);
};

export const handleGettingUserData = async(req: Request,res: Response) => {
    if(req.isAuthenticated()){
      const loggedInUser = req.user as UserFromSession
      const user = await prisma.user.findUnique({
        where:{
          id:loggedInUser.id
        },
        include:{wallet:true}
      })
        return res.json({user: user})
    } else{
        return res.json({user:undefined})
    }
}

export const handleLogoutUser = async(req: Request,res: Response) => {

  if(!req.user) return res.status(401).json({message:"No User Logged In"})

  req.logOut((error)=>{
    if(error) return res.status(400).json({message:"Logout Error"})
  })

  return res.status(200).json({message:"Logged Out Succesfully"})
}

export const handleGoogle = async(req: Request,res: Response,next: NextFunction) => {
  passport.authenticate('google',(err: unknown, user: Express.User | false,info: {message?: string} )=> {
    if(err) return  res.status(400).json({ message: "Internal Server Error" })
    
    if(!user){
        return res.redirect(`${process.env.FRONTEND_URL}/signup/error=${encodeURIComponent(info?.message || "Google Auth Failed")}`)
    }

    req.logIn(user,(err) => {
      if(err) return res.status(500).json(err)
      
        return res.redirect(`${process.env.FRONTEND_URL}/home`)
    })

  })(req,res,next)
}