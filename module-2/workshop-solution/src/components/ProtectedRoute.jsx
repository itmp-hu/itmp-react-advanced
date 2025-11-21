import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Loading állapot kezelése
  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Betöltés...</p>
      </div>
    );
  }

  // Ha nincs bejelentkezve, irányítsuk a login oldalra
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Ha be van jelentkezve, jelenítsd meg az oldalt
  return children;
}

export default ProtectedRoute;

