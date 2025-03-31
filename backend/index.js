import express from "express";
import 'dotenv/config'
import connectDB from "./config/database.js";

const app = express();
connectDB();
app.get("/", (req, res) => res.send("Hello World!"));


app.listen(3000, () => console.log("Server running on port 3000"));
