import express from "express";
import { getCurrentUser, login, logout, signup } from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import { authRateLimit } from "../middleware/authRateLimit.js";
const router = express.Router();

router.post("/signup", authRateLimit({ scope: "signup", max: 5, windowMs: 60 * 60 * 1000 }), signup);

router.post("/login", authRateLimit({ scope: "login", max: 20, windowMs: 15 * 60 * 1000 }), login);

router.post("/logout", logout);

router.get("/me", protectRoute, getCurrentUser);

export default router;
