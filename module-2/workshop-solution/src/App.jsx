import { Routes, Route, Navigate } from "react-router";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import MentorsPage from "./pages/MentorsPage";

function App() {
  return (
    <Routes>
      {/* Nyilvános route-ok */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Védett route-ok Layout-tal */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="courses">
          <Route index element={<CoursesPage />} />
          <Route path=":id" element={<CourseDetailsPage />} />
        </Route>
        <Route path="mentors" element={<MentorsPage />} />
      </Route>

      {/* 404 - Not Found */}
      <Route
        path="*"
        element={
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <h1>404 - Az oldal nem található</h1>
            <a href="/login">Vissza a főoldalra</a>
          </div>
        }
      />
    </Routes>
  );
}

export default App;

