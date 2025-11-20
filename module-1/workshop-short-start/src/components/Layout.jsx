function Layout({ children }) {
  return (
    <div className="layout">
      <header>Navigation</header>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <p>&copy; 2025 SkillShare Academy. Minden jog fenntartva.</p>
      </footer>
    </div>
  );
}

export default Layout;
