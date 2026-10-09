import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    selectedConversation: null,
    messages: [],
    hasMore: false,
    nextCursor: null,
  },
  reducers: {
    setSelectedConversation: (state, action) => {
      if (state.selectedConversation?._id === action.payload?._id) return;
      state.selectedConversation = action.payload;
      state.messages = [];
      state.hasMore = false;
      state.nextCursor = null;
    },
    mergeMessages: (state, action) => {
      if (state.selectedConversation?._id !== action.payload.conversationId) return;
      const messages = new Map(state.messages.map((message) => [message._id, message]));
      for (const message of action.payload.messages) messages.set(message._id, message);
      state.messages = [...messages.values()].sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
      );
    },
    setMessagePage: (state, action) => {
      if (state.selectedConversation?._id !== action.payload.conversationId) return;
      const messages = new Map(state.messages.map((message) => [message._id, message]));
      for (const message of action.payload.messages) messages.set(message._id, message);
      state.messages = [...messages.values()].sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt) || String(a._id).localeCompare(String(b._id))
      );
      state.hasMore = action.payload.hasMore;
      state.nextCursor = action.payload.nextCursor;
    },
    replaceMessagePage: (state, action) => {
      if (state.selectedConversation?._id !== action.payload.conversationId) return;
      state.messages = action.payload.messages;
      state.hasMore = action.payload.hasMore;
      state.nextCursor = action.payload.nextCursor;
    },
    updateMessage: (state, action) => {
      const index = state.messages.findIndex((message) => message._id === action.payload._id);
      if (index !== -1) state.messages[index] = action.payload;
    },
    markMessagesRead: (state, action) => {
      if (state.selectedConversation?._id !== action.payload.peerId) return;
      for (const message of state.messages) {
        if (String(message.senderId) === action.payload.senderId && !message.readAt) {
          message.readAt = action.payload.readAt;
        }
      }
    },
    clearConversation: (state) => {
      state.selectedConversation = null;
      state.messages = [];
      state.hasMore = false;
      state.nextCursor = null;
    },
  },
});

export const {
  setSelectedConversation,
  mergeMessages,
  setMessagePage,
  replaceMessagePage,
  updateMessage,
  markMessagesRead,
  clearConversation,
} = conversationSlice.actions;

export default conversationSlice.reducer;
