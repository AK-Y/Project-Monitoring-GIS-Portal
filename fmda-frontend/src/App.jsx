import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./store/slices/authSlice";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import AllProjectsPage from "./pages/AllProjectsPage";
import AllAssetsPage from "./pages/AllAssetsPage";
import AdminPanel from "./pages/AdminPanel";
import MapPage from "./pages/MapPage";
import ProjectDetail from "./pages/ProjectDetail";
import LoginPage from "./pages/LoginPage";

import CreateProjectPage from "./pages/CreateProjectPage";
import EditProjectPage from "./pages/EditProjectPage";
import AddAssetPage from "./pages/AddAssetPage";
import FinanceDashboard from "./pages/FinanceDashboard";
import ProgressDashboard from "./pages/ProgressDashboard";
import ReportsPage from "./pages/ReportsPage";
import ThemeManager from "./components/ThemeManager";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin Only Route Wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTimeout = () => {
      const loginStartTime = localStorage.getItem("loginStartTime");
      if (!loginStartTime) return;

      const TWELVE_HOURS = 12 * 60 * 60 * 1000;
      if (Date.now() - parseInt(loginStartTime) > TWELVE_HOURS) {
        dispatch(logout());
      }
    };

    // Check every minute
    const interval = setInterval(checkTimeout, 60000);

    // Initial check
    checkTimeout();

    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <ThemeManager />
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        {/* Layout with mixed public/protected children */}
        <Route path="/" element={<MainLayout />}>
          {/* Publically Accessible Pages */}
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<AllProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="assets" element={<AllAssetsPage />} />
          <Route path="finance" element={<FinanceDashboard />} />
          <Route path="progress" element={<ProgressDashboard />} />
          <Route path="map" element={<MapPage />} />
          <Route path="reports" element={<ReportsPage />} />

          {/* Action-based Protected Pages */}
          <Route
            path="projects/new"
            element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>}
          />
          <Route
            path="create-asset"
            element={<ProtectedRoute><AddAssetPage /></ProtectedRoute>}
          />
          <Route
            path="projects/:id/edit"
            element={<AdminRoute><EditProjectPage /></AdminRoute>}
          />
          <Route
            path="admin"
            element={<AdminRoute><AdminPanel /></AdminRoute>}
          />
        </Route>
      </Routes>
    </>
  );
};

export default App;
