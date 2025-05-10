import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

// 获取博客详情
export const getBlogDetail = (id: number) => {
  return axios.get(`${API_URL}/blogs/${id}`);
};

// 获取用户博客列表
export const getUserBlogs = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/blogs/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 获取用户点赞的博客
export const getUserLikedBlogs = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/blogs/user/me/likes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 获取用户收藏的博客
export const getUserFavoriteBlogs = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/blogs/user/me/favorites`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 点赞博客
export const likeBlog = async (blogId: number) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/blogs/${blogId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// 取消点赞博客
export const unlikeBlog = async (blogId: number) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/blogs/${blogId}/unlike`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// 收藏博客
export const favoriteBlog = async (blogId: number) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/blogs/${blogId}/favorite`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// 取消收藏博客
export const unfavoriteBlog = async (blogId: number) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/blogs/${blogId}/unfavorite`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// 获取用户历史记录
export const getUserHistoryBlogs = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/histories/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
