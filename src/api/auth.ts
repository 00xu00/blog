import request from "./request";

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    created_at: string;
  };
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await request.post("/api/v1/auth/token", {
      email,
      password,
    });

    const { access_token, token_type, user } = response.data;

    // 保存token到localStorage
    localStorage.setItem("token", access_token);

    return response.data;
  } catch (error) {
    console.error("登录失败:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/auth";
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token;
};
