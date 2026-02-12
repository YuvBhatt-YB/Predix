import Redis from "ioredis";


export function createRedisClient(){
    return new Redis(process.env.REDIS_CLIENT || "redis://localhost:6379",{
        lazyConnect:true
    })
}

export function createRebuildRedisClient(){
    return new Redis(process.env.REDIS_CLIENT || "redis://localhost:6379")
}

export function createOrderBroadcasterRedisClient(){
    return new Redis(process.env.REDIS_CLIENT || "redis://localhost:6379")
}