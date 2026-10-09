import test from "node:test";
import assert from "node:assert/strict";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { deleteMessage, editMessage, getMessages, searchMessages, sendMessage } from "./message.controller.js";

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

test("history returns a bounded page and an older cursor", async () => {
  const original = Message.find;
  const sender = "507f1f77bcf86cd799439011";
  const receiver = "507f191e810c19729de860ea";
  const rows = Array.from({ length: 31 }, (_, index) => ({
    _id: `message-${index}`, createdAt: new Date(2026, 0, 31 - index),
  }));
  Message.find = () => ({ sort: () => ({ limit: async () => rows }) });
  const response = { json(body) { this.body = body; return this; } };
  try {
    await getMessages({ params: { id: receiver }, query: {}, user: { _id: sender } }, response);
    assert.equal(response.body.messages.length, 30);
    assert.equal(response.body.hasMore, true);
    assert.equal(response.body.nextCursor, "message-29");
    assert.equal(response.body.messages.at(-1)._id, "message-0");
  } finally {
    Message.find = original;
  }
});

test("only a message sender can edit or delete it", async () => {
  const original = Message.findOne;
  const sender = "507f1f77bcf86cd799439011";
  const messageId = "507f191e810c19729de860ea";
  const queries = [];
  let saved = 0;
  const message = {
    _id: messageId, senderId: sender, receiverId: "507f1f77bcf86cd799439012",
    message: "old", save: async () => { saved += 1; },
  };
  Message.findOne = async (query) => { queries.push(query); return query.senderId === sender ? message : null; };
  const response = () => ({
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  });
  try {
    const denied = response();
    await editMessage({ params: { id: messageId }, user: { _id: "507f1f77bcf86cd799439013" }, body: { message: "changed" } }, denied);
    assert.equal(denied.statusCode, 404);
    assert.equal(saved, 0);
    const edited = response();
    await editMessage({ params: { id: messageId }, user: { _id: sender }, body: { message: "changed" } }, edited);
    assert.equal(edited.body.message, "changed");
    assert.ok(edited.body.editedAt);
    const deleted = response();
    await deleteMessage({ params: { id: messageId }, user: { _id: sender } }, deleted);
    assert.ok(deleted.body.deletedAt);
    assert.equal(deleted.body.message, "Message deleted");
    assert.equal(saved, 2);
    assert.equal(queries.every((query) => query._id === messageId && query.senderId), true);
  } finally {
    Message.findOne = original;
  }
});

test("history cursor stays within the two participants", async () => {
  const originalFindOne = Message.findOne;
  const originalFind = Message.find;
  const sender = "507f1f77bcf86cd799439011";
  const receiver = "507f1f77bcf86cd799439012";
  const cursorId = "507f1f77bcf86cd799439013";
  let cursorQuery;
  let pageQuery;
  Message.findOne = async (query) => {
    cursorQuery = query;
    return { _id: cursorId, createdAt: new Date("2026-01-02") };
  };
  Message.find = (query) => {
    pageQuery = query;
    return { sort: () => ({ limit: async () => [] }) };
  };
  const response = { json(body) { this.body = body; return this; } };
  try {
    await getMessages({ params: { id: receiver }, query: { before: cursorId }, user: { _id: sender } }, response);
    assert.equal(cursorQuery._id, cursorId);
    assert.equal(cursorQuery.$or.length, 2);
    assert.ok(pageQuery.$and[1].$or[1]._id.$lt);
    assert.deepEqual(response.body.messages, []);
  } finally {
    Message.findOne = originalFindOne;
    Message.find = originalFind;
  }
});

test("message search escapes special characters", async () => {
  const originalFind = Message.find;
  const sender = "507f1f77bcf86cd799439011";
  const receiver = "507f1f77bcf86cd799439012";
  let searchQuery;
  Message.find = (query) => {
    searchQuery = query;
    return { sort: () => ({ limit: async () => [] }) };
  };
  const response = { json(body) { this.body = body; return this; } };
  try {
    await searchMessages({ params: { id: receiver }, query: { q: "a+b" }, user: { _id: sender } }, response);
    assert.equal(searchQuery.message.$regex, "a\\+b");
    assert.deepEqual(response.body, []);
  } finally {
    Message.find = originalFind;
  }
});
