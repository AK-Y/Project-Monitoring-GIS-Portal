import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosConfig";

const API_URL = `/api/users`;

export const fetchAllUsers = createAsyncThunk("users/fetchAll", async () => {
  const res = await axios.get(API_URL);
  return res.data;
});

export const createAccount = createAsyncThunk("users/create", async (userData) => {
  const res = await axios.post(API_URL, userData);
  return res.data;
});

export const updateRole = createAsyncThunk("users/updateRole", async ({ id, role }) => {
  const res = await axios.put(`${API_URL}/${id}/role`, { role });
  return res.data;
});

export const deleteAccount = createAsyncThunk("users/delete", async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.list = state.list.filter(u => u.id !== action.payload);
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        const index = state.list.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      });
  }
});

export default userSlice.reducer;
