import { createClient } from "redis";
import "dotenv/config";

const redisGeoClient = createClient({
  url: `redis://localhost:${process.env.REDIS_GEO_PORT}`,
})
  .on("error", (err) => console.log("RedisGeo Client Error", err))
  .on("ready", () => console.log("RedisGeo Client Ready"));

const redisBloomClient = createClient({
  url: `redis://localhost:${process.env.REDIS_BLOOM_PORT}`,
})
  .on("error", (err) => console.log("RedisBloom Client Error", err))
  .on("ready", () => console.log("RedisBloom Client Ready"));

export { redisGeoClient, redisBloomClient };
