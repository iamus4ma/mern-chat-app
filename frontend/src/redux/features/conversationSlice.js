import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    selectedConversation: null,
    messages: [],
  },
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
      state.messages = [];
    },
    mergeMessages: (state, action) => {
      if (state.selectedConversation?._id !== action.payload.conversationId) return;
      const messages = new Map(state.messages.map((message) => [message._id, message]));
      for (const message of action.payload.messages) messages.set(message._id, message);
      state.messages = [...messages.values()].sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
      );
    },
    clearConversation: (state) => {
      state.selectedConversation = null;
      state.messages = [];
    },
  },
});

export const {
  setSelectedConversation,
  mergeMessages,
  clearConversation,
} = conversationSlice.actions;

export default conversationSlice.reducer;
