import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

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
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="page dashboard-page">Betöltés...</div>;
  }

  if (!user) {
    return <div className="page dashboard-page">Nincs felhasználó</div>;
  }

  // Kredit történet grafikon adatok
  const creditChartData = {
    labels: user.credit_history?.map(item => item.date) || [],
    datasets: [
      {
        label: "Összegyűjtött kreditek",
        data: user.credit_history?.map(item => item.credits) || [],
        borderColor: "rgb(37, 99, 235)",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4
      }
    ]
  };

  const creditChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: "Kredit gyűjtés az elmúlt 30 napban"
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Kreditek"
        }
      }
    }
  };

  // Kurzus előrehaladás grafikon
  const completedChapters = user.completed_chapters_count || 0;
  const totalChapters = user.total_enrolled_chapters || 1; // Megelőzzük a 0-val osztást
  const remainingChapters = totalChapters - completedChapters;

  const progressChartData = {
    labels: ["Befejezett", "Hátralevő"],
    datasets: [
      {
        data: [completedChapters, remainingChapters],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(226, 232, 240, 0.8)"
        ],
        borderColor: ["rgb(16, 185, 129)", "rgb(226, 232, 240)"],
        borderWidth: 2
      }
    ]
  };

  const progressChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom"
      },
      title: {
        display: true,
        text: "Kurzus előrehaladás"
      }
    }
  };

  return (
    <div className="page dashboard-page">
      <h1>Dashboard</h1>

      <div className="dashboard-content">
        {/* Üdvözlő szekció */}
        <div className="welcome-section">
          <h2>Üdvözöllek, {user.name}!</h2>
          <p>
            Jelenlegi kreditek: <strong>{user.credits}</strong>
          </p>
        </div>

        {/* Statisztikák */}
        <div className="stats-section">
          <div className="stat-card">
            <h3>Beiratkozott kurzusok</h3>
            <p className="stat-number">{user.enrolled_courses_count || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Elvégzett fejezetek</h3>
            <p className="stat-number">{completedChapters}</p>
          </div>
        </div>

        {/* Grafikonok */}
        <div className="charts-section">
          <div className="chart-container">
            {user.credit_history && user.credit_history.length > 0 ? (
              <Line data={creditChartData} options={creditChartOptions} />
            ) : (
              <div className="chart-placeholder">
                <p>Még nincs kredit történet</p>
              </div>
            )}
          </div>

          <div className="chart-container">
            {totalChapters > 0 ? (
              <Doughnut data={progressChartData} options={progressChartOptions} />
            ) : (
              <div className="chart-placeholder">
                <p>Még nincs beiratkozott kurzusod</p>
                <Link to="/courses" className="btn btn-primary">
                  Böngéssz a kurzusok között
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
