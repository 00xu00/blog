import request from "../utils/request";

// 获取博客评论
export const getBlogComments = (blogId: number) => {
  return request.get(`/api/v1/comments/blog/${blogId}`);
};

// 创建评论
export const createComment = (data: {
  blog_id: number;
  content: string;
  parent_id?: number;
}) => {
  return request.post("/api/v1/comments", data);
};

// 更新评论
export const updateComment = (id: number, data: { content: string }) => {
  return request.put(`/api/v1/comments/${id}`, data);
};

// 删除评论
export const deleteComment = (id: number) => {
  return request.delete(`/api/v1/comments/${id}`);
};

// 点赞评论
export const likeComment = (id: number) => {
  return request.post(`/api/v1/comments/${id}/like`);
};

// 取消点赞评论
export const unlikeComment = (id: number) => {
  return request.delete(`/api/v1/comments/${id}/like`);
};
