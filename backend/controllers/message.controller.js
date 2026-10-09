import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { io } from "../socket/socket.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;

    if (!mongoose.isValidObjectId(receiverId) || String(senderId) === receiverId ||
        typeof message !== "string" || !message.trim() || message.length > 5000) {
      return res.status(400).json({ error: "Invalid message or recipient" });
    }
    if (!(await User.exists({ _id: receiverId }))) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    const newMessage = new Message({ senderId, receiverId, message: message.trim() });

    await newMessage.save();
    try {
      await Conversation.updateOne(
        { _id: conversation._id },
        { $addToSet: { messages: newMessage._id } }
      );
    } catch (error) {
      await newMessage.deleteOne();
      throw error;
    }

    io.to(receiverId).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
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
