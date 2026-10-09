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
    editedAt: { type: Date },
    deletedAt: { type: Date },
    readAt: { type: Date },
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

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1, _id: -1 });
messageSchema.index({ receiverId: 1, readAt: 1, senderId: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
