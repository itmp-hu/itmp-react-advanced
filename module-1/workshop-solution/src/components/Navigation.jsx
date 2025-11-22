import { NavLink, useNavigate } from "react-router";

function Navigation() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>SkillShare Academy</h2>
      </div>

      <div className="nav-links">
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
