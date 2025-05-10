import request from './request';

export const likeBlog = (blogId) => {
  return request.post(`/api/v1/blogs/${blogId}/like`);
};

export const unlikeBlog = (blogId) => {
  return request.post(`/api/v1/blogs/${blogId}/unlike`);
};

export const favoriteBlog = (blogId) => {
  return request.post(`/api/v1/blogs/${blogId}/favorite`);
};

export const unfavoriteBlog = (blogId) => {
  return request.post(`/api/v1/blogs/${blogId}/unfavorite`);
}; 