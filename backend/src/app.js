import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import {Server} from "socket.io";
import {createServer} from "node:http";
import cors from "cors";
import mongoose from "mongoose";
import {connectToSocket} from "../src/controllers/socketManager.js";
import userRouter from './routers/userRouter.js';

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

// To set the portNumber using the setMethod.
app.set("port", (process.env.PORT || 1600));

app.use(cors({
    origin: "https://connectmeet01.vercel.app",
    methods:["GET", "POST"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/auth",userRouter);

async function main(){
    //await mongoose.connect("mongodb+srv://nitishkumar9565105_db_user:Z6sCcDXzgNVcLtXQ@cluster0.3q9w9fn.mongodb.net/?appName=Cluster0")
    await mongoose.connect(process.env.MONGO_DB)
}
main().then(()=>console.log("DB connect"))
.catch((err)=>console.log("DB note connect: ", err));

app.get("/video", (req,res)=>{
    res.json({name:"nitish"});
})

server.listen(app.get("port"), ()=>console.log("server listing 1600"));
