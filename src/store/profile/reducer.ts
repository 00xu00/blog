import {
  SET_PROFILE,
  SET_ARTICLES,
  SET_FOLLOWING,
  SET_FOLLOWERS,
  SET_ACTIVE_TAB,
  ProfileState,
} from "./types";

const initialState: ProfileState = {
  userInfo: {
    id: "",
    name: "",
    avatar: "",
    bio: "",
    stats: {
      articles: 0,
      followers: 0,
      following: 0,
    },
  },
  articles: [],
  following: [],
  followers: [],
  activeTab: "messages",
};

export const profileReducer = (
  state = initialState,
  action: any
): ProfileState => {
  switch (action.type) {
    case SET_PROFILE:
      return {
        ...state,
        userInfo: action.payload,
      };
    case SET_ARTICLES:
      return {
        ...state,
        articles: action.payload,
      };
    case SET_FOLLOWING:
      return {
        ...state,
        following: action.payload,
      };
    case SET_FOLLOWERS:
      return {
        ...state,
        followers: action.payload,
      };
    case SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload,
      };
    default:
      return state;
  }
};
