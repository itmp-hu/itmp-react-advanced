# 3. modul workshop - REST API integráció és befejező lépések

- API service layer létrehozása
- Valódi hitelesítés implementálása
- Dashboard megvalósítása Chart.js-szel
- Kurzuskatalógus API integrációval
- Kurzus részletek oldal fejezet kezelésssel
- Mentor foglalás polling-gal
- LinkedIn share widget integráció
- Hibakezelés és loading állapotok

> [!NOTE]  
> **Feladat:**  
> A 3. modulban befejezzük a SkillShare Academy alkalmazást: integráld a backend API-t, implementálj valódi hitelesítést, adj hozzá Chart.js vizualizációkat a dashboardhoz, valósítsd meg a kurzus- és mentorkezelést, és integráld a LinkedIn share widget-et. A modul végére egy teljes, működő alkalmazással fogsz rendelkezni!

<hr />

## Előkészületek

### Backend indítása

1. Győződj meg róla, hogy a backend fut:

```bash
cd assets/backend-solution
docker compose up -d
```

2. Ellenőrizd a health endpoint-ot:

```bash
curl http://localhost:5000/api/v1/health
```

3. Tesztfelhasználók (jelszó mindenhol: `password123`):
   - `alice.smith@example.com`
   - `bob.jones@example.com`
   - `charlie.brown@example.com`

### Chart.js telepítése

Telepítsd a szükséges package-eket:

```bash
npm install chart.js react-chartjs-2
```

## 1. lépés - API Service Layer létrehozása

Most létrehozzuk az API service réteget, amely központosítja az összes backend kommunikációt.

### API service létrehozása

Hozz létre egy `src/services/api.js` fájlt:

```javascript
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Helper függvény a hitelesítéshez szükséges headerek összeállításához
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'X-API': token,
    'Content-Type': 'application/json'
  };
}

// Hitelesítési szolgáltatások
export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    return response;
  },

  async register(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });
    return response;
  }
};

// Felhasználói szolgáltatások
export const userService = {
  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders()
    });
    return response;
  }
};

// Kurzus szolgáltatások
export const courseService = {
  async getAllCourses() {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  async getCourseById(id) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  async enrollInCourse(id) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return response;
  }
};

// Fejezet szolgáltatások
export const chapterService = {
  async completeChapter(id) {
    const response = await fetch(`${API_BASE_URL}/chapters/${id}/complete`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return response;
  }
};

// Mentor szolgáltatások
export const mentorService = {
  async getAvailableSessions() {
    const response = await fetch(`${API_BASE_URL}/mentor-sessions`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  async bookSession(id) {
    const response = await fetch(`${API_BASE_URL}/mentor-sessions/${id}/book`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return response;
  },

  async getBookedSessions() {
    const response = await fetch(`${API_BASE_URL}/mentor-sessions/booked`, {
      headers: getAuthHeaders()
    });
    return response;
  }
};
```

> [!TIP]
> Az API service layer elkülöníti a backend kommunikációt a komponensektől, így könnyen karbantartható és újrafelhasználható a kód.

## 2. lépés - AuthContext frissítése valódi API-val

Most frissítjük az AuthContext-et, hogy a valódi backend API-t használja.

### AuthContext frissítése

Módosítsd az `src/contexts/AuthContext.jsx` fájlt:

