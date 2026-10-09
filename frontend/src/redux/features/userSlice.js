import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  fullName: "",
  username: "",
  profilePic: "",
  isAuthenticated: false,
  authStatus: "checking",
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
      state.authStatus = "authenticated";
    },
    logoutUser: (state) => {
      state._id = "";
      state.fullName = "";
      state.username = "";
      state.profilePic = "";
      state.isAuthenticated = false;
      state.authStatus = "unauthenticated";
    },
    startAuthCheck: (state) => {
      state.authStatus = "checking";
    },
    setAuthUnavailable: (state) => {
      state.authStatus = "unavailable";
    },
  },
});

export const { setUser, logoutUser, startAuthCheck, setAuthUnavailable } = userSlice.actions;

export default userSlice.reducer;
