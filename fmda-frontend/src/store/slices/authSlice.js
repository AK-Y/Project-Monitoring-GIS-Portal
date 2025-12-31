import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        username,
        password,
      });
      // Save token to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("loginStartTime", Date.now().toString());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// Check if user is already logged in (from localStorage)
const checkSessionStatus = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const loginStartTime = localStorage.getItem("loginStartTime");

  if (!token || !loginStartTime) return { token: null, user: null, isAuthenticated: false };

  // 12 hours in milliseconds
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  const currentTime = Date.now();

  if (currentTime - parseInt(loginStartTime) > TWELVE_HOURS) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginStartTime");
    return { token: null, user: null, isAuthenticated: false };
  }

  return { token, user, isAuthenticated: true };
};

const sessionStatus = checkSessionStatus();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: sessionStatus.user,
    token: sessionStatus.token,
    loading: false,
    error: null,
    isAuthenticated: sessionStatus.isAuthenticated,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("loginStartTime");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
