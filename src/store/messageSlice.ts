import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createTime: string;
  isRead: boolean;
}

interface MessageState {
  messages: Message[];
  unreadCount: number;
}

const initialState: MessageState = {
  messages: [],
  unreadCount: 0,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
      state.unreadCount = action.payload.filter((msg) => !msg.isRead).length;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const message = state.messages.find((msg) => msg.id === action.payload);
      if (message && !message.isRead) {
        message.isRead = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.messages.forEach((msg) => {
        if (!msg.isRead) {
          msg.isRead = true;
        }
      });
      state.unreadCount = 0;
    },
  },
});

export const {
  setMessages,
  addMessage,
  markAsRead,
  markAllAsRead,
} = messageSlice.actions;
export default messageSlice.reducer;
