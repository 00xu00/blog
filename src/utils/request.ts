import axios from "axios";
import { message } from "antd";

const request = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
          message.error("请先登录");
          localStorage.removeItem("token");
          window.location.href = "/auth";
          break;
        case 403:
          message.error("没有权限");
          break;
        case 404:
          message.error("请求的资源不存在");
          break;
        case 500:
          message.error("服务器错误");
          break;
        default:
          message.error(error.response.data.detail || "请求失败");
      }
    } else {
      message.error("网络错误");
    }
    return Promise.reject(error);
  }
);

export default request;
export {};
