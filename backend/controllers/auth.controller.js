import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import { io } from "../socket/socket.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;

    if (typeof fullName !== "string" || !fullName.trim() ||
        typeof username !== "string" || !username.trim() ||
        typeof password !== "string" || password.length < 6 ||
        !["male", "female"].includes(gender)) {
      return res.status(400).json({ error: "Invalid signup details" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    //  https://avatar-placeholder.iran.liara.run/

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = new User({
      fullName,
      username,
      password: hashedPassword,
      gender,
      profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
    });
    if (newUser) {
      await newUser.save();
      generateTokenAndSetCookie(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Username already exists" });
    }
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (typeof username !== "string" || !username.trim() || typeof password !== "string") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    if (req.cookies.jwt) {
      try {
        const { userId } = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
        io.in(String(userId)).disconnectSockets(true);
      } catch {
        // An expired or invalid cookie can still be cleared.
      }
    }
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out seccessfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCurrentUser = (req, res) => {
  const { _id, fullName, username, profilePic } = req.user;
  res.status(200).json({ _id, fullName, username, profilePic });
};
