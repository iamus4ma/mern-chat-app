import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getConversations, markConversationRead } from "../controllers/conversation.controller.js";

const router = express.Router();
router.get("/", protectRoute, getConversations);
router.patch("/:id/read", protectRoute, markConversationRead);
export default router;
