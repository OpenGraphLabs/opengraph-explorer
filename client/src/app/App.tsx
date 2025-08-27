import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/shared/components/AppLayout";
import { ScrollToTop } from "@/shared/components/ScrollToTop";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { Home } from "@/pages/Home";
import { Profile } from "@/pages/Profile";
import { Datasets } from "@/pages/Datasets";
import { DatasetDetail } from "@/pages/DatasetDetail";
import { AnnotationWorkspace } from "@/pages/AnnotationWorkspace";
import { TrajectoryDrawingWorkspace } from "@/pages/TrajectoryDrawingWorkspace";
import { AuthCallback } from "@/components/auth";
import { AuthSuccess } from "@/pages/AuthSuccess";
import { AuthError } from "@/pages/AuthError";
import { Login } from "@/pages/Login";
import { Earn } from "@/pages/Earn";
import { TaskSelection } from "@/pages/TaskSelection.tsx";
import { FirstPersonCapture } from "@/pages/FirstPersonCapture";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { Leaderboard } from "@/pages/Leaderboard";

export default function App() {
  return (
    <AppLayout>
      <ScrollToTop />
      <Routes>
        {/* Public routes - no wallet required */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/auth/error" element={<AuthError />} />
        <Route path="/login" element={<Login />} />

        {/* Admin dashboard - completely independent from main app */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Protected routes - wallet required */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/datasets"
          element={
            <ProtectedRoute>
              <Datasets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/datasets/:id"
          element={
            <ProtectedRoute>
              <DatasetDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/datasets/:id/annotate"
          element={
            <ProtectedRoute>
              <AnnotationWorkspace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/datasets/:id/trajectory"
          element={
            <ProtectedRoute>
              <TrajectoryDrawingWorkspace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/earn"
          element={
            <ProtectedRoute>
              <Earn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/datasets/:id/first-person-capture"
          element={
            <ProtectedRoute>
              <FirstPersonCapture />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppLayout>
  );
}
