import {
  SET_PROFILE,
  SET_ARTICLES,
  SET_FOLLOWING,
  SET_FOLLOWERS,
  SET_ACTIVE_TAB,
  ProfileState,
} from "./types";

export const setProfile = (userInfo: ProfileState["userInfo"]) => ({
  type: SET_PROFILE,
  payload: userInfo,
});

export const setArticles = (articles: ProfileState["articles"]) => ({
  type: SET_ARTICLES,
  payload: articles,
});

export const setFollowing = (following: ProfileState["following"]) => ({
  type: SET_FOLLOWING,
  payload: following,
});

export const setFollowers = (followers: ProfileState["followers"]) => ({
  type: SET_FOLLOWERS,
  payload: followers,
});

export const setActiveTab = (tab: string) => ({
  type: SET_ACTIVE_TAB,
  payload: tab,
});
