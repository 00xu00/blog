import request from "./request";
import { isAuthenticated } from "./auth";

export interface SearchHistory {
  id: number;
  keyword: string;
  created_at: string;
}

export interface SearchResult {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  author: {
    id: number;
    username: string;
    avatar: string | null;
  };
  created_at: string;
  likes_count: number;
  favorites_count: number;
  views_count: number;
}

// 获取搜索历史
export const getSearchHistory = async (): Promise<SearchHistory[]> => {
  if (!isAuthenticated()) {
    return [];
  }

  try {
    const response = await request.get("/api/v1/search/history");
    return response.data;
  } catch (error) {
    console.error("获取搜索历史失败:", error);
    return [];
  }
};

// 清空搜索历史
export const clearSearchHistory = async (): Promise<void> => {
  if (!isAuthenticated()) {
    return;
  }

  try {
    await request.delete("/api/v1/search/history");
  } catch (error) {
    console.error("清空搜索历史失败:", error);
    throw error;
  }
};

// 保存搜索历史
export const saveSearchHistory = async (keyword: string): Promise<void> => {
  if (!isAuthenticated()) {
    return;
  }

  try {
    await request.post("/api/v1/search", { keyword });
  } catch (error) {
    console.error("保存搜索历史失败:", error);
  }
};

// 搜索博客
export const searchBlogs = async (keyword: string): Promise<SearchResult[]> => {
  try {
    const response = await request.get(
      `/api/v1/search/blogs?keyword=${encodeURIComponent(keyword)}`
    );

    // 如果用户已登录，保存搜索历史
    if (isAuthenticated()) {
      await saveSearchHistory(keyword);
    }

    return response.data;
  } catch (error) {
    console.error("搜索博客失败:", error);
    return [];
  }
};
