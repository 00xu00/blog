import request from "./request";

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
  try {
    const response = await request.get("/api/v1/search/history");
    return response.data;
  } catch (error) {
    console.error("获取搜索历史失败:", error);
    return [];
  }
};

// 搜索博客
export const searchBlogs = async (keyword: string): Promise<SearchResult[]> => {
  try {
    const response = await request.get(
      `/api/v1/search/blogs?keyword=${encodeURIComponent(keyword)}`
    );
    return response.data;
  } catch (error) {
    console.error("搜索博客失败:", error);
    return [];
  }
};
