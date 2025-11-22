import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Chart.js komponensek regisztrálása
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function DashboardPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Az authUser valójában a dashboard adatokat tartalmazza a /users/me-ből
    if (authUser) {
      setDashboardData(authUser);
      setLoading(false);
    }
  }, [authUser]);

  if (authLoading || loading) {
    return <div className="page dashboard-page">Betöltés...</div>;
  }
  console.log({ dashboardData });
  if (!dashboardData || !dashboardData.email) {
    return <div className="page dashboard-page">Nincs felhasználó</div>;
  }

  const { name, email, stats, credits, recentActivity } = dashboardData;

  // Kurzus előrehaladás grafikon
  // Megjegyzés: Az API nem ad vissza total_enrolled_chapters-t,
  // ezért egyszerűen a completedChapters-t használjuk
  const completedChapters = stats?.completedChapters || 0;
  const enrolledCourses = stats?.enrolledCourses || 0;

  const progressChartData = {
    labels: ["Elvégzett fejezetek", "Beiratkozott kurzusok"],
    datasets: [
      {
        data: [completedChapters, enrolledCourses],
        backgroundColor: ["rgba(16, 185, 129, 0.8)", "rgba(37, 99, 235, 0.8)"],
        borderColor: ["rgb(16, 185, 129)", "rgb(37, 99, 235)"],
        borderWidth: 2,
      },
    ],
  };

  const progressChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Statisztikák",
      },
    },
  };

  return (
    <div className="page dashboard-page">
      <h1>Dashboard</h1>

      <div className="dashboard-content">
        {/* Üdvözlő szekció */}
        <div className="welcome-section">
          <h2>Üdvözöllek, {name}!</h2>
          <p>
            Email: <strong>{email}</strong>
          </p>
          <p>
            Jelenlegi kreditek: <strong>{credits || 0}</strong>
          </p>
        </div>

        {/* Statisztikák */}
        <div className="stats-section">
          <div className="stat-card">
            <h3>Beiratkozott kurzusok</h3>
            <p className="stat-number">{enrolledCourses}</p>
          </div>
          <div className="stat-card">
            <h3>Elvégzett fejezetek</h3>
            <p className="stat-number">{completedChapters}</p>
          </div>
          <div className="stat-card">
            <h3>Összes szerzett kredit</h3>
            <p className="stat-number">{stats?.totalCreditsEarned || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Közelgő foglalások</h3>
            <p className="stat-number">{stats?.upcomingBookings || 0}</p>
          </div>
        </div>

        {/* Grafikon */}
        <div className="charts-section">
          <div className="chart-container">
            {enrolledCourses > 0 || completedChapters > 0 ? (
              <Doughnut
                data={progressChartData}
                options={progressChartOptions}
              />
            ) : (
              <div className="chart-placeholder">
                <p>Még nincs beiratkozott kurzusod</p>
                <Link to="/courses" className="btn btn-primary">
                  Böngéssz a kurzusok között
                </Link>
              </div>
            )}
          </div>

          {/* Legutóbbi tevékenység */}
          <div className="recent-activity">
            <h3>Legutóbbi tevékenység</h3>
            {recentActivity && recentActivity.length > 0 ? (
              <ul className="activity-list">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <li key={index} className="activity-item">
                    <div>
                      <strong>{activity.description}</strong>
                      {activity.creditsEarned && (
                        <span className="credits-badge success">
                          +{activity.creditsEarned} kredit
                        </span>
                      )}
                      {activity.creditsPaid && (
                        <span className="credits-badge danger">
                          -{activity.creditsPaid} kredit
                        </span>
                      )}
                    </div>
                    <small>
                      {new Date(activity.timestamp).toLocaleString("hu-HU")}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Még nincs tevékenység</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
