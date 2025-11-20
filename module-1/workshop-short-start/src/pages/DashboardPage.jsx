function DashboardPage() {
  return (
    <div className="page dashboard-page">
      <h1>Dashboard</h1>
      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Üdvözöllek a SkillShare Academy-n!</h2>
          <p>
            Jelenlegi kreditek: <strong>0</strong>
          </p>
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <h3>Beiratkozott kurzusok</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h3>Elvégzett fejezetek</h3>
            <p className="stat-number">0</p>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-placeholder">
            <p>Kredit gyűjtés grafikon (Chart.js) - később implementáljuk</p>
          </div>
          <div className="chart-placeholder">
            <p>
              Kurzus előrehaladás grafikon (Chart.js) - később implementáljuk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

