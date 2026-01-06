import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosConfig";

// Thunks
export const fetchFiles = createAsyncThunk("files/fetchAll", async () => {
  const res = await axios.get(`/api/files`);
  return res.data;
});

export const fetchFileDetail = createAsyncThunk("files/fetchDetail", async (id) => {
  const res = await axios.get(`/api/files/${id}`);
  return res.data;
});

export const createNewFile = createAsyncThunk("files/create", async (data) => {
  const res = await axios.post(`/api/files`, data);
  return res.data;
});

export const forwardFile = createAsyncThunk("files/forward", async ({ id, data }, { dispatch }) => {
  const res = await axios.post(`/api/files/${id}/forward`, data);
  dispatch(fetchFileDetail(id));
  return res.data;
});

export const approveFile = createAsyncThunk("files/approve", async ({ id, data }, { dispatch }) => {
  const res = await axios.post(`/api/files/${id}/approve`, data);
  dispatch(fetchFileDetail(id));
  return res.data;
});

export const returnFile = createAsyncThunk("files/return", async ({ id, data }, { dispatch }) => {
  const res = await axios.post(`/api/files/${id}/return`, data);
  dispatch(fetchFileDetail(id));
  return res.data;
});

export const updateEstimate = createAsyncThunk("files/updateEstimate", async ({ id, items }, { dispatch }) => {
  const res = await axios.put(`/api/files/${id}/estimate`, { items });
  dispatch(fetchFileDetail(id));
  return res.data;
});

export const updateProposedAssets = createAsyncThunk("files/updateAssets", async ({ id, assets }, { dispatch }) => {
  const res = await axios.put(`/api/files/${id}/assets`, { assets });
  dispatch(fetchFileDetail(id));
  return res.data;
});

export const updateFileMetadata = createAsyncThunk("files/updateMetadata", async ({ id, data }, { dispatch }) => {
  const res = await axios.put(`/api/files/${id}`, data);
  dispatch(fetchFileDetail(id));
  return res.data;
});

export const deleteFile = createAsyncThunk("files/delete", async (id) => {
  await axios.delete(`/api/files/${id}`);
  return id;
});

const fileSlice = createSlice({
  name: "files",
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentFile: (state) => {
      state.current = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => { state.loading = true; })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchFileDetail.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.list = state.list.filter(f => f.id !== action.payload);
        state.current = null;
      });
  },
});

export const { clearCurrentFile } = fileSlice.actions;
export default fileSlice.reducer;
