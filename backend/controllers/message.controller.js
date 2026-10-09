import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { io } from "../socket/socket.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { message, clientMessageId } = req.body;
    const senderId = req.user._id;

    if (!mongoose.isValidObjectId(receiverId) || String(senderId) === receiverId ||
        typeof message !== "string" || !message.trim() || message.length > 5000 ||
        (clientMessageId !== undefined && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientMessageId))) {
      return res.status(400).json({ error: "Invalid message or recipient" });
    }
    if (!(await User.exists({ _id: receiverId }))) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    const pairKey = [String(senderId), receiverId].sort().join(":");
    let conversation = await Conversation.findOne({ pairKey });
    if (!conversation) {
      conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } });
    }
    if (!conversation) {
      try {
        conversation = await Conversation.findOneAndUpdate(
          { pairKey },
          { $setOnInsert: { participants: [senderId, receiverId] } },
          { upsert: true, new: true }
        );
      } catch (error) {
        if (error.code !== 11000) throw error;
        conversation = await Conversation.findOne({ pairKey });
        if (!conversation) throw error;
      }
    }

    let newMessage = clientMessageId
      ? await Message.findOne({ senderId, clientMessageId })
      : null;
    if (newMessage && (String(newMessage.receiverId) !== receiverId || newMessage.message !== message.trim())) {
      return res.status(409).json({ error: "Message request ID already used" });
    }
    let alreadySaved = Boolean(newMessage);
    if (!newMessage) {
      try {
        newMessage = await Message.create({ senderId, receiverId, message: message.trim(), clientMessageId });
      } catch (error) {
        if (error.code !== 11000 || !clientMessageId) throw error;
        newMessage = await Message.findOne({ senderId, clientMessageId });
        if (!newMessage) throw error;
        alreadySaved = true;
        if (String(newMessage.receiverId) !== receiverId || newMessage.message !== message.trim()) {
          return res.status(409).json({ error: "Message request ID already used" });
        }
      }
    }
    try {
      const result = await Conversation.updateOne(
        { _id: conversation._id },
        alreadySaved
          ? { $addToSet: { messages: newMessage._id } }
          : { $addToSet: { messages: newMessage._id }, $set: { lastMessage: newMessage._id } }
      );
      if (result.matchedCount !== 1) throw new Error("Conversation was not found");
    } catch (error) {
      if (!alreadySaved) await newMessage.deleteOne();
      throw error;
    }

    if (!alreadySaved) {
      io.to(receiverId).to(String(senderId)).emit("newMessage", newMessage);
      io.to(receiverId).to(String(senderId)).emit("conversationChanged");
    }

    res.status(alreadySaved ? 200 : 201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    if (!mongoose.isValidObjectId(userToChatId) || String(senderId) === userToChatId) {
      return res.status(400).json({ error: "Invalid recipient" });
    }

    const pair = {
      $or: [
        { senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    };
    if (req.query.before && req.query.around) {
      return res.status(400).json({ error: "Use one message cursor at a time" });
    }
    const cursorId = req.query.before || req.query.around;
    let query = pair;
    if (cursorId) {
      if (!mongoose.isValidObjectId(cursorId)) return res.status(400).json({ error: "Invalid cursor" });
      const cursor = await Message.findOne({ _id: cursorId, ...pair });
      if (!cursor) return res.status(404).json({ error: "Message not found" });
      query = { $and: [pair, { $or: [
        { createdAt: { $lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, _id: { [req.query.around ? "$lte" : "$lt"]: cursor._id } },
      ] }] };
    }
    const rows = await Message.find(query).sort({ createdAt: -1, _id: -1 }).limit(31);
    const hasMore = rows.length > 30;
    const messages = rows.slice(0, 30).reverse();
    res.json({ messages, hasMore, nextCursor: hasMore ? String(messages[0]._id) : null });
  } catch (error) {
    console.log("Error in getMessages controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const peerId = req.params.id;
    const userId = req.user._id;
    const term = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!mongoose.isValidObjectId(peerId) || !term || term.length < 2 || term.length > 100) {
      return res.status(400).json({ error: "Enter 2 to 100 search characters" });
    }
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: peerId },
        { senderId: peerId, receiverId: userId },
      ],
      message: { $regex: escaped, $options: "i" },
      deletedAt: null,
    }).sort({ createdAt: -1 }).limit(30);
    res.json(messages);
  } catch (error) {
    console.error("Error searching messages", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const changeMessage = async (req, res, remove) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid message" });
    const message = await Message.findOne({ _id: req.params.id, senderId: req.user._id });
    if (!message) return res.status(404).json({ error: "Message not found" });
    if (message.deletedAt) return res.status(409).json({ error: "Message already deleted" });
    if (remove) {
      message.message = "Message deleted";
      message.deletedAt = new Date();
    } else {
      const text = req.body?.message;
      if (typeof text !== "string" || !text.trim() || text.length > 5000) {
        return res.status(400).json({ error: "Invalid message" });
      }
      message.message = text.trim();
      message.editedAt = new Date();
    }
    await message.save();
    io.to(String(message.senderId)).to(String(message.receiverId)).emit("messageUpdated", message);
    io.to(String(message.senderId)).to(String(message.receiverId)).emit("conversationChanged");
    res.json(message);
  } catch (error) {
    console.error("Error changing message", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const editMessage = (req, res) => changeMessage(req, res, false);
export const deleteMessage = (req, res) => changeMessage(req, res, true);
