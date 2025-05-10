import request from "../utils/request";

// 获取消息列表
export const getMessages = () => {
  return request({
    url: "/api/v1/messages",
    method: "get",
  });
};

// 获取与特定用户的对话
export const getConversation = (userId: number) => {
  return request({
    url: `/api/v1/messages/${userId}`,
    method: "get",
  });
};

// 发送消息
export const sendMessage = (data: { content: string; receiver_id: number }) => {
  return request({
    url: "/api/v1/messages",
    method: "post",
    data,
  });
};

// 标记消息为已读
export const markMessageAsRead = (messageId: number) => {
  return request({
    url: `/api/v1/messages/${messageId}/read`,
    method: "put",
  });
};

// 获取未读消息数量
export const getUnreadCount = () => {
  return request({
    url: "/api/v1/messages/unread/count",
    method: "get",
  });
};
