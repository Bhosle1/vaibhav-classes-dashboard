import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateTestPage from "./pages/CreateTestPage";
import AddQuestionsPage from "./pages/AddQuestionsPage";
import PreviewPage from "./pages/PreviewPage";
import TakeExamPage from "./pages/TakeExamPage";

export default function App() {
  return (
    <BrowserRouter>
      {/* Universal header (hides automatically if not authenticated) */}
      <Navbar />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tests/create"
            element={
              <ProtectedRoute>
                <CreateTestPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tests/:testId/edit"
            element={
              <ProtectedRoute>
                <CreateTestPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tests/:testId/questions"
            element={
              <ProtectedRoute>
                <AddQuestionsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tests/:testId/preview"
            element={
              <ProtectedRoute>
                <PreviewPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tests/:testId/demo"
            element={
              <ProtectedRoute>
                <TakeExamPage />
              </ProtectedRoute>
            }
          />

          {/* Wildcard redirects to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
