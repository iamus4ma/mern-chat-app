import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientMessageId: { type: String },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

messageSchema.index(
  { senderId: 1, clientMessageId: 1 },
  { unique: true, partialFilterExpression: { clientMessageId: { $type: "string" } } }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
