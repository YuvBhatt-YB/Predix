import { createOrderBroadcasterRedisClient } from "./redis"


export const orderBroadcaster = async () => {
    const client = createOrderBroadcasterRedisClient()

    console.log(`Order Broadcaster started ${process.pid}`)

    try{
        const latestMessage = await client.xread("BLOCK",0,"STREAMS",`orderBroadCaster`,"$")
        console.log(`This is from orderStream ${latestMessage}`)
    }catch(error){
        console.error(`Error in Order Broadcaster : ${error}`)
    }

}