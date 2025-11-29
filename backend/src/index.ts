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

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.Frontend_URL,
    credentials: true,
  },
});

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: `${process.env.Frontend_URL}`,
    credentials: true,
  })
);


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
