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
        { $addToSet: { messages: newMessage._id } }
      );
      if (result.matchedCount !== 1) throw new Error("Conversation was not found");
    } catch (error) {
      if (!alreadySaved) await newMessage.deleteOne();
      throw error;
    }

    if (!alreadySaved) io.to(receiverId).emit("newMessage", newMessage);

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

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json([]);
    }
    const messages = conversation.messages;
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
