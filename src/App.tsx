import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OAuthCallbackPage } from "./pages/OAuthCallbackPage";
import { SearchPage } from "./pages/SearchPage";
import { CollectionPage } from "./pages/CollectionPage";
import { CollectionEntryPage } from "./pages/CollectionEntryPage";
import { SeriesPage } from "./pages/SeriesPage";
import { StatsPage } from "./pages/StatsPage";
import { AdminPage } from "./pages/AdminPage";
import { ListsPage } from "./pages/ListsPage";
import { ListDetailPage } from "./pages/ListDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PublicListsPage } from "./pages/PublicListsPage";
import { PublicListDetailPage } from "./pages/PublicListDetailPage";
import { LegacyImportPage } from "./pages/LegacyImportPage";
import { ProtectedRoute } from "./auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/u/:username/lists" element={<PublicListsPage />} />
      <Route path="/u/:username/lists/:id" element={<PublicListDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collection"
        element={
          <ProtectedRoute>
            <CollectionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collection/:id"
        element={
          <ProtectedRoute>
            <CollectionEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/series/:igdbId"
        element={
          <ProtectedRoute>
            <SeriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <StatsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lists"
        element={
          <ProtectedRoute>
            <ListsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lists/:id"
        element={
          <ProtectedRoute>
            <ListDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/import/legacy"
        element={
          <ProtectedRoute>
            <LegacyImportPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
