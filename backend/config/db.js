import { createClient } from "redis";
import mongoose from "mongoose";
import { Dev } from "../utils/constants.js"

class DB {
  constructor() {
    this.uri = Dev ? "mongodb://0.0.0.0:27017/trustxchange" : `${process.env.DB_CONNECTION}`;
  }

  async run() {
    try {
      await mongoose.connect(this.uri, {
        autoIndex: true,
      });

      console.log("Successfully connected to MongoDB!");
    } catch (error) {
      console.error(error);
    }
  }
}


class RedisClient {
  client;

  constructor() {
    if (Dev) {
      this.client = createClient({ url: `redis://localhost:6379` });
    } else {
      this.client = createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
        },
      });
    }

    this.client.on("error", (err) => {
      console.error("Redis client failed to connect:", err);
    });
  }

  async run() {
    try {
      await this.client.connect();
      console.log("Successfully connected to Redis!");
    } catch (err) {
      console.error("Redis client failed to connect:", err);
    }
  }

  set(key, value, exp) {
    return this.client.SETEX(key, exp, value);
  }

  get(key) {
    return this.client.GET(key);
  }

  del(key) {
    return this.client.DEL(key);
  }

  async hset(key, field, value) {
    await this.client.HSET(key, field, value);
  }

  async hget(key, field) {
    return this.client.HGET(key, field);
  }

  async hdel(key, field) {
    return this.client.HDEL(key, field);
  }

  async setArray(key, value, exp) {
    const cache = await redisDB.get(key);

    if (!cache) {
        await redisDB.set(key, JSON.stringify([value]), exp);
    } else {
        const parse = JSON.parse(cache);
        parse.push(value);
        await redisDB.set(key, JSON.stringify(parse), exp);
    }
  }

  hgetall(key) {
    return this.client.HGETALL(key);
  }
}

export const redisDB = new RedisClient();
export const mongoDB = new DB();