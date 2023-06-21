import { Redis } from '@upstash/redis'
import * as dotenv from 'dotenv'
dotenv.config()
enum REDIS_ACTIONS {
    GET = `get`,
    SET = `set`,
}

const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env || {}

const upstashRedis = new Redis({
    // @ts-ignore
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
})

export const RedisGet = async (key: string | undefined) => {
    if (!key) return null
    const data: any = await upstashRedis.get(key)
    return data
}

type RedisValue = string | any[] | { [index: string]: any } | undefined
export const RedisSet = async (key: string | undefined, value: RedisValue) => {
    if (!key) return null
    if (!value) return await RedisGet(key)
    const data = await upstashRedis.set(key, value)
    if (data === `OK`) return value
    return null
}
