import { Routes, Route } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import { Layout } from "./widgets/Layout";

// Pages
import { Home } from "./pages/Home";
import { Models } from "./pages/Models";
import { ModelDetail } from "./pages/ModelDetail";
import { UploadModel } from "./pages/UploadModel";
import { UploadDataset } from "./pages/UploadDataset";
import { Profile } from "./pages/Profile";
import { Datasets } from "./pages/Datasets";
import { DatasetDetail } from "./pages/DatasetDetail";
import { Annotator } from "./pages/Annotator";

export default function App() {
  return (
    <Theme appearance="light" accentColor="orange">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/models" element={<Models />} />
          <Route path="/models/:id" element={<ModelDetail />} />
          <Route path="/upload" element={<UploadModel />} />
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/datasets/:id" element={<DatasetDetail />} />
          <Route path="/upload-dataset" element={<UploadDataset />} />
          <Route path="/annotator" element={<Annotator />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Theme>
  );
}
