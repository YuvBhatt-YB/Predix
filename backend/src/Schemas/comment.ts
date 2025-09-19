import z from "zod"

export const commentSchema = z.object({
    marketId:z.string(),
    username:z.string(),
    userProfileImg:z.string(),
    text:z.string().min(3,"Comment should be more than 3 Characters").max(200,"Comment cannot be more than 200 characters")
})

export const getCommentSchema = z.object({
    marketId: z.string(),
    take: z.preprocess((val)=>Number(val),z.number()),
    cursor:z.string().optional()
})

export type CommentInput = z.infer<typeof commentSchema>
export type getCommentInput = z.infer<typeof getCommentSchema>