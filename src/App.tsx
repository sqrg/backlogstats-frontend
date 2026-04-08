import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OAuthCallbackPage } from "./pages/OAuthCallbackPage";
import { SearchPage } from "./pages/SearchPage";
import { CollectionPage } from "./pages/CollectionPage";
import { CollectionEntryPage } from "./pages/CollectionEntryPage";
import { SeriesPage } from "./pages/SeriesPage";
import { ProtectedRoute } from "./auth/ProtectedRoute";

function App() {
  return (
    <Routes>
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
    </Routes>
  );
}

export default App;
