import { Request, Response } from "express";
import { marketSchema } from "../Schemas/markets";
import { PrismaClient,Prisma } from "@prisma/client";

const prisma = new PrismaClient()

export const handleCreateMarket = async (req: Request,res:Response) => {
    try{
        const parsed = marketSchema.parse(req.body)
        const market = await prisma.market.findUnique({
            where:{
                title:parsed.title
            }
        })
        if(!market){
            const newMarket = await prisma.market.create({
                data: {
                    ...parsed
                }
            })
            return res.status(200).json({message:"Market Created"})
        }else{
            return res.status(400).json({message:"Market Already Exists"})
        }
        
    }catch(error){
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"){
          const target = error.meta?.target;
          if (Array.isArray(target)) {
            if (target.includes("title")) {
              return res.status(400).json({ message: "Title already exists" });
            }
         }
    }
    return res.status(400).json("Server didn't respond")
    }
}