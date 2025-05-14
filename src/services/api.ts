import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError<{ detail: string }>) => {
    // 只有在token过期时才重定向
    if (
      error.response?.status === 401 &&
      error.response?.data?.detail === "无效的认证凭据"
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      window.location.href = "/auth";
    }
    // 提取错误信息
    const errorMessage =
      error.response?.data?.detail || error.message || "请求失败";
    return Promise.reject(new Error(errorMessage));
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

export interface VerificationCodeParams {
  email: string;
}

export interface VerifyCodeParams {
  email: string;
  code: string;
}

export interface ForgotPasswordParams {
  email: string;
}

export interface ResetPasswordParams {
  token: string;
  new_password: string;
}

export const authApi = {
  login: (data: LoginParams): Promise<LoginResponse> => {
    return api.post("/auth/token", {
      email: data.email,
      password: data.password,
    });
  },

  register: (data: RegisterParams) => {
    return api.post("/auth/register", data);
  },

  sendVerificationCode: (data: VerificationCodeParams) => {
    return api.post("/auth/send-verification-code", data);
  },

  verifyCode: (data: VerifyCodeParams) => {
    return api.post("/auth/verify-code", data);
  },

  forgotPassword: (data: ForgotPasswordParams) => {
    return api.post("/auth/forgot-password", data);
  },

  resetPassword: (data: ResetPasswordParams) => {
    return api.post("/auth/reset-password", data);
  },
};

export default api;
