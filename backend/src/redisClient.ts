import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_CLIENT || "redis://localhost:6379")