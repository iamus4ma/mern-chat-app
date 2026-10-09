import AuthRateLimit from "../models/authRateLimit.model.js";

export const authRateLimit = ({ scope, max, windowMs }) => async (req, res, next) => {
  try {
    const now = new Date();
    const key = `${scope}:${req.ip}`;
    const activeWindow = { $gt: ["$resetAt", now] };
    const record = await AuthRateLimit.findOneAndUpdate(
      { key },
      [{ $set: {
        key,
        count: { $cond: [activeWindow, { $add: ["$count", 1] }, 1] },
        resetAt: { $cond: [activeWindow, "$resetAt", new Date(now.getTime() + windowMs)] },
      } }],
      { upsert: true, new: true }
    );

    if (record.count > max) {
      const retryAfter = Math.max(1, Math.ceil((record.resetAt.getTime() - Date.now()) / 1000));
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }
    next();
  } catch (error) {
    next(error);
  }
};
