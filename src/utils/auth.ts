export const setToken = (token: string) => {
  // 清理token中的空白字符
  const cleanToken = token.trim();

  // 验证token格式
  if (!cleanToken) {
    console.error("Token不能为空");
    return;
  }

  // 存储清理后的token
  localStorage.setItem("token", cleanToken);
};

export const getToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  // 返回清理后的token
  return token.trim();
};

export const removeToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("isAuthenticated");
};

export const logout = () => {
  removeToken();
  window.location.href = "/auth";
};
