import request from "../utils/request";

// 获取博客详情
export const getBlogDetail = (id: number) => {
  return request.get(`/api/v1/blogs/${id}`);
};

// 点赞博客
export const likeBlog = (id: number) => {
  return request.post(`/api/v1/blogs/${id}/like`);
};

// 取消点赞博客
export const unlikeBlog = (id: number) => {
  return request.delete(`/api/v1/blogs/${id}/like`);
};

// 收藏博客
export const favoriteBlog = (id: number) => {
  return request.post(`/api/v1/blogs/${id}/favorite`);
};

// 取消收藏博客
export const unfavoriteBlog = (id: number) => {
  return request.delete(`/api/v1/blogs/${id}/favorite`);
};
