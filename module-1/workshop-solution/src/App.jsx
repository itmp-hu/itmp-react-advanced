import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import Layout from "./components/Layout";
import authMiddleware from "./middleware/authMiddleware";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import MentorsPage from "./pages/MentorsPage";

// Router konfiguráció objektum-alapú route definíciókkal
const router = createBrowserRouter([
  // Nyilvános route-ok (Layout nélkül)
  // Az átirányítás a komponensekben van kezelve (useEffect)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // Védett route-ok (Layout-tal)
  {
    path: "/",
    element: <Layout />,
    middleware: [authMiddleware], // MINDEN child route védett lesz!
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
  return <RouterProvider router={router} />;
}

export default App;

