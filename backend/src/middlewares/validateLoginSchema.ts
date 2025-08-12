import { NextFunction, Request, Response } from "express";
import { logInSchema } from "../Schemas/auth";
import { ZodError } from "zod";


export function validateLoginSchema(req: Request,res: Response,next: NextFunction){
    const result = logInSchema.safeParse(req.body)
    
    if(!result.success){
        return res.status(400).json({error:result.error})
    }
    next()
}