import { configureStore } from "@reduxjs/toolkit";
import messageReducer from "./messageSlice";
import { profileReducer } from "./profile/reducer";

export const store = configureStore({
  reducer: {
    message: messageReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
