import { configureStore } from "@reduxjs/toolkit";
import assetReducer from "./slices/assetSlice";
import projectReducer from "./slices/projectSlice";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import themeReducer from "./slices/themeSlice";

export const store = configureStore({
  reducer: {
    assets: assetReducer,
    projects: projectReducer,
    auth: authReducer,
    users: userReducer,
    theme: themeReducer,
  },
});
