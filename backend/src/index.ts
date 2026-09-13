import express, { urlencoded } from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import "dotenv/config";
import connectDB from "./config/database";
import userRouter from "./routers/userRouter";
import messageRouter from "./routers/messageRouter";
import postRouter from "./routers/postRouter";
import cors from "cors";
import socketHandler from "./socket";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import notificationRouter from "./routers/notificationRouter";
import storyRouter from "./routers/storyRouter";
import exploreRouter from "./routers/exploreRouter";
const allowedOrigins: string[] = [
  process.env.DOMAIN_1,
  process.env.DOMAIN_2,
].filter((o): o is string => Boolean(o));

console.log("Allowed origins:", allowedOrigins);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

connectDB().catch(() => {
  // database.ts already logged the cause; exit instead of serving without a DB
  if (process.env.NODE_ENV !== "test") process.exit(1);
});
app.use(cookieParser());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
// ponytail: /health sits above strict CORS — origin-less callers
// (docker healthchecks, uptime monitors, curl) must get 200, not a
// CORS 500. Browsers still face strict CORS on every other route.
app.get("/health", (req, res) => res.status(200).json({ ok: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (origin && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use("/user", userRouter);
app.use("/message", messageRouter);
app.use("/post", postRouter);
app.use("/notifications", notificationRouter);
app.use("/story", storyRouter);
app.use("/explore", exploreRouter);
app.get("/", (req, res) => res.send("Hello World!"));

socketHandler(io);

export { io };
export default server;

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
  });
}
