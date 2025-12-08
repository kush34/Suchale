import express, { urlencoded } from "express";
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import 'dotenv/config'
import connectDB from "./config/database";
import userRouter from "./routers/userRouter";
import messageRouter from "./routers/messageRouter";
import postRouter from "./routers/postRouter"
import cors from 'cors';
import socketHandler from "./socket";

const allowedOrigins: string[] = [
  process.env.DOMAIN_1,
  process.env.DOMAIN_2
].filter((o): o is string => Boolean(o));

console.log("Allowed origins:", allowedOrigins)

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));



app.use('/user', userRouter);
app.use('/message', messageRouter);
app.use('/post', postRouter);
app.get("/", (req, res) => res.send("Hello World!"));


socketHandler(io);

export { io };
export default server;

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000
  server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
  });
}
