import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { mongoDB, redisDB } from "./config/db.js";
import "dotenv/config"

import websocket from "./config/websocket.js";
// import { SitemapStream, streamToPromise } from "sitemap";
// import { Readable } from "stream";
// import { createGzip } from "zlib";
import path from "path";

import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import messengerRoute from "./routes/messenger.js";
import reviewsRoute from "./routes/reviews.js";
// import { TbdexHttpClient } from "@tbdex/http-client";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import socketcookieParser from "./middleware/socketCookieParser.js";
import socketAuthenticateToken from "./middleware/socketTokenManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const allowOrigin = 'http://localhost:5173';

app.set("trust proxy", 3)
app.use(cors({ origin: allowOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/auth', authRoutes)
app.use('/xchange', messengerRoute);
app.use('/review', reviewsRoute)

// app.get("/sitemap.xml", async function (req, res) {
//   res.header('Content-Type', 'application/xml');
//   // res.header('Content-Encoding', 'gzip');

//   try {
//     let sitemap = await redisDB.get("sitemap");

//     console.log(sitemap);

//     if (sitemap) {
//       res.send(sitemap);
//       return;
//     }

//     const smStream = new SitemapStream({ hostname: 'https://localhost:3000/' });
//     const pipeline = smStream.pipe(createGzip());

//     const authEndpoints = [
//       { url: '/auth/register' },
//       { url: '/auth/login' },
//       { url: '/auth/verify' },
//       { url: '/auth/logout' },
//       { url: '/auth/activate' },
//       { url: '/auth/resend-activate' },
//       { url: '/auth/forgot-password' },
//       { url: '/auth/reset-password' }
//     ];

//     Readable.from(authEndpoints).pipe(smStream);

//     const generatedSitemap = await streamToPromise(pipeline);

//     pipeline.pipe(res).on('error', (e) => {
//       throw e;
//     });

//     smStream.end();
//     await redisDB.set('sitemap', generatedSitemap, 10 * 24 * 60 * 60);
//   } catch (e) {
//     console.error(e);
//     res.status(500).end();
//   }
// });


app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use(express.static(path.resolve(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});



server.listen(PORT, () => {
  if (process.env.DEV === "TRUE") {
    console.log("Running on Development");
  }

  mongoDB.run().catch(console.dir)
  redisDB.run().catch(console.dir)

  const io = new Server(server, {
    adapter: createAdapter(redisDB.client),

    cors: {
      origin: allowOrigin,
      credentials: true,
    }
  });

  io.use(socketcookieParser)
  io.use(socketAuthenticateToken)

  websocket.getConnection(io);
  console.log(`Server is running on http://localhost:${PORT}`);
});
