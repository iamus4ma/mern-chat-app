import test from "node:test";
import assert from "node:assert/strict";
import reducer, { logoutUser, setAuthUnavailable, setUser, startAuthCheck } from "./userSlice.js";

test("session check keeps server failure distinct from logged out", () => {
  let state = reducer(undefined, startAuthCheck());
  assert.equal(state.authStatus, "checking");
  state = reducer(state, setAuthUnavailable());
  assert.equal(state.authStatus, "unavailable");
  state = reducer(state, setUser({ _id: "user", fullName: "User", username: "user", profilePic: "" }));
  assert.equal(state.authStatus, "authenticated");
  state = reducer(state, logoutUser());
  assert.equal(state.authStatus, "unauthenticated");
});
