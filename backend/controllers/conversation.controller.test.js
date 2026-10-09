import test from "node:test";
import assert from "node:assert/strict";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getConversations, markConversationRead } from "./conversation.controller.js";

test("inbox sorts conversations and includes unread counts", async () => {
  const originalFind = Conversation.find;
  const originalMessageFind = Message.find;
  const originalAggregate = Message.aggregate;
  const userId = "507f1f77bcf86cd799439011";
  const firstPeer = "507f1f77bcf86cd799439012";
  const secondPeer = "507f1f77bcf86cd799439013";
  const conversations = [
    { participants: [{ _id: userId }, { _id: firstPeer, fullName: "First" }], messages: [],
      lastMessage: { message: "older", createdAt: new Date("2026-01-01") }, updatedAt: new Date("2026-01-01") },
    { participants: [{ _id: userId }, { _id: secondPeer, fullName: "Second" }], messages: [],
      lastMessage: { message: "newer", createdAt: new Date("2026-01-02") }, updatedAt: new Date("2026-01-02") },
  ];
  Conversation.find = () => ({ select: () => ({ populate: () => ({ populate: async () => conversations }) }) });
  Message.find = () => ({ select: async () => [] });
  Message.aggregate = async () => [{ _id: secondPeer, count: 3 }];
  const response = { json(body) { this.body = body; return this; } };
  try {
    await getConversations({ user: { _id: userId } }, response);
    assert.equal(response.body[0].fullName, "Second");
    assert.equal(response.body[0].unreadCount, 3);
    assert.equal(response.body[1].unreadCount, 0);
  } finally {
    Conversation.find = originalFind;
    Message.find = originalMessageFind;
    Message.aggregate = originalAggregate;
  }
});

test("marking a conversation read updates messages addressed to the user", async () => {
  const originalFindOne = Conversation.findOne;
  const originalUpdateMany = Message.updateMany;
  const userId = "507f1f77bcf86cd799439011";
  const peerId = "507f1f77bcf86cd799439012";
  let updateQuery;
  Conversation.findOne = async () => ({ _id: "conversation" });
  Message.updateMany = async (query) => { updateQuery = query; return { modifiedCount: 2 }; };
  const response = { json(body) { this.body = body; return this; } };
  try {
    await markConversationRead({ params: { id: peerId }, user: { _id: userId } }, response);
    assert.deepEqual(updateQuery, { senderId: peerId, receiverId: userId, readAt: null });
    assert.ok(response.body.readAt);
  } finally {
    Conversation.findOne = originalFindOne;
    Message.updateMany = originalUpdateMany;
  }
});
