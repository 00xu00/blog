export const SET_PROFILE = "SET_PROFILE";
export const SET_ARTICLES = "SET_ARTICLES";
export const SET_FOLLOWING = "SET_FOLLOWING";
export const SET_FOLLOWERS = "SET_FOLLOWERS";
export const SET_ACTIVE_TAB = "SET_ACTIVE_TAB";

export interface ProfileState {
  userInfo: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    stats: {
      articles: number;
      followers: number;
      following: number;
    };
  };
  articles: Array<{
    id: string;
    title: string;
    description: string;
    createTime: string;
    views: number;
    likes: number;
    comments: number;
  }>;
  following: Array<{
    id: string;
    name: string;
    avatar: string;
    bio: string;
  }>;
  followers: Array<{
    id: string;
    name: string;
    avatar: string;
    bio: string;
  }>;
  activeTab: string;
}
