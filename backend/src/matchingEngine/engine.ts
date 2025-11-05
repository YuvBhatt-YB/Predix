import { redis } from "../redisClient"
import { Order } from "../types/Trade"


export const matchingEngine = async (marketId: string) => {
    console.log(`Engine Started for market ${marketId}`)
    while(true){
        try{
            const res:[string,string] | null = await redis.brpop(`orders:${marketId}`,0)
            if(!res) continue 
        
            const order: Order = JSON.parse(res[1])
            console.log(order)

            await matchOrder(order,marketId)
        }catch(error){
            console.error(`Error in engine ${marketId}`)
        }
        
      
    }
}

const matchOrder = async (order:Order,marketId:string) => {
    console.log(`Order ${JSON.stringify(order)} for marketId ${marketId}`)
 }
