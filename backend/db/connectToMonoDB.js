import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import AuthRateLimit from "../models/authRateLimit.model.js";

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    await Promise.all([Conversation.init(), Message.init(), AuthRateLimit.init()]);
    console.log("MongoDB is connected successfully");
  } catch (error) {
    await mongoose.disconnect();
    throw error;
  }
};

export default connectToMongoDB;
