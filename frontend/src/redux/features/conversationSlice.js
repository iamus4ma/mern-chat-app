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
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    clearConversation: (state) => {
      state.selectedConversation = null;
      state.messages = [];
    },
  },
});

export const {
  setSelectedConversation,
  setMessages,
  clearConversation,
} = conversationSlice.actions;

export default conversationSlice.reducer;
