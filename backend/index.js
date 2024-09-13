import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { mongoDB, redisDB } from "./config/db.js";
import { Server } from "socket.io";
import "dotenv/config"

import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";
import { createGzip } from "zlib";
import path from "path";

import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import messengerRoute from "./routes/messenger.js";
import socketcookieParser from "./middleware/socketCookieParser.js";
import authenticateToken from "./middleware/socketTokenManager.js";
import { TbdexHttpClient } from "@tbdex/http-client";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const allowOrigin = 'http://localhost:5173'
app.set("trust proxy", 3)
app.use(cors({ origin: allowOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/auth', authRoutes)
app.use('/xchange', messengerRoute);

// Generate sitemap
app.get("/sitemap.xml", function (req, res) {
  res.header('Content-Type', 'application/xml');
  res.header('Content-Encoding', 'gzip');
  let sitemap = redisDB.get("sitemap");

  if (sitemap) {
    res.send(sitemap);
    return;
  }

  try {
    const smStream = new SitemapStream({ hostname: 'https://example.com/' })
    const pipeline = smStream.pipe(createGzip())

    const authEndpoints = [
      ...authEndpoints.map(endpoint => ({ url: `/auth/${endpoint}` })),
    ];

    Readable.from([
      { url: '/auth/register' },
      { url: '/auth/login' },
      { url: '/auth/verify' },
      { url: '/auth/logout' },
      { url: '/auth/activate' },
      { url: '/auth/resend-activate' },
      { url: '/auth/forgot-password' },
      { url: '/auth/reset-password' },
    ]).pipe(smStream)

    streamToPromise(pipeline).then(sm => redisDB.set('sitemap', sm, 10 * 24 * 60 * 60))

    smStream.end()
    pipeline.pipe(res).on('error', (e) => { throw e })
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
})

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
console.log(path.join(__dirname, '/uploads'))
app.use(express.static(path.resolve(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});


const io = new Server(server, {
  cors: {
    origin: [allowOrigin],
    credentials: true,
  },
});

io.use(socketcookieParser)
io.use(authenticateToken)


io.on("connection", async (socket) => {
  const order = await redisDB.get(`order_${socket.user.id}`);

  if (order) {
    const cacheOrder = JSON.parse(order)
    cacheOrder.forEach(order => {
      // let close;
  //         let status;
  //         const exchange = await TbdexHttpClient.getExchange({
  //             pfiDid: pfiDid,
  //             did: resolveDid,
  //             exchangeId: order.exchangeId

  //         });

  //         for (const message of exchange) {
  //             if (message instanceof OrderStatus) {
  //                 status = message.data.orderStatus;
  //             }
  //             else if (message instanceof Close) {
  //                 close = message;
  //                 break;
  //             }
  //         }
  // })
    // })
      
    });
    socket.emit("order-status", cacheOrder);
  }
  // Object.entries(quotes).forEach(([key, value]) => {
  //     quotes[key] = JSON.parse(value);
  //     if (!getSecondsRemaining(quotes[key].data.expiresAt)) {
  //         redisDB.hdel(user._id.toString(), key);
  //     }

  //     
})

server.listen(PORT, () => {
  if (process.env.NODE_ENV === "development") {
    console.log("Running on Development");
  }

  mongoDB.run().catch(console.dir)
  redisDB.run().catch(console.dir)
  console.log(`Server is running on http://localhost:${PORT}`);
});
