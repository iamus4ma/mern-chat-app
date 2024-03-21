import { createSlice } from "@reduxjs/toolkit";

const storedUser = JSON.parse(localStorage.getItem("user"));

const initialState = {
  _id: storedUser ? storedUser._id : "",
  fullName: storedUser ? storedUser.fullName : "",
  username: storedUser ? storedUser.username : "",
  profilePic: storedUser ? storedUser.profilePic : "",
  isAuthenticated: localStorage.getItem("isAuthenticated") === "true",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { _id, fullName, username, profilePic } = action.payload;
      const isAuthenticated =
        fullName !== "" && username !== "" && profilePic !== "";

      // Update state
      state._id = _id;
      state.fullName = fullName;
      state.username = username;
      state.profilePic = profilePic;
      state.isAuthenticated = isAuthenticated;

      // Update localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({ _id, fullName, username, profilePic })
      );
      localStorage.setItem("isAuthenticated", isAuthenticated);
    },
    logoutUser: (state) => {
      state._id = "";
      state.fullName = "";
      state.username = "";
      state.profilePic = "";
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;

export default userSlice.reducer;
