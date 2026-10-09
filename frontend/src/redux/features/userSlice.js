import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  fullName: "",
  username: "",
  profilePic: "",
  isAuthenticated: false,
  authChecked: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { _id, fullName, username, profilePic } = action.payload;
      state._id = _id;
      state.fullName = fullName;
      state.username = username;
      state.profilePic = profilePic;
      state.isAuthenticated = true;
      state.authChecked = true;
    },
    logoutUser: (state) => {
      state._id = "";
      state.fullName = "";
      state.username = "";
      state.profilePic = "";
      state.isAuthenticated = false;
      state.authChecked = true;
    },
    finishAuthCheck: (state) => {
      state.authChecked = true;
    },
  },
});

export const { setUser, logoutUser, finishAuthCheck } = userSlice.actions;

export default userSlice.reducer;
