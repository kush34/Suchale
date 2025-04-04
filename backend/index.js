import express, { urlencoded } from "express";
import 'dotenv/config'
import connectDB from "./config/database.js";
import userRouter from "./routers/userRouter.js";
import cors from 'cors';
const app = express();
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

app.get("/", (req, res) => res.send("Hello World!"));


app.listen(3000, () => console.log("Server running on port 3000"));
