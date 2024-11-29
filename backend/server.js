import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import connectToMongoDB from "./db/connectToMonoDB.js";
import { app, server } from "./socket/socket.js";
import path from "path";


const PORT = process.env.PORT || 8000;

dotenv.config();

const __dirname = path.resolve();

app.use(express.json()); // to parse the req with JSON payload
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server is running on the port ${PORT}`);
});
