import axios from "axios";
import { Blog } from "../types/blog";
import request from "../utils/request";

const API_URL = "http://localhost:8000/api/v1";

interface PaginatedResponse {
  data: Blog[];
  total: number;
}

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

// 获取推荐博客
export const getRecommendedBlogs = async (): Promise<Blog[]> => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/blogs/recommended`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 获取最新博客列表
export const getLatestBlogs = async (
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse> => {
  const skip = (page - 1) * pageSize;
  const response = await axios.get(
    `${API_URL}/blogs/latest?skip=${skip}&limit=${pageSize}`
  );
  // 如果返回的是数组，将其包装成分页格式
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      total: response.data.length,
    };
  }
  return response.data;
};
