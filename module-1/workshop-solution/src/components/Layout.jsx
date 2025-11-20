import { Outlet } from "react-router";
import Navigation from "./Navigation";

function Layout() {
  return (
    <div className="layout">
      <Navigation />

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; 2025 SkillShare Academy. Minden jog fenntartva.</p>
      </footer>
    </div>
  );
}

export default Layout;

