import test from "node:test";
import assert from "node:assert/strict";
import reducer, { markMessagesRead, mergeMessages, setMessagePage, setSelectedConversation, updateMessage } from "./conversationSlice.js";

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

test("older pages merge without duplicates and receipts update existing messages", () => {
  let state = reducer(undefined, setSelectedConversation({ _id: "peer" }));
  state = reducer(state, setMessagePage({ conversationId: "peer", messages: [
    { _id: "later", senderId: "me", createdAt: "2026-01-02T00:00:00Z", message: "sent" },
  ], hasMore: true, nextCursor: "earlier" }));
  state = reducer(state, setMessagePage({ conversationId: "peer", messages: [
    { _id: "earlier", senderId: "peer", createdAt: "2026-01-01T00:00:00Z", message: "hi" },
    { _id: "later", senderId: "me", createdAt: "2026-01-02T00:00:00Z", message: "sent" },
  ], hasMore: false, nextCursor: null }));
  assert.deepEqual(state.messages.map((message) => message._id), ["earlier", "later"]);
  state = reducer(state, markMessagesRead({ peerId: "peer", senderId: "me", readAt: "2026-01-03T00:00:00Z" }));
  assert.equal(state.messages[1].readAt, "2026-01-03T00:00:00Z");
  state = reducer(state, updateMessage({ ...state.messages[1], message: "edited" }));
  assert.equal(state.messages[1].message, "edited");
});

test("selecting the open conversation again keeps its messages and pagination", () => {
  let state = reducer(undefined, setSelectedConversation({ _id: "peer", fullName: "Peer" }));
  state = reducer(state, setMessagePage({
    conversationId: "peer",
    messages: [{ _id: "message", createdAt: "2026-01-01T00:00:00Z" }],
    hasMore: true,
    nextCursor: "message",
  }));

  const reselected = reducer(state, setSelectedConversation({ _id: "peer", fullName: "Peer" }));
  assert.equal(reselected, state);
  assert.equal(reselected.messages.length, 1);
  assert.equal(reselected.nextCursor, "message");
});
