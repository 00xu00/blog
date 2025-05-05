import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // 处理错误响应
      const message = error.response.data.detail || "请求失败";
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    created_at: string;
  };
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  login: (data: LoginParams): Promise<LoginResponse> => {
    return api.post("/auth/token", {
      username: data.email,
      password: data.password,
    });
  },

  register: (data: RegisterParams) => {
    return api.post("/auth/register", data);
  },
};

export default api;
