import { Request, Response } from "express";
import { commentSchema, getCommentSchema } from "../Schemas/comment";
import prisma from "../prisma";
import { ZodError } from "zod";
import { Server } from "http";


export const handleGetComments = async(req: Request,res: Response) => {
    const {marketId,take=10,cursor} = getCommentSchema.parse(req.query)
    const where: {marketId: string} = {marketId: marketId}
    const queryOptions: any = {
        where,
        orderBy:{createdAt:"desc"},
        take:take
    }
    if(cursor && typeof cursor === "string"){
        queryOptions.cursor = {id:cursor},
        queryOptions.skip =1
    }
    const totalCount = await prisma.comment.count({where})
    const comments = await prisma.comment.findMany(queryOptions)
    

    let nextCursor: string|null  = comments.at(-1)?.id ?? null
    return res.json({comments:comments,nextCursor,totalCount:totalCount})
}
export const handlePostComment = async(req: Request,res: Response) => {
    try {
        const {marketId,username,text,userProfileImg} = commentSchema.parse(req.body)
        const comment = await prisma.comment.create({data:{
        marketId:marketId,
        username:username,
        userProfileImg:userProfileImg,
        text:text
        }})
        req.app.get("io").of("/comments").to(marketId).emit("newComment",comment)
        return res.status(200).json({message:"Comment Successfully Created"})
    } catch (error: any) {
        if(error instanceof ZodError){
            return res.status(500).json({message:error.issues[0]?.message})
        }
        return res.status(400).json({message:"Comment could not be created"})
    }
    
}