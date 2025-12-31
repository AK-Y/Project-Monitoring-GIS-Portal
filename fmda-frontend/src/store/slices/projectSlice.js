import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* =======================
   ALL PROJECTS (CARDS)
======================= */
export const fetchAllProjects = createAsyncThunk(
  "projects/fetchAll",
  async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/projects`,
      { params: { t: Date.now() } }
    );
    return res.data;
  }
);

export const fetchDashboardStats = createAsyncThunk(
  "projects/fetchStats",
  async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/dashboard/stats`);
    return res.data;
  }
);

/* =======================
   FILTERED PROJECTS (TABLE)
======================= */
export const fetchFilteredProjects = createAsyncThunk(
  "projects/fetchFiltered",
  async (filters = {}) => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/projects`,
      { params: { ...filters, t: Date.now() } }
    );
    return res.data;
  }
);

/* =======================
   MAP – PROJECTS BY ASSET
======================= */
export const fetchProjectsByAsset = createAsyncThunk(
  "projects/fetchByAsset",
  async (assetId) => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/projects/asset/${assetId}`,
      { params: { t: Date.now() } }
    );
    return res.data;
  }
);

export const fetchProjectDetail = createAsyncThunk(
  "projects/fetchDetail",
  async (projectId) => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/projects/${projectId}`,
      { params: { t: Date.now() } }
    );
    return res.data;
  }
);


export const addProgressLog = createAsyncThunk(
  "projects/addLog",
  async ({ id, data }, { dispatch }) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/${id}/progress`, data);
    // Refresh the project detail to show new data
    dispatch(fetchProjectDetail(id));
    return;
  }
);

export const createNewProject = createAsyncThunk(
  "projects/create",
  async (projectData) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/projects`, projectData);
    return res.data;
  }
);

export const addAssetToProject = createAsyncThunk(
  "projects/addAsset",
  async ({ id, data }, { dispatch }) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/${id}/assets`, data);
    dispatch(fetchProjectDetail(id));
    return;
  }
);

export const updateProjectAsset = createAsyncThunk(
  "projects/updateAsset",
  async ({ projectId, assetId, data }, { dispatch }) => {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/projects/assets/${assetId}`, data);
    dispatch(fetchProjectDetail(projectId));
    return;
  }
);

export const deleteProjectAsset = createAsyncThunk(
  "projects/deleteAsset",
  async ({ projectId, assetId }, { dispatch }) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/projects/assets/${assetId}`);
    dispatch(fetchProjectDetail(projectId));
    return;
  }
);

export const updatePayment = createAsyncThunk(
  "projects/updatePayment",
  async ({ projectId, paymentId, data }, { dispatch }) => {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/projects/payments/${paymentId}`, data);
    dispatch(fetchProjectDetail(projectId));
    return;
  }
);

export const deletePayment = createAsyncThunk(
  "projects/deletePayment",
  async ({ projectId, paymentId }, { dispatch }) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/projects/payments/${paymentId}`);
    dispatch(fetchProjectDetail(projectId));
    return;
  }
);

export const updateProgressLog = createAsyncThunk(
  "projects/updateProgress",
  async ({ projectId, progressId, data }, { dispatch }) => {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/projects/progress/${progressId}`, data);
    dispatch(fetchProjectDetail(projectId));
    return;
  }
);

export const deleteProgressLog = createAsyncThunk(
  "projects/deleteProgress",
  async ({ projectId, progressId }, { dispatch }) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/projects/progress/${progressId}`);
    dispatch(fetchProjectDetail(projectId));
    return;
  }
);

export const addPaymentToProject = createAsyncThunk(
  "projects/addPayment",
  async ({ id, data }, { dispatch }) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/${id}/payments`, data);
    dispatch(fetchProjectDetail(id));
    return;
  }
);

export const updateProject = createAsyncThunk(
  "projects/update",
  async ({ id, data }, { dispatch }) => {
    const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, data);
    dispatch(fetchProjectDetail(id));
    return res.data;
  }
);

export const deleteProject = createAsyncThunk(
  "projects/delete",
  async (id) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/projects/${id}`);
    return id;
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    all: [],        // used by Dashboard cards?
    filtered: [],   // used by Dashboard table
    byAsset: [],    // used by Map
    current: null,  // used by ProjectDetail
    stats: {
      'Infra-I': { total: 0, completed: 0, ongoing: 0, cost: 0 },
      'Infra-II': { total: 0, completed: 0, ongoing: 0, cost: 0 },
      'Mobility': { total: 0, completed: 0, ongoing: 0, cost: 0 }
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.all = action.payload;
      })
      .addCase(fetchFilteredProjects.fulfilled, (state, action) => {
        state.filtered = action.payload;
      })
      .addCase(fetchProjectsByAsset.fulfilled, (state, action) => {
        state.byAsset = action.payload || []; 
      })
      .addCase(fetchProjectDetail.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export default projectSlice.reducer;
