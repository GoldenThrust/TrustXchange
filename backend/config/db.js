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
}

export const redisDB = new RedisClient();
export const mongoDB = new DB();