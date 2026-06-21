import { MarketResolution, MarketStatus } from "@prisma/client";


export type Market  = {
    title:string,
    category:string,
    type:string,
    description:string,
    image:string,
    status:MarketStatus,
    resolution:MarketResolution,
    initialPriceYes:number,
    currentPriceYes:number,
    totalVolume:number,
    spread:number,
    yesShares:number,
    noShares:number,
    endTime:Date
}