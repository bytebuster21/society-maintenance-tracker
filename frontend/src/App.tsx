import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { Navbar } from "./components/Navbar.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";

import { Login } from "./pages/Login.js";
import { Register } from "./pages/Register.js";
import { NoticeBoard } from "./pages/NoticeBoard.js";

// Resident Pages
import { ResidentDashboard } from "./pages/resident/ResidentDashboard.js";
import { RaiseComplaint } from "./pages/resident/RaiseComplaint.js";
import { ComplaintDetails } from "./pages/resident/ComplaintDetails.js";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard.js";
import { ComplaintManager } from "./pages/admin/ComplaintManager.js";
import { AdminSettings } from "./pages/admin/AdminSettings.js";

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/admin" : "/dashboard"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Shared Authenticated Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/notices" element={<NoticeBoard />} />
                <Route path="/complaints/:id" element={<ComplaintDetails />} />
              </Route>

              {/* Resident Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["RESIDENT"]} />}>
                <Route path="/dashboard" element={<ResidentDashboard />} />
                <Route path="/raise" element={<RaiseComplaint />} />
              </Route>

              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/complaints" element={<ComplaintManager />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>

              {/* 404 Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
