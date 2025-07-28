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
import { Annotator } from "@/pages/Annotator";
import { AnnotationWorkspace } from "@/pages/AnnotationWorkspace";

export default function App() {
  return (
    <AppLayout>
      <ScrollToTop />
      <Routes>
        {/* Public routes - no wallet required */}


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
          path="/annotator"
          element={
            <ProtectedRoute>
              <Annotator />
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
      </Routes>
    </AppLayout>
  );
}
