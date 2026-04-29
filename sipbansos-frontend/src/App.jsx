import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DataWargaPage from "./pages/DataWarga/DataWargaPage";
import ImportEksporPage from "./pages/ImportEkspor/ImportEksporPage";
import KriteriaPage from "./pages/Kriteria/KriteriaPage";
import SimulasiPage from "./pages/SimulasiSAW/SimulasiPage";
import LaporanPage from "./pages/Laporan/LaporanPage";
import PenggunaPage from "./pages/Pengguna/PenggunaPage";
import PengaturanPage from "./pages/Pengaturan/PengaturanPage";
import LoginPage from "./pages/Login/LoginPage";
import ForbiddenPage from "./pages/Forbidden/ForbiddenPage";

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/forbidden"
          element={
            <ProtectedRoute>
              <ForbiddenPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warga"
          element={
            <ProtectedRoute>
              <DataWargaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/import-export"
          element={
            <ProtectedRoute allowedRoles={["admin", "petugas"]}>
              <ImportEksporPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kriteria"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KriteriaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulasi"
          element={
            <ProtectedRoute allowedRoles={["admin", "kepala_desa"]}>
              <SimulasiPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan"
          element={
            <ProtectedRoute allowedRoles={["admin", "kepala_desa"]}>
              <LaporanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pengguna"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PenggunaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PengaturanPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
