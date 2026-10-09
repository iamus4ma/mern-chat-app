import express from "express";
import { deleteMessage, editMessage, getMessages, searchMessages, sendMessage } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.get("/:id/search", protectRoute, searchMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.patch("/:id", protectRoute, editMessage);
router.delete("/:id", protectRoute, deleteMessage);

export default router;
