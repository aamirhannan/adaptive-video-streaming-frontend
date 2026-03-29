import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";
import { RoleRoute } from "./components/RoleRoute.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { LibraryPage } from "./pages/LibraryPage.js";
import { UploadPage } from "./pages/UploadPage.js";
import { VideoDetailPage } from "./pages/VideoDetailPage.js";
import { AdminUsersPage } from "./pages/AdminUsersPage.js";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<LibraryPage />} />
          <Route path="videos/:videoId" element={<VideoDetailPage />} />
          <Route element={<RoleRoute allow={["editor", "admin"]} />}>
            <Route path="upload" element={<UploadPage />} />
          </Route>
          <Route element={<RoleRoute allow={["admin"]} />}>
            <Route path="admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
