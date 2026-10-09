import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    pairKey: { type: String },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
  },

  { timestamps: true }
);

conversationSchema.index(
  { pairKey: 1 },
  { unique: true, partialFilterExpression: { pairKey: { $type: "string" } } }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
