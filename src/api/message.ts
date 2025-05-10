import axios from "axios";
import { API_URL } from "../config";

// 消息接口
export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: {
    id: number;
    username: string;
    avatar: string;
  };
}

// 获取请求头
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// 创建消息
export const createMessage = async (receiverId: number, content: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/messages`,
      {
        receiver_id: receiverId,
        content,
      },
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("创建消息失败:", error);
    throw error;
  }
};

// 获取消息列表
export const getMessages = async () => {
  try {
    const response = await axios.get(`${API_URL}/messages`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("获取消息列表失败:", error);
    throw error;
  }
};

// 获取与特定用户的对话
export const getConversation = async (userId: number) => {
  try {
    const response = await axios.get(`${API_URL}/messages/${userId}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("获取对话失败:", error);
    throw error;
  }
};

// 标记消息已读
export const markMessageAsRead = async (messageId: number) => {
  try {
    const response = await axios.put(
      `${API_URL}/messages/${messageId}/read`,
      {},
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("标记消息已读失败:", error);
    throw error;
  }
};

// 获取未读消息数量
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/messages/unread/count`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("获取未读消息数量失败:", error);
    throw error;
  }
};
