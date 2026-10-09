import test from "node:test";
import assert from "node:assert/strict";
import reducer, { mergeMessages, setSelectedConversation } from "./conversationSlice.js";

test("message updates stay in the selected conversation and keep concurrent arrivals", () => {
  let state = reducer(undefined, setSelectedConversation({ _id: "alice" }));
  state = reducer(state, mergeMessages({ conversationId: "alice", messages: [
    { _id: "new", createdAt: "2026-01-02T00:00:00Z" },
  ] }));
  state = reducer(state, mergeMessages({ conversationId: "alice", messages: [
    { _id: "old", createdAt: "2026-01-01T00:00:00Z" },
    { _id: "new", createdAt: "2026-01-02T00:00:00Z" },
  ] }));
  assert.deepEqual(state.messages.map((message) => message._id), ["old", "new"]);

  state = reducer(state, setSelectedConversation({ _id: "bob" }));
  state = reducer(state, mergeMessages({ conversationId: "alice", messages: [
    { _id: "late", createdAt: "2026-01-03T00:00:00Z" },
  ] }));
  assert.deepEqual(state.messages, []);
});
