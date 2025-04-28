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
  messages: [
    {
      id: "1",
      sender: {
        id: "2",
        name: "用户A",
        avatar: "",
      },
      content: "你好，请问这篇文章的代码可以分享一下吗？",
      createTime: "2024-01-01 12:00",
      isRead: false,
    },
    {
      id: "2",
      sender: {
        id: "3",
        name: "用户B",
        avatar: "",
      },
      content: "感谢你的分享，对我帮助很大！",
      createTime: "2024-01-01 10:00",
      isRead: false,
    },
  ],
  unreadCount: 2,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
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

export const { addMessage, markAsRead, markAllAsRead } = messageSlice.actions;
export default messageSlice.reducer;
