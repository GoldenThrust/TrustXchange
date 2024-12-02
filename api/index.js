import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { mongoDB, redisDB } from "./config/db.js";
import "dotenv/config"

import path from "path";

import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import messengerRoute from "./routes/messenger.js";
import reviewsRoute from "./routes/reviews.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);

app.set("trust proxy", 3)
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/auth', authRoutes)
app.use('/xchange', messengerRoute);
app.use('/review', reviewsRoute)

server.listen(PORT, () => {
  if (process.env.DEV === "TRUE") {
    console.log("Running on Development");
  }

  mongoDB.run().catch(console.dir)
  redisDB.run().catch(console.dir)
});
