import mongoose from "mongoose";

const authRateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true },
  resetAt: { type: Date, required: true },
});

authRateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

const AuthRateLimit = mongoose.model("AuthRateLimit", authRateLimitSchema);

export default AuthRateLimit;
