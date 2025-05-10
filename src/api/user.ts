import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

// 获取用户信息
export const getUserInfo = async (userId?: number) => {
  const token = localStorage.getItem("token");
  const url = userId ? `${API_URL}/users/${userId}` : `${API_URL}/users/me`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 获取用户关注列表
export const getUserFollowing = async (userId: number) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/users/${userId}/following`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 获取用户粉丝列表
export const getUserFollowers = async (userId: number) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/users/${userId}/followers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 关注用户
export const followUser = async (userId: number) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/users/${userId}/follow`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// 取消关注用户
export const unfollowUser = async (userId: number) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${API_URL}/users/${userId}/follow`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 检查是否关注了用户
export const checkFollowingStatus = async (userId: number) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/users/${userId}/is_following`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