```jsx
import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService, userService } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Token ellenőrzése és felhasználó betöltése oldal betöltéskor
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      
      if (token) {
        try {
          const response = await userService.getCurrentUser();
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token érvénytelen, töröljük
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Error loading user:", error);
          localStorage.removeItem("token");
        }
      }
      
      setLoading(false);
    }

    loadUser();
  }, []);

  // Bejelentkezés
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      if (response.status === 200) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        setUser(data.user);
        navigate("/dashboard");
        return { success: true };
      }

      if (response.status === 401) {
        return { success: false, error: "Hibás email vagy jelszó" };
      }

      if (response.status === 422) {
        const data = await response.json();
        return { success: false, error: data.message || "Validációs hiba" };
      }

      return { success: false, error: "Hiba történt a bejelentkezés során" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Hálózati hiba történt" };
    }
  };

  // Regisztráció
  const register = async (name, email, password) => {
    try {
      const response = await authService.register(name, email, password);

      if (response.status === 201) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        setUser(data.user);
        navigate("/dashboard");
        return { success: true };
      }

      if (response.status === 400) {
        return { success: false, error: "A felhasználó már létezik" };
      }

      if (response.status === 422) {
        const data = await response.json();
        return { success: false, error: data.message || "Validációs hiba" };
      }

      return { success: false, error: "Hiba történt a regisztráció során" };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Hálózati hiba történt" };
    }
  };

  // Kijelentkezés
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  // Felhasználó adatainak frissítése (pl. kredit változás után)
  const refreshUser = async () => {
    try {
      const response = await userService.getCurrentUser();
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### useAuth hook használata

Az `src/hooks/useAuth.js` fájl változatlan marad:

```jsx
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
```

## 3. lépés - LoginPage frissítése

Most frissítjük a LoginPage-et, hogy a valódi API-t és AuthContext-et használja.

Módosítsd az `src/pages/LoginPage.jsx` fájlt:

```jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Ha már be van jelentkezve, irányítsuk át
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Egyszerű validáció
    if (!email || !password) {
      setError("Minden mező kitöltése kötelező");
      setLoading(false);
      return;
    }

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="page login-page">
      <div className="login-container">
        <h1>Bejelentkezés</h1>
        <p>SkillShare Academy tanulási platform</p>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@példa.hu"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Jelszó"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Bejelentkezés..." : "Bejelentkezés"}
          </button>
        </form>

        <p className="register-link">
          Még nincs fiókod? <Link to="/register">Regisztrálj ingyen!</Link>
        </p>

        <div className="test-accounts">
          <p><small>Teszt fiókok (jelszó: password123):</small></p>
          <p><small>alice.smith@example.com</small></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
