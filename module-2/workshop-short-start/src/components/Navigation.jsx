import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Biztosan ki szeretnél jelentkezni?")) {
      await logout();
      navigate("/login"); // Navigáció a komponensben történik!
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>SkillShare Academy</h2>
      </div>

      <div className="nav-links">
        <span className="user-greeting">
          Szia, {user?.name || "Felhasználó"}!
        </span>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/courses"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Kurzusok
        </NavLink>
        <NavLink
          to="/mentors"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Mentorok
        </NavLink>
        <button onClick={handleLogout} className="btn btn-secondary">
          Kijelentkezés
        </button>
      </div>
    </nav>
  );
}

export default Navigation;