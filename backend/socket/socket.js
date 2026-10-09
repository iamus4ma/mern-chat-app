import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = new Map();

io.use(async (socket, next) => {
	try {
		const cookie = socket.handshake.headers.cookie?.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith("jwt="));
		const token = cookie && decodeURIComponent(cookie.slice(4));
		if (!token) return next(new Error("Unauthorized"));
		const { userId, exp } = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(userId).select("_id");
		if (!user || !Number.isFinite(exp)) return next(new Error("Unauthorized"));
		socket.data.userId = user.id;
		socket.data.expiresAt = exp * 1000;
		next();
	} catch {
		next(new Error("Unauthorized"));
	}
});

const emitOnlineUsers = () => io.emit("getOnlineUsers", [...userSocketMap.keys()]);

io.on("connection", (socket) => {
	console.log("a user connected", socket.id);

	const userId = socket.data.userId;
	socket.join(userId);
	if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
	userSocketMap.get(userId).add(socket.id);
	const expiry = setTimeout(() => socket.disconnect(true), Math.max(0, socket.data.expiresAt - Date.now()));
	expiry.unref();

	// io.emit() is used to send events to all the connected clients
	emitOnlineUsers();

	// socket.on() is used to listen to the events. can be used both on client and server side
	socket.on("disconnect", () => {
		clearTimeout(expiry);
		console.log("user disconnected", socket.id);
		const sockets = userSocketMap.get(userId);
		sockets.delete(socket.id);
		if (sockets.size === 0) userSocketMap.delete(userId);
		emitOnlineUsers();
	});
});

export { app, io, server };