```

## 4. lépés - RegisterPage frissítése

Módosítsd az `src/pages/RegisterPage.jsx` fájlt:

```jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validáció
    if (!name || !email || !password || !confirmPassword) {
      setError("Minden mező kitöltése kötelező");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("A jelszavak nem egyeznek");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie");
      setLoading(false);
      return;
    }

    const result = await register(name, email, password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="page register-page">
      <div className="register-container">
        <h1>Regisztráció</h1>
        <p>Ingyenes regisztráció</p>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Teljes név</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kovács János"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@példa.hu"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Legalább 6 karakter"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Jelszó megerősítése</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Jelszó újra"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Regisztráció..." : "Regisztráció"}
          </button>
        </form>

        <p className="login-link">
          Már van fiókod? <Link to="/login">Jelentkezz be!</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
```

## 5. lépés - Dashboard Chart.js-szel

Most implementáljuk a Dashboard oldalt Chart.js vizualizációkkal.

### Dashboard komponens

Módosítsd az `src/pages/DashboardPage.jsx` fájlt:

```jsx
import { useState, useEffect } from "react";
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
```

### Dashboard CSS frissítés

Add hozzá az `src/index.css` fájlhoz:

```css
/* Dashboard Charts */
.chart-container {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container canvas {
  max-height: 300px;
}

/* Error message */
.error-message {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

/* Test accounts info */
.test-accounts {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--secondary-color);
}
```

## 6. lépés - Kurzuskatalógus implementálása

Most implementáljuk a kurzusok oldalt keresési és szűrési funkciókkal.

Módosítsd az `src/pages/CoursesPage.jsx` fájlt:

```jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseService } from "../services/api";
import { useAuth } from "../hooks/useAuth";

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [enrolling, setEnrolling] = useState(null); // ID of course being enrolled

  const { refreshUser } = useAuth();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await courseService.getAllCourses();

      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else if (response.status === 401) {
        setError("Kérlek jelentkezz be újra");
      } else {
        setError("Nem sikerült betölteni a kurzusokat");
      }
    } catch (err) {
      setError("Hálózati hiba történt");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(courseId);

      const response = await courseService.enrollInCourse(courseId);

      if (response.status === 200) {
        alert("Sikeres beiratkozás!");
        // Frissítsük a kurzusok listáját és a felhasználó adatait
        await loadCourses();
        await refreshUser();
      } else if (response.status === 403) {
        alert("Már beiratkoztál erre a kurzusra");
      } else if (response.status === 422) {
        const data = await response.json();
        alert(data.message || "Nem elég kredit a beiratkozáshoz");
      } else {
        alert("Hiba történt a beiratkozás során");
      }
    } catch (error) {
      alert("Hálózati hiba történt");
    } finally {
      setEnrolling(null);
    }
  };

  // Szűrés és keresés
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = 
      !difficultyFilter || course.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="page courses-page">
        <h1>Kurzuskatalógus</h1>
        <p>Betöltés...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page courses-page">
        <h1>Kurzuskatalógus</h1>
        <div className="error-message">
          ⚠️ {error}
          <button onClick={loadCourses} className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Újrapróbálás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page courses-page">
      <h1>Kurzuskatalógus</h1>

      {/* Keresés és szűrés */}
      <div className="courses-filters">
        <input
          type="text"
          placeholder="Keresés kurzusok között..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="">Minden nehézségi szint</option>
          <option value="beginner">Kezdő</option>
          <option value="intermediate">Haladó</option>
          <option value="advanced">Szakértő</option>
        </select>
      </div>

      {/* Kurzusok listája */}
      {filteredCourses.length === 0 ? (
        <p>Nincs találat</p>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <span>Nehézség: {getDifficultyLabel(course.difficulty)}</span>
                <span>Fejezetek: {course.chapters_count}</span>
                <span>Kreditek: {course.total_credits}</span>
              </div>

              {course.enrolled ? (
                <Link to={`/courses/${course.id}`} className="btn btn-primary">
                  Tanulás folytatása
                </Link>
              ) : (
                <button
                  onClick={() => handleEnroll(course.id)}
                  className="btn btn-primary"
                  disabled={enrolling === course.id}
                >
                  {enrolling === course.id ? "Beiratkozás..." : "Beiratkozás"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getDifficultyLabel(difficulty) {
  const labels = {
    beginner: "Kezdő",
    intermediate: "Haladó",
    advanced: "Szakértő"
  };
  return labels[difficulty] || difficulty;
}

export default CoursesPage;
```

## 7. lépés - Kurzus részletek oldal

Most implementáljuk a kurzus részletek oldalt fejezet befejezés funkcióval.

Módosítsd az `src/pages/CourseDetailsPage.jsx` fájlt:

```jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { courseService, chapterService } from "../services/api";
import { useAuth } from "../hooks/useAuth";

function CourseDetailsPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(null); // ID of chapter being completed

  const { refreshUser } = useAuth();

  useEffect(() => {
    loadCourseDetails();
  }, [id]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await courseService.getCourseById(id);

      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else if (response.status === 404) {
        setError("A kurzus nem található");
      } else if (response.status === 401) {
        setError("Kérlek jelentkezz be újra");
      } else {
        setError("Nem sikerült betölteni a kurzus adatait");
      }
    } catch (err) {
      setError("Hálózati hiba történt");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChapter = async (chapterId) => {
    try {
      setCompleting(chapterId);

      const response = await chapterService.completeChapter(chapterId);

      if (response.status === 200) {
        const data = await response.json();
        alert(`Gratulálunk! +${data.credits_earned} kredit!`);
        
        // Frissítsük a kurzus adatokat és a felhasználó adatait
        await loadCourseDetails();
        await refreshUser();

        // LinkedIn share widget inicializálása
        initLinkedInShare(chapterId);
      } else if (response.status === 403) {
        alert("Ez a fejezet már be van fejezve");
      } else if (response.status === 404) {
        alert("A fejezet nem található");
      } else {
        alert("Hiba történt a fejezet befejezése során");
      }
    } catch (error) {
      alert("Hálózati hiba történt");
    } finally {
      setCompleting(null);
    }
  };

  const initLinkedInShare = (chapterId) => {
    // LinkedIn share widget inicializálása
    // Ez a widget a public/third-party mappából lesz betöltve
    if (window.LinkedInShare) {
      const chapter = course.chapters.find(ch => ch.id === chapterId);
      window.LinkedInShare.init({
        elementId: `linkedin-share-${chapterId}`,
        text: `Befejeztem a "${chapter.title}" fejezetet a SkillShare Academy-n!`,
        url: window.location.href
      });
    }
  };

  if (loading) {
    return (
      <div className="page course-details-page">
        <p>Betöltés...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page course-details-page">
        <div className="error-message">
          ⚠️ {error}
        </div>
        <Link to="/courses" className="btn btn-primary">
          Vissza a kurzusokhoz
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page course-details-page">
        <p>Nincs adat</p>
      </div>
    );
  }

  const completedCount = course.chapters?.filter(ch => ch.completed).length || 0;
  const totalCount = course.chapters?.length || 0;
  const completedCredits = course.chapters
    ?.filter(ch => ch.completed)
    .reduce((sum, ch) => sum + ch.credits, 0) || 0;

  return (
    <div className="page course-details-page">
      {/* Kurzus fejléc */}
      <div className="course-header">
        <Link to="/courses" className="back-link">
          ← Vissza a kurzusokhoz
        </Link>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div className="progress-info">
          <p>
            Előrehaladás: {completedCount}/{totalCount} fejezet
          </p>
          <p>
            Kreditek: {completedCredits}/{course.total_credits}
          </p>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Fejezetek listája */}
      <div className="chapters-list">
        <h2>Fejezetek</h2>
        {course.chapters && course.chapters.length > 0 ? (
          course.chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className={`chapter-item ${chapter.completed ? "completed" : ""}`}
            >
              <div className="chapter-header">
                <h3>
                  {index + 1}. fejezet - {chapter.title}
                </h3>
                {chapter.completed && (
                  <span className="completed-badge">✓ Befejezve</span>
                )}
              </div>
              <p>{chapter.description}</p>
              <p className="chapter-credits">Kredit: {chapter.credits}</p>

              <div className="chapter-actions">
                <button className="btn btn-secondary" disabled>
                  Fejezet megtekintése (később)
                </button>

                {chapter.completed ? (
                  <div
                    id={`linkedin-share-${chapter.id}`}
                    className="linkedin-share-container"
                  >
                    {/* LinkedIn share widget jelenik meg ide */}
                  </div>
                ) : (
                  <button
                    onClick={() => handleCompleteChapter(chapter.id)}
                    className="btn btn-primary"
                    disabled={completing === chapter.id}
                  >
                    {completing === chapter.id
                      ? "Befejezés..."
                      : "Befejezettnek jelölés"}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>Ennek a kurzusnak még nincsenek fejezetei.</p>
        )}
      </div>
    </div>
  );
}

export default CourseDetailsPage;
```

### Kurzus részletek CSS

Add hozzá az `src/index.css` fájlhoz:

```css
/* Back link */
.back-link {
  display: inline-block;
  color: var(--primary-color);
  text-decoration: none;
  margin-bottom: 1rem;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

/* Progress bar */
.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--success-color);
  transition: width 0.3s ease;
}

/* Chapter items */
.chapter-item {
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.chapter-item.completed {
  background-color: #f0fdf4;
  border-color: var(--success-color);
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.completed-badge {
  background-color: var(--success-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.chapter-credits {
  color: var(--secondary-color);
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.linkedin-share-container {
  margin-top: 0.5rem;
}
```

## 8. lépés - Mentor foglalás polling-gal

Most implementáljuk a mentor foglalás oldalt 30 másodperces polling-gal.

### Custom polling hook

Hozz létre egy `src/hooks/usePolling.js` fájlt:

```javascript
import { useEffect, useRef, useCallback } from "react";

export function usePolling(callback, interval = 30000) {
  const savedCallback = useRef(callback);
  const intervalIdRef = useRef(null);

  // Mindig a legfrissebb callback-et használjuk
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const startPolling = useCallback(() => {
    if (intervalIdRef.current) return; // Már fut

    // Azonnal meghívjuk egyszer
    savedCallback.current();

    // Elindítjuk az intervallumot
    intervalIdRef.current = setInterval(() => {
      savedCallback.current();
    }, interval);
  }, [interval]);

  const stopPolling = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  // Automatikus indítás és cleanup
  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  return { startPolling, stopPolling };
}
```

### MentorsPage komponens

Módosítsd az `src/pages/MentorsPage.jsx` fájlt:

```jsx
import { useState, useEffect, useCallback } from "react";
import { mentorService } from "../services/api";
import { usePolling } from "../hooks/usePolling";
import { useAuth } from "../hooks/useAuth";

function MentorsPage() {
  const [availableSessions, setAvailableSessions] = useState([]);
  const [bookedSessions, setBookedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null); // ID of session being booked
  const [lastUpdate, setLastUpdate] = useState(null);

  const { refreshUser } = useAuth();

  // Foglalások lekérése
  const loadBookings = useCallback(async () => {
    try {
      const response = await mentorService.getBookedSessions();
      if (response.ok) {
        const data = await response.json();
        setBookedSessions(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  }, []);

  // 30 másodpercenként frissítjük a foglalásokat
  usePolling(loadBookings, 30000);

  // Elérhető időpontok betöltése
  useEffect(() => {
    loadAvailableSessions();
  }, []);

  const loadAvailableSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mentorService.getAvailableSessions();

      if (response.ok) {
        const data = await response.json();
        setAvailableSessions(data);
      } else if (response.status === 401) {
        setError("Kérlek jelentkezz be újra");
      } else {
        setError("Nem sikerült betölteni az elérhető időpontokat");
      }
    } catch (err) {
      setError("Hálózati hiba történt");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (sessionId) => {
    try {
      setBooking(sessionId);

      const response = await mentorService.bookSession(sessionId);

      if (response.status === 200) {
        alert("Sikeres foglalás! A foglalás megerősítésre vár.");
        // Frissítsük az adatokat
        await loadAvailableSessions();
        await loadBookings();
        await refreshUser();
      } else if (response.status === 403) {
        alert("Már foglaltál erre az időpontra");
      } else if (response.status === 422) {
        const data = await response.json();
        alert(data.message || "Nem elég kredit a foglaláshoz");
      } else if (response.status === 404) {
        alert("Ez az időpont már nem elérhető");
        await loadAvailableSessions();
      } else {
        alert("Hiba történt a foglalás során");
      }
    } catch (error) {
      alert("Hálózati hiba történt");
    } finally {
      setBooking(null);
    }
  };

  if (loading) {
    return (
      <div className="page mentors-page">
        <h1>Mentor foglalás</h1>
        <p>Betöltés...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page mentors-page">
        <h1>Mentor foglalás</h1>
        <div className="error-message">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page mentors-page">
      <h1>Mentor foglalás</h1>

      {/* Polling indikátor */}
      <div className="polling-indicator">
        <span className="status-badge">
          🔄 Automatikus frissítés aktív (30 mp)
        </span>
        {lastUpdate && (
          <span className="last-update">
            Utolsó frissítés: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Elérhető időpontok */}
      <div className="mentors-section">
        <h2>Elérhető időpontok</h2>
        {availableSessions.length === 0 ? (
          <p>Jelenleg nincs elérhető időpont</p>
        ) : (
          availableSessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-info">
                <h3>{session.mentor_name}</h3>
                <p><strong>Időpont:</strong> {formatDateTime(session.session_time)}</p>
                <p><strong>Időtartam:</strong> {session.duration_minutes} perc</p>
                <p><strong>Költség:</strong> {session.cost_credits} kredit</p>
                <p><strong>Szakterület:</strong> {session.expertise}</p>
              </div>
              <div className="session-actions">
                <button className="btn btn-secondary" disabled>
                  Profil megtekintése (később)
                </button>
                <button
                  onClick={() => handleBookSession(session.id)}
                  className="btn btn-primary"
                  disabled={booking === session.id}
                >
                  {booking === session.id ? "Foglalás..." : "Foglalás"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Foglalt időpontok */}
      <div className="booked-sessions">
        <h2>Foglalt időpontjaim</h2>
        {bookedSessions.length === 0 ? (
          <p>Még nincs foglalt időpontod.</p>
        ) : (
          bookedSessions.map((booking) => (
            <div key={booking.id} className={`session-card booking-${booking.status}`}>
              <div className="session-info">
                <h3>{booking.mentor_name}</h3>
                <p><strong>Időpont:</strong> {formatDateTime(booking.session_time)}</p>
                <p><strong>Időtartam:</strong> {booking.duration_minutes} perc</p>
                <p><strong>Költség:</strong> {booking.cost_credits} kredit</p>
                <p>
                  <strong>Státusz:</strong>{" "}
                  <span className={`status-label status-${booking.status}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getStatusLabel(status) {
  const labels = {
    pending: "Függőben",
    confirmed: "Megerősítve",
    rejected: "Elutasítva",
    completed: "Befejezve"
  };
  return labels[status] || status;
}

export default MentorsPage;
```

### Mentor foglalás CSS

Add hozzá az `src/index.css` fájlhoz:

```css
/* Polling indicator */
.polling-indicator {
  background-color: #eff6ff;
  border: 1px solid #3b82f6;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e40af;
}

.last-update {
  font-size: 0.875rem;
  color: var(--secondary-color);
}

/* Session cards */
.session-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.session-info h3 {
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

.session-info p {
  margin: 0.25rem 0;
}

.session-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

/* Booking status styles */
.booking-pending {
  border-left: 4px solid #f59e0b;
}

.booking-confirmed {
  border-left: 4px solid var(--success-color);
}

.booking-rejected {
  border-left: 4px solid var(--danger-color);
}

.booking-completed {
  border-left: 4px solid var(--secondary-color);
}

.status-label {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-confirmed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-completed {
  background-color: #e2e8f0;
  color: #475569;
}
```

## 9. lépés - LinkedIn Share Widget integráció

Most integráljuk a LinkedIn Share Widget-et.

### Widget fájlok másolása

Győződj meg róla, hogy a következő fájlok a `public/third-party` mappában vannak:

- `linkedin-share.js`
- `linkedin-share.css`

(Ezeket az 1. modulban már átmásoltuk az `assets/third-party` mappából.)

### Widget betöltése

Módosítsd a `public/index.html` fájlt (vagy add hozzá a szkriptet dinamikusan):

```html
<!doctype html>
<html lang="hu">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SkillShare Academy</title>
    <!-- LinkedIn Share Widget -->
    <link rel="stylesheet" href="/third-party/linkedin-share.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
    <script src="/third-party/linkedin-share.js"></script>
  </body>
</html>
```

A widget automatikusan inicializálódik a `CourseDetailsPage` komponensben, amikor egy fejezetet befejezünk.

## 10. lépés - App.jsx frissítése AuthProvider-rel

Végül frissítsük az `App.jsx`-et, hogy az AuthProvider-t használja:

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import MentorsPage from "./pages/MentorsPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Nyilvános route-ok Layout nélkül */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Védett route-ok Layout-tal */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CoursesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentors"
            element={
              <ProtectedRoute>
                <MentorsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Alapértelmezett átirányítás */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 - Not Found */}
        <Route
          path="*"
          element={
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <h1>404 - Az oldal nem található</h1>
              <a href="/dashboard">Vissza a főoldalra</a>
            </div>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
```

## Tesztelés

Most teszteljük az alkalmazást végig!

### 1. Backend ellenőrzése

```bash
curl http://localhost:5000/api/v1/health
```

Ha fut, látnod kell: `{"status":"healthy"}`

### 2. Regisztráció tesztelése

1. Indítsd az alkalmazást: `npm run dev`
2. Nyisd meg: `http://localhost:5173`
3. Kattints a "Regisztrálj ingyen!" linkre
4. Töltsd ki a formot és regisztrálj
5. Automatikusan átirányít a dashboard-ra

### 3. Dashboard tesztelése

- Látod a neved és a kreditjeidet (kezdetben 0)
- Látod a statisztikákat
- Látod a két grafikont (üresek lesznek, amíg nincs adatod)

### 4. Kurzusok böngészése

1. Kattints a "Kurzusok" menüpontra
2. Látod a kurzuskatalógust
3. Próbáld ki a keresést
4. Próbáld ki a szűrést nehézségi szint szerint
5. Kattints egy "Beiratkozás" gombra
6. A gomb "Tanulás folytatása"-ra változik

### 5. Kurzus részletek

1. Kattints egy beiratkozott kurzusnál a "Tanulás folytatása" gombra
2. Látod a fejezetek listáját
3. Kattints egy "Befejezettnek jelölés" gombra
4. Kapsz egy alert-et a megszerzett kreditekkel
5. A fejezet zöldre vált és megjelenik a LinkedIn share gomb
6. Az előrehaladás sáv frissül

### 6. Mentor foglalás

1. Kattints a "Mentorok" menüpontra
2. Látod az elérhető időpontokat
3. Kattints egy "Foglalás" gombra
4. A foglalás megjelenik a "Foglalt időpontjaim" szekcióban
5. Várj 30 másodpercet - látod, hogy frissül az "Utolsó frissítés" időpont
6. Ha a backend változtat egy foglalás státuszán, automatikusan frissül

### 7. Kijelentkezés

1. Kattints a "Kijelentkezés" gombra
2. Átirányít a login oldalra
3. A token törölve van

### 8. Bejelentkezés

1. Jelentkezz be ugyanazzal a fiókkal
2. Látod, hogy az előrehaladásod megmaradt
3. A dashboard grafikonok már mutatnak adatokat

> [!TIP]
> Ha bármilyen problémád van, nyisd meg a böngésző konzolt (F12 → Console) és a Network fület az API hívások ellenőrzésére!

## Hibakezelés tesztelése

### 401 - Unauthorized

1. Töröld a tokent: `localStorage.removeItem('token')`
2. Frissítsd az oldalt
3. Átirányít a login oldalra

### 403 - Forbidden

1. Próbálj meg kétszer ugyanarra a kurzusra beiratkozni
2. Látnod kell egy hibаüzenetet

### 422 - Validation Error

1. Ha nincs elég kreditje mentor foglaláshoz
2. Látnod kell: "Nem elég kredit a foglaláshoz"

### 404 - Not Found

1. Próbálj meg egy nem létező kurzust megnyitni: `/courses/99999`
2. Látnod kell: "A kurzus nem található"

## Összefoglalás

Ebben a modulban elkészítetted:

✅ **API Service Layer** - központosított backend kommunikáció  
✅ **Valódi hitelesítés** - login és register a backend API-val  
✅ **Dashboard Chart.js-szel** - line és doughnut chartok  
✅ **Kurzuskatalógus** - keresés, szűrés, beiratkozás  
✅ **Kurzus részletek** - fejezetek, befejezés, kredit szerzés  
✅ **LinkedIn Share Widget** - befejezett fejezetek megosztása  
✅ **Mentor foglalás** - 30 másodperces polling-gal  
✅ **Hibakezelés** - minden HTTP státuszkód kezelése  
✅ **Loading állapotok** - felhasználóbarát visszajelzések

### Gratulálunk! 🎉

Elkészítetted a teljes SkillShare Academy alkalmazást! Az alkalmazás:

- ✅ Teljes hitelesítési rendszerrel rendelkezik
- ✅ Integrált a backend API-val
- ✅ Adatvizualizációt tartalmaz Chart.js-szel
- ✅ Valós időben frissül polling-gal
- ✅ Professzionális hibakezelést implementál
- ✅ Third-party library-ket (LinkedIn) integrál

## Következő lépések (opcionális fejlesztések)

Ha szeretnéd tovább fejleszteni az alkalmazást:

1. **Fejlett keresés**
   - Teljes szöveges keresés
   - Több szűrési opció
   - Rendezési lehetőségek

2. **Profil oldal**
   - Felhasználói adatok szerkesztése
   - Jelszó változtatás
   - Profilkép feltöltés

3. **Értesítések**
   - Toast notification rendszer
   - Email értesítések (backend)
   - Push notifikációk

4. **Teljesítmény optimalizálás**
   - React.memo használata
   - useMemo és useCallback optimalizálás
   - Lazy loading komponensekhez
   - Infinite scroll a kurzuslistához

5. **Tesztelés**
   - Unit tesztek (Jest, Vitest)
   - Integration tesztek
   - E2E tesztek (Playwright, Cypress)

6. **Deployment**
   - Build optimalizálás
   - Environment változók
   - CI/CD pipeline
   - Hosting (Vercel, Netlify, stb.)

7. **Accessibility (A11y)**
   - ARIA attribútumok
   - Keyboard navigation
   - Screen reader support
   - Kontrasztok javítása

8. **Progresszív funkciók**
   - Service Workers
   - Offline mode
   - PWA (Progressive Web App)

> [!NOTE]
> Jó munkát végeztél! Most már rendelkezel egy teljes, production-ready React alkalmazással, amely modern best practice-eket követ és valós backend API-val kommunikál!

## Gyakori problémák és megoldások

### A backend nem elérhető

**Probléma:** `Failed to fetch` vagy `Network error`

**Megoldás:**
```bash
cd assets/backend-solution
docker compose up -d
curl http://localhost:5000/api/v1/health
```

### CORS hiba

**Probléma:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Megoldás:** A backend már konfigurálva van CORS-szal, de győződj meg róla, hogy `http://localhost:5173` használod (nem `127.0.0.1`)

### Chart.js nem renderelődik

**Probléma:** A chartok nem jelennek meg

**Megoldás:**
1. Ellenőrizd, hogy telepítetted: `npm install chart.js react-chartjs-2`
2. Ellenőrizd, hogy regisztráltad a szükséges komponenseket
3. Nézd meg a böngésző konzolt hibákért

### Polling nem működik

**Probléma:** A mentor foglalások nem frissülnek automatikusan

**Megoldás:**
1. Ellenőrizd a `usePolling` hook-ot
2. Nézd meg a Network fület - 30 másodpercenként látszódnia kell egy API hívásnak
3. Ellenőrizd, hogy a komponens nem unmountolódik

### LinkedIn Share Widget nem jelenik meg

**Probléma:** A share gomb nem látszik

**Megoldás:**
1. Ellenőrizd, hogy a fájlok a `public/third-party/` mappában vannak
2. Ellenőrizd, hogy betöltődnek a böngésző Network fülén
3. Nézd meg, hogy `window.LinkedInShare` elérhető-e a konzolból

### Token nem mentődik

**Probléma:** Kijelentkezik minden frissítésnél

**Megoldás:**
1. Ellenőrizd a böngésző Developer Tools → Application → Local Storage
2. Nézd meg, hogy a `token` kulcs ott van-e
3. Ellenőrizd, hogy a login/register helyesen menti a tokent

## Wireframe összehasonlítás

Hasonlítsd össze az elkészült alkalmazást a wireframe-ekkel:

1. **01-login.png** ✅ Login oldal
2. **02-register.png** ✅ Register oldal
3. **03-dashboard.png** ✅ Dashboard chartokkal
4. **04-courses.png** ✅ Kurzuskatalógus
5. **05-course-details.png** ✅ Kurzus részletek
6. **06-mentors.png** ✅ Elérhető mentorok
7. **07-booked-sessions.png** ✅ Foglalt időpontok

Minden funkcionalitás implementálva! 🚀

