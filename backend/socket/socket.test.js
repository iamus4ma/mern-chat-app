import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { io, server } from "./socket.js";

const { io: client } = createRequire(new URL("../../frontend/package.json", import.meta.url))("socket.io-client");

test("a claimed user ID cannot connect without a session cookie", async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const socket = client(`http://127.0.0.1:${server.address().port}`, {
    query: { userId: "someone-else" },
    reconnection: false,
    timeout: 2000,
  });
  try {
    const error = await new Promise((resolve, reject) => {
      socket.once("connect_error", resolve);
      socket.once("connect", () => reject(new Error("Unauthenticated socket connected")));
    });
    assert.equal(error.message, "Unauthorized");
  } finally {
    socket.disconnect();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("a valid session joins its own room and receives messages on multiple connections", async () => {
  const originalFindById = User.findById;
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "socket-test-secret";
  User.findById = () => ({ select: async () => ({ id: "507f1f77bcf86cd799439011" }) });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const token = jwt.sign({ userId: "507f1f77bcf86cd799439011" }, process.env.JWT_SECRET, { expiresIn: "1m" });
  const connect = () => client(`http://127.0.0.1:${server.address().port}`, {
    extraHeaders: { Cookie: `jwt=${token}` },
    reconnection: false,
    timeout: 2000,
  });
  const first = connect();
  const second = connect();
  try {
    await Promise.all([first, second].map((socket) => new Promise((resolve, reject) => {
      socket.once("connect", resolve);
      socket.once("connect_error", reject);
    })));
    const received = [first, second].map((socket) => new Promise((resolve) => socket.once("newMessage", resolve)));
    io.to("507f1f77bcf86cd799439011").emit("newMessage", { message: "hello" });
    assert.deepEqual(await Promise.all(received), [{ message: "hello" }, { message: "hello" }]);
  } finally {
    first.disconnect();
    second.disconnect();
    await new Promise((resolve) => server.close(resolve));
    User.findById = originalFindById;
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  }
});
