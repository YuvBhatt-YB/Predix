import z from "zod";


export const marketSchema  = z.object({
    title:z.string(),
    category:z.string(),
    type:z.string(),
    description:z.string(),
    image:z.string(),
    status:z.enum(["ACTIVE","CLOSED","RESOLVED","CANCELLED"]),
    resolution:z.enum(["YES","NO","NULL"]),
    initialPriceYes:z.number(),
    currentPriceYes:z.number(),
    totalVolume:z.number(),
    spread:z.number(),
    yesShares:z.number(),
    noShares:z.number(),
    endTime:z.preprocess((val)=> new Date(val as string),z.date())
})

export type MarketInput = z.infer<typeof marketSchema>