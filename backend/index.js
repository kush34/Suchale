import express, { urlencoded } from "express";
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import 'dotenv/config'
import connectDB from "./config/database.js";
import userRouter from "./routers/userRouter.js";
import messageRouter from "./routers/messageRouter.js";

import cors from 'cors';
const app = express();
const server = createServer(app);
const io = new Server(server,{
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


app.use('/user',userRouter);
app.use('/message',messageRouter);
app.get("/", (req, res) => res.send("Hello World!"));


io.on('connection', (socket) => {
    console.log('a user connected');
});
server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
// app.listen(3000, () => console.log("Server running on port 3000"));
