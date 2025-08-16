import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/widgets/layout/AppLayout";
import { ScrollToTop } from "@/shared/components/ScrollToTop";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { Home } from "@/pages/Home";
import { Models } from "@/pages/Models";
import { ModelDetail } from "@/pages/ModelDetail";
import { UploadModel } from "@/pages/UploadModel";
import { UploadDataset } from "@/pages/UploadDataset";
import { Profile } from "@/pages/Profile";
import { Datasets } from "@/pages/Datasets";
import { DatasetDetail } from "@/pages/DatasetDetail";
import { AnnotationWorkspace } from "@/pages/AnnotationWorkspace";
import { TrajectoryDrawingWorkspace } from "@/pages/TrajectoryDrawingWorkspace";
import { AuthCallback } from "@/components/auth";
import { AuthSuccess } from "@/pages/AuthSuccess";
import { AuthError } from "@/pages/AuthError";
import { Login } from "@/pages/Login.tsx";
import { Earn } from "@/pages/Earn";
import { SpaceSelection } from "@/pages/SpaceSelection";
import { FirstPersonCapture } from "@/pages/FirstPersonCapture";

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
          path="/models"
          element={
            <ProtectedRoute>
              <Models />
            </ProtectedRoute>
          }
        />
        <Route
          path="/models/upload"
          element={
            <ProtectedRoute>
              <UploadModel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/models/:id"
          element={
            <ProtectedRoute>
              <ModelDetail />
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
          path="/datasets/upload"
          element={
            <ProtectedRoute>
              <UploadDataset />
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
          path="/datasets/:id/space-selection"
          element={
            <ProtectedRoute>
              <SpaceSelection />
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
