import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { io } from "../socket/socket.js";

export const getConversations = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const conversations = await Conversation.find({ participants: req.user._id })
      .select({ participants: 1, lastMessage: 1, updatedAt: 1, messages: { $slice: -1 } })
      .populate("participants", "fullName username profilePic")
      .populate("lastMessage", "message senderId createdAt deletedAt");
    const legacyIds = conversations.filter((conversation) => !conversation.lastMessage)
      .map((conversation) => conversation.messages.at(-1)).filter(Boolean);
    const legacyMessages = await Message.find({ _id: { $in: legacyIds } })
      .select("message senderId createdAt deletedAt");
    const legacyById = new Map(legacyMessages.map((message) => [String(message._id), message]));
    const unreadRows = await Message.aggregate([
      { $match: { receiverId: req.user._id, readAt: null } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
    ]);
    const unreadBySender = new Map(unreadRows.map((row) => [String(row._id), row.count]));

    const inbox = conversations.map((conversation) => {
      const other = conversation.participants.find((participant) => participant && String(participant._id) !== userId);
      if (!other) return null;
      const lastMessage = conversation.lastMessage || legacyById.get(String(conversation.messages.at(-1)));
      return {
        _id: other._id,
        fullName: other.fullName,
        username: other.username,
        profilePic: other.profilePic,
        lastMessage,
        unreadCount: unreadBySender.get(String(other._id)) || 0,
        updatedAt: lastMessage?.createdAt || conversation.updatedAt,
      };
    }).filter(Boolean);
    inbox.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json(inbox);
  } catch (error) {
    console.error("Error loading conversations", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markConversationRead = async (req, res) => {
  try {
    const peerId = req.params.id;
    const userId = String(req.user._id);
    if (!mongoose.isValidObjectId(peerId) || peerId === userId) {
      return res.status(400).json({ error: "Invalid recipient" });
    }
    const conversation = await Conversation.findOne({ participants: { $all: [userId, peerId] } });
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });
    const readAt = new Date();
    await Message.updateMany(
      { senderId: peerId, receiverId: userId, readAt: null },
      { $set: { readAt } }
    );
    io.to(peerId).emit("messagesRead", { readerId: userId, readAt });
    io.to(userId).to(peerId).emit("conversationChanged");
    res.json({ readAt });
  } catch (error) {
    console.error("Error marking conversation read", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
