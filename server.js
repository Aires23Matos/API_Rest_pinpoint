import express from 'express';
import dotenv from "dotenv";

import { connectDB } from './config/connectDB.js';
import authRoute from "./routes/auth.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000

app.get("/", (req,res) =>{
    res.send("Hello world 123!")
});

app.use(express.json());
app.use("/api/auth", authRoute)

app.listen(PORT, () =>{
    connectDB();
    console.log(`sever is runing on port http://localhost:${PORT}`)
});
