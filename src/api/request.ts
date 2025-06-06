import axios from "axios";
import { getToken } from "../utils/auth";

const request = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 10000,
  withCredentials: true,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      // 确保token格式正确
      const tokenValue = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
      config.headers.Authorization = tokenValue;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem("token");
          window.location.href = "/auth";
          break;
        case 403:
          // 权限不足
          console.error("权限不足");
          break;
        case 404:
          // 请求的资源不存在
          console.error("请求的资源不存在");
          break;
        case 500:
          // 服务器错误
          console.error("服务器错误");
          break;
        default:
          console.error("发生错误:", error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default request;
