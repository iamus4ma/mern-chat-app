import test from "node:test";
import assert from "node:assert/strict";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { sendMessage } from "./message.controller.js";

test("retries return one message and both directions use the same conversation key", async () => {
  const pairIndex = Conversation.schema.indexes().find(([fields]) => fields.pairKey === 1);
  const requestIndex = Message.schema.indexes().find(([fields]) => fields.clientMessageId === 1);
  assert.equal(pairIndex?.[1].unique, true);
  assert.equal(requestIndex?.[1].unique, true);
  const originals = {
    exists: User.exists,
    findConversation: Conversation.findOne,
    upsertConversation: Conversation.findOneAndUpdate,
    updateConversation: Conversation.updateOne,
    findMessage: Message.findOne,
    createMessage: Message.create,
  };
  const sender = "507f1f77bcf86cd799439011";
  const receiver = "507f191e810c19729de860ea";
  const requestId = "f4c36ad6-7946-4fa1-85d4-5bd1eb251b08";
  const pairKeys = [];
  const saved = new Map();
  let created = 0;
  User.exists = async () => true;
  Conversation.findOne = async () => null;
  Conversation.findOneAndUpdate = async (query) => {
    pairKeys.push(query.pairKey);
    return { _id: "conversation" };
  };
  Conversation.updateOne = async () => ({ matchedCount: 1 });
  Message.findOne = async ({ senderId, clientMessageId }) => saved.get(`${senderId}:${clientMessageId}`) || null;
  Message.create = async (data) => {
    created += 1;
    const message = { _id: `message-${created}`, ...data, deleteOne: async () => {} };
    saved.set(`${data.senderId}:${data.clientMessageId}`, message);
    return message;
  };
  const response = () => ({
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  });
  try {
    const first = response();
    await sendMessage({ params: { id: receiver }, body: { message: "hello", clientMessageId: requestId }, user: { _id: sender } }, first);
    const retry = response();
    await sendMessage({ params: { id: receiver }, body: { message: "hello", clientMessageId: requestId }, user: { _id: sender } }, retry);
    const reverse = response();
    await sendMessage({ params: { id: sender }, body: { message: "reply", clientMessageId: "745663c2-4011-46e3-913e-9af847a82ff8" }, user: { _id: receiver } }, reverse);
    assert.equal(first.statusCode, 201);
    assert.equal(retry.statusCode, 200);
    assert.equal(first.body._id, retry.body._id);
    assert.equal(created, 2);
    assert.deepEqual(pairKeys, [pairKeys[0], pairKeys[0], pairKeys[0]]);
  } finally {
    User.exists = originals.exists;
    Conversation.findOne = originals.findConversation;
    Conversation.findOneAndUpdate = originals.upsertConversation;
    Conversation.updateOne = originals.updateConversation;
    Message.findOne = originals.findMessage;
    Message.create = originals.createMessage;
  }
});
