import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const term = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!term || term.length < 2 || term.length > 100) return res.json([]);
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
      $or: [
        { fullName: { $regex: escaped, $options: "i" } },
        { username: { $regex: escaped, $options: "i" } },
      ],
    }).select("fullName username profilePic").limit(20);

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
