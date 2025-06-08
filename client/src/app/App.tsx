import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/widgets/layout/AppLayout";
import { ScrollToTop } from "@/shared/components/ScrollToTop";
import { Home } from "@/pages/Home";
import { Models } from "@/pages/Models";
import { ModelDetail } from "@/pages/ModelDetail";
import { UploadModel } from "@/pages/UploadModel";
import { UploadDataset } from "@/pages/UploadDataset";
import { Profile } from "@/pages/Profile";
import { Datasets } from "@/pages/Datasets";
import { DatasetDetail } from "@/pages/DatasetDetail";
import { Annotator } from "@/pages/Annotator";

export default function App() {
  return (
    <AppLayout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/models" element={<Models />} />
        <Route path="/models/upload" element={<UploadModel />} />
        <Route path="/models/:id" element={<ModelDetail />} />
        <Route path="/datasets" element={<Datasets />} />
        <Route path="/datasets/upload" element={<UploadDataset />} />
        <Route path="/datasets/:id" element={<DatasetDetail />} />
        <Route path="/annotator" element={<Annotator />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </AppLayout>
  );
}
