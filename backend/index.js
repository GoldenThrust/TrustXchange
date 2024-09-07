import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { mongoDB, redisDB } from "./config/db.js";
import "dotenv/config"

import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";
import { createGzip } from "zlib";

import { TbdexHttpClient, Rfq, Quote, Order, OrderStatus, Close, Message, resolveDid } from '@tbdex/http-client';
import { VerifiableCredential, PresentationExchange } from '@web5/credentials';
import { hostUrl, pfiDids } from "./utils/constants.js";
import path from "path";

import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import messengerRoute from "./routes/messenger.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);



app.set("trust proxy", 3)
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/auth', authRoutes)
app.use('xchange', messengerRoute);

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
      {url: '/auth/register'}, 
      {url: '/auth/login'}, 
      {url: '/auth/verify'}, 
      {url: '/auth/logout'}, 
      {url: '/auth/activate'}, 
      {url: '/auth/resend-activate'}, 
      {url: '/auth/forgot-password'}, 
      {url: '/auth/reset-password'}, 
    ]).pipe(smStream)

    streamToPromise(pipeline).then(sm => redisDB.set('sitemap', sm, 10 * 24 * 60 * 60))
  
    smStream.end()
    pipeline.pipe(res).on('error', (e) => {throw e})
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
})

app.use(express.static(path.resolve(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});


server.listen(PORT, () => {
  if (process.env.NODE_ENV === "development") {
    console.log("Running on Development");
  }

  mongoDB.run().catch(console.dir)
  redisDB.run().catch(console.dir)
  console.log(`Server is running on http://localhost:${PORT}`);
});
