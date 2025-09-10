import { Request, Response } from "express";
import { marketSchema } from "../Schemas/markets";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";



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

export const handleGetMarkets = async (req: Request,res:Response) => {
    try{
        const {category,search="",take=10,cursor} = req.query
    
    const where: any = {}

    if(category && category !== "new" && typeof category === "string"){
        where.category = category
    }

    if(typeof search == "string" && search.trim() != ""){
        where.title={
            contains:search,
            mode:"insensitive",
        }
    }

    const queryOptions: any = {
        where,
        orderBy:{createdAt : "desc"},
        take:Number(take) +1
    }
    if(cursor && typeof cursor === "string"){
        queryOptions.cursor = {id:cursor},
        queryOptions.skip = 1
    }

    const markets = await prisma.market.findMany(queryOptions)
    
    let nextCursor: string|null = null

    if(markets.length > Number(take)){
        const nextMarket = markets.pop()
        nextCursor = nextMarket!.id
    }
    return res.json({markets:markets,queryOptions,nextCursor})
    }catch(error){
        console.error(error)
        return res.status(500).json({message:"Something Went Wrong"})
    }
}

export const handleGetMarket = async (req:Request,res:Response) => {
    const marketId: string | undefined = req.params.marketId
    if(!marketId){
        return res.status(400).json({message:"No Market ID found"})
    }
    const marketDetails = await prisma.market.findUnique({
        where:{
            id:marketId
        }
    })
    console.log(marketId)
    return res.status(200).json({marketDetails:marketDetails})
    
}