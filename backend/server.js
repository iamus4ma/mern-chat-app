import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

import connectToMongoDB from "./db/connectToMonoDB.js";
import { app, server } from "./socket/socket.js";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(projectRoot, ".env") });

const PORT = process.env.PORT || 8000;

app.set("trust proxy", 1);
app.use(express.json()); // to parse the req with JSON payload
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);

app.use(express.static(path.join(projectRoot, "frontend", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(projectRoot, "frontend", "dist", "index.html"));
});

// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

connectToMongoDB()
  .then(() => server.listen(PORT, () => console.log(`Server is running on the port ${PORT}`)))
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exitCode = 1;
  });
