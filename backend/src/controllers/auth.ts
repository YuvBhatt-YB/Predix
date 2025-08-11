import { Request, Response } from "express";
import { logInSchema, signUpSchema } from "../Schemas/auth";
import { generateProfileImg } from "../services/generateProfileImg";
import { createHashedPassword } from "../services/createHashPassword";
import { PrismaClient, Prisma } from "@prisma/client";
import { verifyHashPassword } from "../services/verifyHashPassword";
import passport from "passport";

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
      },
    });
    return res.send(user);
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
            message:"Logged in Successfully",
            user:req.user
        })
    })
  })(req,res);
};
