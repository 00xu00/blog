import request from "../utils/request";

export const followUser = (userId: number) => {
  return request({
    url: `/api/v1/users/${userId}/follow`,
    method: "post",
  });
};

export const unfollowUser = (userId: number) => {
  return request({
    url: `/api/v1/users/${userId}/follow`,
    method: "delete",
  });
};

export const checkFollowingStatus = (userId: number) => {
  return request({
    url: `/api/v1/users/${userId}/is_following`,
    method: "get",
  });
};
