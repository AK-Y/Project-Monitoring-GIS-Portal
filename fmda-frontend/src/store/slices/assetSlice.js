import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosConfig";

export const fetchAssets = createAsyncThunk(
  "assets/fetchAssets",
  async () => {
    const res = await axios.get(`/api/assets`);
    return res.data;
  }
);

export const deleteGlobalAsset = createAsyncThunk(
  "assets/delete",
  async (assetId, { dispatch }) => {
    await axios.delete(`/api/projects/assets/${assetId}`);
    dispatch(fetchAssets());
  }
);

export const updateGlobalAsset = createAsyncThunk(
  "assets/update",
  async ({ assetId, data }, { dispatch }) => {
    await axios.put(`/api/projects/assets/${assetId}`, data);
    dispatch(fetchAssets());
  }
);

const assetSlice = createSlice({
  name: "assets",
  initialState: {
    list: [],
    selectedAssetId: null,
  },
  reducers: {
    selectAsset: (state, action) => {
      state.selectedAssetId = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchAssets.fulfilled, (state, action) => {
      state.list = action.payload;
    });
  },
});

export const { selectAsset } = assetSlice.actions;
export default assetSlice.reducer;
