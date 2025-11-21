import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import MentorsPage from "./pages/MentorsPage";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import authMiddleware from "./middleware/authMiddleware";
import { AuthProvider } from "./contexts/AuthContext";

const router = createBrowserRouter([
  // Nyilvános route-ok (Layout nélkül)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // Védett route-ok (Layout-tal) - MÉG NINCS MIDDLEWARE!
  {
    path: "/",
    element: <Layout />,
    middleware: [authMiddleware],
    children: [
      {
        index: true, // Főoldal átirányítás dashboard-ra
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "courses",
        children: [
          {
            index: true,
            element: <CoursesPage />,
          },
          {
            path: ":id",
            element: <CourseDetailsPage />,
          },
        ],
      },
      {
        path: "mentors",
        element: <MentorsPage />,
      },
    ],
  },

  // 404 - Not Found
  {
    path: "*",
    element: (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>404 - Az oldal nem található</h1>
        <a href="/login">Vissza a főoldalra</a>
      </div>
    ),
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
