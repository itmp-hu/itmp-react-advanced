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

### Kiindulási állapot

Győződj meg róla, hogy az 1-2. modul befejezett állapotában vagy:

✅ React Router telepítve és működik (Module 1)  
✅ AuthContext implementálva mock service-szel (Module 2)  
✅ LoginPage, RegisterPage, Navigation, Dashboard működik (Module 2)  
✅ authMiddleware implementálva (Module 1)  
✅ Token perzisztencia localStorage-ban (Module 2)

> [!NOTE] > **Module 2 → Module 3 átmenet:**
>
> - A mock `authService.js`-t lecseréljük valódi API service-re (`api.js`)
> - Az AuthContext logikája **NEM** változik (továbbra sem használ `useNavigate`-et)
> - A komponensek továbbra is kezelik a navigációt
> - A token kezelés változatlan marad

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

Most lecseréljük a mock `authService.js`-t valódi API service-re, amely központosítja az összes backend kommunikációt.

> [!NOTE]
> A Module 2-ben egy **mock** `authService.js`-t használtunk. Most ezt fogjuk lecserélni egy valódi API service-re, amely a backend API-t hívja.

### Mock authService.js törlése és új API service létrehozása

1. **Töröld** a `src/services/authService.js` fájlt (ez a mock service volt)
2. **Hozz létre** egy új `src/services/api.js` fájlt:

```javascript
const API_BASE_URL = "http://localhost:5000/api/v1";

// Helper függvény a hitelesítéshez szükséges headerek összeállításához
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "X-API-TOKEN": token,
    "Content-Type": "application/json",
  };
}

// Hitelesítési szolgáltatások
export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  async register(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response;
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/users/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response;
  },
};

// Felhasználói szolgáltatások
export const userService = {
  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders(),
    });
    return response;
  },
};

// Kurzus szolgáltatások
export const courseService = {
  async getAllCourses() {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  async getCourseById(id) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  async enrollInCourse(id) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/enroll`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response;
  },
};

// Fejezet szolgáltatások
export const chapterService = {
  async completeChapter(courseId, chapterId) {
    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/complete`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return response;
  },
};

// Mentor szolgáltatások
export const mentorService = {
  async getAvailableSessions() {
    const response = await fetch(`${API_BASE_URL}/mentors/sessions`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  async bookSession(id) {
    const response = await fetch(
      `${API_BASE_URL}/mentors/sessions/${id}/book`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return response;
  },
};
```

> [!TIP]
> Az API service layer elkülöníti a backend kommunikációt a komponensektől, így könnyen karbantartható és újrafelhasználható a kód.

## 2. lépés - AuthContext frissítése valódi API-val

Most frissítjük az AuthContext-et, hogy a valódi backend API-t használja a mock service helyett.

> [!IMPORTANT] > **Fontos változás a Module 2-höz képest:**
>
> - A mock `authService` importját lecseréljük a valódi API service-re
> - Az AuthContext logikája **NEM** változik - továbbra is **NEM** használ `useNavigate`-et
> - A komponensek továbbra is kezelik a navigációt

### AuthContext frissítése

Módosítsd az `src/contexts/AuthContext.jsx` fájlt:

```jsx
import { createContext, useState, useContext, useEffect } from "react";
import { authService, userService } from "../services/api";

// 1. Context létrehozása
const AuthContext = createContext();

// 2. Provider komponens
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Token ellenőrzése és felhasználó betöltése oldal betöltéskor
  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem("token");

      if (savedToken) {
        setToken(savedToken);

        try {
          const response = await userService.getCurrentUser();

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
          } else {
            // Token érvénytelen, töröljük
            localStorage.removeItem("token");
            setToken(null);
          }
        } catch (error) {
          console.error("Error loading user:", error);
          localStorage.removeItem("token");
          setToken(null);
        }
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  // Login függvény
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      if (response.status === 200) {
        const data = await response.json();

        // Token és user mentése
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);

        return { success: true };
      }

      if (response.status === 401) {
        throw new Error("Hibás email vagy jelszó");
      }

      if (response.status === 422) {
        const data = await response.json();
        throw new Error(data.message || "Validációs hiba");
      }

      throw new Error("Hiba történt a bejelentkezés során");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Register függvény
  const register = async (name, email, password) => {
    try {
      const response = await authService.register(name, email, password);

      if (response.status === 201) {
        const data = await response.json();
        return data;
      }

      if (response.status === 400) {
        throw new Error("A felhasználó már létezik");
      }

      if (response.status === 422) {
        const data = await response.json();
        throw new Error(data.message || "Validációs hiba");
      }

      throw new Error("Hiba történt a regisztráció során");
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  // Logout függvény
  const logout = async () => {
    try {
      // Hívjuk a backend logout endpoint-ot (token revocation)
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Ha a backend hívás sikertelen, akkor is töröljük a tokent
    } finally {
      // Mindenképp töröljük a tokent a frontenden
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  // Felhasználó adatainak frissítése (pl. kredit változás után)
  const refreshUser = async () => {
    try {
      const response = await userService.getCurrentUser();
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Custom hook a Context használatához
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
```

> [!NOTE] > **Fontos különbségek a Module 2 mock service-hez képest:**
>
> - A mock service azonnal visszaadta az eredményt, a valódi API HTTP státuszkódokat ad vissza
> - A `login()` és `register()` továbbra sem navigál - ezt a komponensek kezelik
> - A `userService.getCurrentUser()` mostantól a backend-től kéri le a user adatokat
> - A `refreshUser()` függvény lehetővé teszi a user adatok frissítését (pl. kredit változás után)

## 3. lépés - LoginPage és RegisterPage frissítése

Most frissítjük a LoginPage és RegisterPage-et, hogy a valódi API-t használják.

> [!NOTE] > **Változás a Module 2-höz képest:**
>
> - Az `authService` importot **töröljük** (ezt már az AuthContext használja)
> - A komponens továbbra is kezeli a navigációt a sikeres login/register után

### LoginPage frissítése

Módosítsd az `src/pages/LoginPage.jsx` fájlt - **töröld** a régi `authService` importot:

```jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Ha már be van jelentkezve, irányítsuk a dashboard-ra
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Form validáció
  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Az email cím kötelező";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Érvénytelen email formátum";
    }

    if (!password) {
      newErrors.password = "A jelszó kötelező";
    } else if (password.length < 6) {
      newErrors.password =
        "A jelszónak legalább 6 karakter hosszúnak kell lennie";
    }

    return newErrors;
  };

  // Form elküldés
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Validáció
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Login API hívás (az AuthContext-en keresztül)
    setLoading(true);
    try {
      await login(email, password);
      // Sikeres login után navigáció a komponensben!
      navigate("/dashboard");
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="login-container">
        <h1>Bejelentkezés</h1>
        <p>SkillShare Academy tanulási platform</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              className={errors.email ? "input-error" : ""}
              placeholder="email@példa.hu"
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              className={errors.password ? "input-error" : ""}
              placeholder="Jelszó"
              disabled={loading}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Bejelentkezés..." : "Bejelentkezés"}
          </button>
        </form>

        <p className="register-link">
          Még nincs fiókod? <Link to="/register">Regisztrálj ingyen!</Link>
        </p>

        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#f0f9ff",
            borderRadius: "0.5rem",
          }}
        >
          <p style={{ fontSize: "0.875rem", color: "#0369a1" }}>
            <strong>Teszt bejelentkezés:</strong>
            <br />
            Email: alice@example.com
            <br />
            Jelszó: password123
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
```

### RegisterPage frissítése

A RegisterPage frissítése hasonló a LoginPage-hez - **töröld** a régi `authService` importot és használd az AuthContext-et:

> [!NOTE]
> A RegisterPage a Module 2-ben már készen van, csak az import-ot kell frissíteni.
> A komponens továbbra is kezeli a navigációt a sikeres regisztráció után (2 másodperc delay után navigate("/login")).

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Ha már be van jelentkezve, irányítsuk a dashboard-ra
  if (isAuthenticated) {
    navigate("/dashboard");
  }

  const validateForm = () => {
    const newErrors = {};

    if (!name) {
      newErrors.name = "A név kötelező";
    } else if (name.length < 3) {
      newErrors.name = "A névnek legalább 3 karakter hosszúnak kell lennie";
    }

    if (!email) {
      newErrors.email = "Az email cím kötelező";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Érvénytelen email formátum";
    }

    if (!password) {
      newErrors.password = "A jelszó kötelező";
    } else if (password.length < 8) {
      newErrors.password =
        "A jelszónak legalább 8 karakter hosszúnak kell lennie";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "A jelszó megerősítése kötelező";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "A két jelszó nem egyezik";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    // Validáció
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Register API hívás (az AuthContext-en keresztül)
    setLoading(true);
    try {
      const result = await register(name, email, password);
      setSuccessMessage(result.message || "Sikeres regisztráció!");
      // 2 másodperc után átirányítás - a komponensben!
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (JSX return ugyanaz mint a Module 2-ben, error handling-gel)
}

export default RegisterPage;
```

> [!TIP]
> A teljes RegisterPage komponens megegyezik a Module 2-ben implementálttal, csak az `authService` importját cseréltük le `useAuth`-ra.

## 4. lépés - Navigation frissítése

A Navigation komponenst is frissíteni kell, hogy a logout után navigáljon.

Módosítsd az `src/components/Navigation.jsx` fájlt:

```jsx
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function Navigation() {
  const { user, logout } = useAuth();
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
```

## 5. lépés - Dashboard Chart.js-szel

Most implementáljuk a Dashboard oldalt Chart.js vizualizációkkal.

### Dashboard komponens

Módosítsd az `src/pages/DashboardPage.jsx` fájlt:

```jsx
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
import { userService } from "../services/api";

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

  const loadData = async () => {
    setLoading(true);

    try {
      const response = await userService.getCurrentUser();

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error("Nem sikerült betölteni a felhasználót");
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (authLoading || loading) {
    return <div className="page dashboard-page">Betöltés...</div>;
  }

  if (!dashboardData || !dashboardData.user.email) {
    return <div className="page dashboard-page">Nincs felhasználó</div>;
  }

  const { user, stats, credits, recentActivity } = dashboardData;

  // Kurzus előrehaladás grafikon
  // Megjegyzés: Az API /users/me endpoint a következő struktúrát adja vissza:
  // { user: {...}, stats: {...}, credits: X, recentActivity: [...] }
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
          <h2>Üdvözöllek, {user.name}!</h2>
          <p>
            Email: <strong>{user.email}</strong>
          </p>
          <p>
            Jelenlegi kreditek: <strong>{user.creditBalance || 0}</strong>
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
```

### Dashboard CSS frissítés

Add hozzá az `src/index.css` fájlhoz:

```css
/* Dashboard Charts */
.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 300px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--secondary-color);
  text-align: center;
}

.chart-placeholder p {
  margin-bottom: 1rem;
}

/* Loading States */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 1.125rem;
  color: var(--secondary-color);
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

/* Recent Activity */
.recent-activity {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.recent-activity h3 {
  margin-bottom: 1rem;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activity-item small {
  color: var(--secondary-color);
  font-size: 0.75rem;
}

.credits-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.credits-badge.success {
  background-color: #d1fae5;
  color: #065f46;
}

.credits-badge.danger {
  background-color: #fee2e2;
  color: #991b1b;
}
```

## 6. lépés - Kurzuskatalógus implementálása

Most implementáljuk a kurzusok oldalt keresési és szűrési funkciókkal.

Módosítsd az `src/pages/CoursesPage.jsx` fájlt:

```jsx
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { courseService } from "../services/api";

function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  // Kurzusok betöltése
  const loadCourses = async () => {
    setError("");

    try {
      const response = await courseService.getAllCourses();

      if (response.ok) {
        const data = await response.json();
        // Az API { courses: [...] } formátumban adja vissza
        setCourses(data.courses || data);
      } else {
        setError("Nem sikerült betölteni a kurzusokat");
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      setError("Hálózati hiba történt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    setEnrollError("");
    setEnrollingCourseId(courseId);

    try {
      const response = await courseService.enrollInCourse(courseId);

      if (response.ok) {
        // refresh list
        await loadCourses();
      } else if (response.status === 403) {
        setEnrollError("Már beiratkoztál erre a kurzusra");
      } else {
        setEnrollError("Nem sikerült beiratkozni a kurzusra");
      }
    } catch (err) {
      console.error("Error enrolling:", err);
      setEnrollError("Hálózati hiba történt");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Szűrés és keresés
  const filteredCourses = courses.filter((course) => {
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
        <h1>Kurzusok</h1>
        <div className="loading-spinner">Betöltés...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page courses-page">
        <h1>Kurzusok</h1>
        <div className="error-message">
          ⚠️ {error}
          <button
            onClick={loadCourses}
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Újrapróbálás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page courses-page">
      <h1>Kurzusok</h1>

      <p style={{ marginBottom: "2rem", color: "var(--secondary-color)" }}>
        Helló {user?.name}! Itt láthatod az elérhető kurzusokat.
      </p>

      <div className="courses-filters">
        <input
          type="text"
          placeholder="Keresés..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="">Minden nehézség</option>
          <option value="beginner">Kezdő</option>
          <option value="intermediate">Haladó</option>
          <option value="advanced">Szakértő</option>
        </select>
      </div>

      {enrollError && <div className="error-message">⚠️ {enrollError}</div>}

      {filteredCourses.length === 0 ? (
        <div className="no-results">
          <p>Nincs találat a keresési feltételeknek megfelelően.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <span>📚 {course.totalChapters} fejezet</span>
                <span>⭐ {getDifficultyLabel(course.difficulty)}</span>
              </div>
              {course.isEnrolled ? (
                <Link
                  to={`/courses/${course.id}`}
                  className="btn btn-secondary"
                >
                  Folytatás
                </Link>
              ) : (
                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrollingCourseId === course.id}
                  className="btn btn-primary"
                >
                  {enrollingCourseId === course.id
                    ? "Beiratkozás..."
                    : "Beiratkozás"}
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
    advanced: "Szakértő",
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
import { useParams, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { courseService, chapterService } from "../services/api";

function CourseDetailsPage() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingChapterId, setCompletingChapterId] = useState(null);

  const loadCourseDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await courseService.getCourseById(id);

      if (response.ok) {
        const data = await response.json();
        // Az API { course: {...} } formátumban adja vissza
        setCourse(data.course || data);
      } else if (response.status === 404) {
        setError("A kurzus nem található");
      } else {
        setError("Nem sikerült betölteni a kurzus adatait");
      }
    } catch (error) {
      console.error("Error loading course:", error);
      setError("Hálózati hiba történt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseDetails();
  }, [id]);

  useEffect(() => {
    LinkedInShare.init({
      container: "#linkedin-share-root",
      theme: "light",
      locale: "en-US",
    });
  }, []);

  const handleCompleteChapter = async (chapterId) => {
    setCompletingChapterId(chapterId);

    try {
      const response = await chapterService.completeChapter(id, chapterId);

      if (response.ok) {
        const data = await response.json();
        alert(`Gratulálunk! +${data.creditsEarned} kredit!`);

        // Frissítsük a kurzus adatokat és a felhasználó adatait
        await loadCourseDetails();
        await refreshUser();
      } else if (response.status === 403) {
        alert("Ezt a fejezetet már befejezted");
      } else {
        alert("Nem sikerült befejezni a fejezetet");
      }
    } catch (error) {
      console.error("Error completing chapter:", error);
      alert("Hálózati hiba történt");
    } finally {
      setCompletingChapterId(null);
    }
  };

  const share = (chapter) => {
    LinkedInShare.open({
      url: `/courses/${course.id}`,
      title: course.title,
      summary: `I just completed ${chapter.title}!`,
      source: "SkillShare Academy",
      tags: ["learning", "skills"],
    });
  };

  if (loading) {
    return (
      <div className="page course-details-page">
        <div className="loading-spinner">Betöltés...</div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="page course-details-page">
        <div className="error-message">⚠️ {error}</div>
        <Link to="/courses" className="btn btn-primary">
          Vissza a kurzusokhoz
        </Link>
      </div>
    );
  }

  const completedCount =
    course.chapters?.filter((ch) => ch.isCompleted).length || 0;
  const totalCount = course.chapters?.length || 0;
  const completedCredits =
    course.chapters
      ?.filter((ch) => ch.isCompleted)
      .reduce((sum, ch) => sum + ch.credits, 0) || 0;

  return (
    <div className="page course-details-page">
      <div className="course-header">
        <Link to="/courses" className="back-link">
          ← Vissza a kurzusokhoz
        </Link>

        <h1>{course.title}</h1>
        <p className="course-description">{course.description}</p>

        {error && <div className="error-message">⚠️ {error}</div>}

        {course.isEnrolled && (
          <div className="progress-section">
            <h3>Előrehaladás</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    totalCount > 0 ? (completedCount / totalCount) * 100 : 0
                  }%`,
                }}
              ></div>
            </div>
            <p>
              {completedCount} / {totalCount} fejezet befejezve
            </p>
            <p>Összegyűjtött kreditek: {completedCredits}</p>
          </div>
        )}
      </div>

      {course.isEnrolled && (
        <div className="chapters-section">
          <h2>Fejezetek</h2>
          <div className="chapters-list">
            {course.chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`chapter-item ${
                  chapter.isCompleted ? "completed" : ""
                }`}
              >
                <div className="chapter-info">
                  <h3>
                    {chapter.isCompleted && "✓ "}
                    {chapter.title}
                  </h3>
                  <p>Jutalom: {chapter.credits} kredit</p>
                </div>
                <div className="chapter-actions">
                  {!chapter.isCompleted && (
                    <button
                      onClick={() => handleCompleteChapter(chapter.id)}
                      disabled={completingChapterId === chapter.id}
                      className="btn btn-primary"
                    >
                      {completingChapterId === chapter.id
                        ? "Befejezés..."
                        : "Befejezés"}
                    </button>
                  )}
                  {chapter.isCompleted && (
                    <div
                      id={`linkedin-share-${chapter.id}`}
                      className="linkedin-share-container"
                    >
                      <button
                        className="btn btn-secondary"
                        onClick={() => share(chapter)}
                      >
                        Megosztás LinkedInen
                      </button>
                      <span className="completed-badge">✅ Befejezve</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div id="linkedin-share-root"></div>
    </div>
  );
}

export default CourseDetailsPage;
```

### Kurzus részletek CSS

Add hozzá az `src/index.css` fájlhoz:

```css
/* Course Details Extended */
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

.course-description {
  color: var(--secondary-color);
  font-size: 1.125rem;
  margin: 1rem 0;
}

.progress-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.progress-bar {
  width: 100%;
  height: 1.5rem;
  background-color: var(--bg-color);
  border-radius: 0.75rem;
  overflow: hidden;
  margin: 1rem 0;
}

.progress-fill {
  height: 100%;
  background-color: var(--success-color);
  transition: width 0.3s ease;
}

.chapters-section {
  margin-top: 2rem;
}

.chapter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.chapter-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chapter-item.completed {
  background-color: #f0fdf4;
  border-color: var(--success-color);
}

.chapter-info h3 {
  margin-bottom: 0.5rem;
}

.chapter-info p {
  color: var(--secondary-color);
  font-size: 0.875rem;
}

.completed-badge {
  background-color: var(--success-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.linkedin-share-container {
  display: flex;
  gap: 1rem;
  align-items: center;
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
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { mentorService, userService } from "../services/api";
import { usePolling } from "../hooks/usePolling";

function MentorsPage() {
  const { refreshUser } = useAuth();
  const [availableSessions, setAvailableSessions] = useState([]);
  const [bookedSessions, setBookedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadAvailableSessions = async () => {
    try {
      const response = await mentorService.getAvailableSessions();

      if (response.ok) {
        const data = await response.json();
        // Az API { sessions: [...] } formátumban adja vissza
        setAvailableSessions(data.sessions || data);
        setLastUpdate(new Date());
        setError("");
      } else {
        setError("Nem sikerült betölteni az elérhető időpontokat");
      }
    } catch (error) {
      console.error("Error loading available sessions:", error);
      setError("Hálózati hiba történt");
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([loadAvailableSessions(), loadBookedSessions()]);
    } catch (err) {
      console.error("Error loading all data:", err);
    }
    setLoading(false);
  };

  const loadBookedSessions = async () => {
    try {
      const response = await userService.getCurrentUser();

      if (response.ok) {
        const data = await response.json();
        const sessions = data.sessions;
        setBookedSessions(sessions);
        setError("");
      } else {
        setError("Nem sikerült betölteni a foglalásokat");
      }
    } catch (error) {
      console.error("Error loading booked sessions:", error);
      setError("Hálózati hiba történt");
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Polling - frissítés 30 másodpercenként (elérhető és foglalt időpontok)
  usePolling(() => {
    loadAvailableSessions();
    loadBookedSessions();
    setLastUpdate(new Date());
  }, 30000);

  const handleBookSession = async (sessionId) => {
    setBookingId(sessionId);
    setError("");

    try {
      const response = await mentorService.bookSession(sessionId);

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Sikeres foglalás!");
        // Frissítsd az adatokat és a felhasználó adatait
        await loadAllData();
        await refreshUser();
      } else if (response.status === 403) {
        alert("Nem elég kredit a foglaláshoz");
      } else if (response.status === 409) {
        alert("Ez az időpont már foglalt");
      } else {
        alert("Nem sikerült lefoglalni az időpontot");
      }
    } catch (error) {
      console.error("Error booking session:", error);
      alert("Hálózati hiba történt");
    } finally {
      setBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page mentors-page">
        <h1>Mentor foglalás</h1>
        <div className="loading-spinner">Betöltés...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page mentors-page">
        <h1>Mentor foglalás</h1>
        <div className="error-message">⚠️ {error}</div>
      </div>
    );
  }

  return (
    <div className="page mentors-page">
      <h1>Mentor foglalás</h1>
      <p className="last-update">
        Utolsó frissítés: {lastUpdate.toLocaleTimeString()}
        <br />
        <small>(Automatikus frissítés 30 másodpercenként)</small>
      </p>

      {bookedSessions.length > 0 && (
        <section className="booked-sessions">
          <h2>Foglalt időpontjaim</h2>
          {bookedSessions.length === 0 ? (
            <p>Jelenleg nincs foglalásod.</p>
          ) : (
            <div className="sessions-grid">
              {bookedSessions.map((item) => {
                const s = item.session;
                return (
                  <div key={item.id} className="session-card booked">
                    <div className="session-info">
                      <h3>{s.mentorName}</h3>
                      <p>
                        <strong>Időpont:</strong>{" "}
                        {formatDateTime(s.sessionDate)}
                      </p>
                      <p>
                        <strong>Állapot:</strong> {item.status}
                      </p>
                      <p>
                        <strong>Költség:</strong> {item.creditsPaid} kredit
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section className="available-sessions">
        <h2>Elérhető időpontok</h2>
        {availableSessions.length === 0 ? (
          <p>Jelenleg nincs elérhető időpont.</p>
        ) : (
          <div className="sessions-grid">
            {availableSessions.map((session) => (
              <div key={session.id} className="session-card">
                <div className="session-info">
                  <h3>{session.mentorName}</h3>
                  <p>
                    <strong>Időpont:</strong>{" "}
                    {formatDateTime(session.sessionDate)}
                  </p>
                  <p>
                    <strong>Időtartam:</strong> {session.durationMinutes} perc
                  </p>
                  <p>
                    <strong>Költség:</strong> {session.creditCost} kredit
                  </p>
                  <p>
                    <strong>Szakterület:</strong> {session.expertise}
                  </p>
                  <p>
                    <strong>Szint:</strong>{" "}
                    {getExperienceLabel(session.experienceLevel)}
                  </p>
                </div>
                <div className="session-actions">
                  <button
                    onClick={() => handleBookSession(session.id)}
                    disabled={bookingId === session.id || !session.isAvailable}
                    className="btn btn-primary"
                  >
                    {bookingId === session.id
                      ? "Foglalás..."
                      : !session.isAvailable
                      ? "Nem elérhető"
                      : "Foglalás"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getExperienceLabel(level) {
  const labels = {
    junior: "Junior",
    mid: "Mid-level",
    senior: "Senior",
  };
  return labels[level] || level;
}

export default MentorsPage;
```

### Mentor foglalás CSS

Add hozzá az `src/index.css` fájlhoz:

```css
/* Mentors Page Extended */
.mentors-page {
  max-width: 1200px;
  margin: 0 auto;
}

.last-update {
  background: #fffbeb;
  border: 1px solid #fbbf24;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  color: #92400e;
  font-size: 0.875rem;
}

.available-sessions,
.booked-sessions {
  margin-bottom: 3rem;
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.session-card {
  background: white;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.session-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.session-card.booking-pending {
  border-color: #fbbf24;
  background-color: #fffbeb;
}

.session-card.booking-confirmed {
  border-color: var(--success-color);
  background-color: #f0fdf4;
}

.session-card.booking-rejected {
  border-color: var(--danger-color);
  background-color: #fef2f2;
}

.session-card.booking-completed {
  border-color: var(--secondary-color);
  background-color: #f8fafc;
}

.session-info h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.session-info p {
  margin: 0.5rem 0;
  color: var(--text-color);
  font-size: 0.9375rem;
}

.session-info strong {
  color: var(--text-color);
  font-weight: 600;
}

.session-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
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
  background-color: #e0e7ff;
  color: #3730a3;
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
<!DOCTYPE html>
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

Végül frissítsük az `App.jsx`-et, hogy az AuthProvider-t és a Data Router-t használja:

```jsx
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import MentorsPage from "./pages/MentorsPage";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import authMiddleware from "./middleware/authMiddleware";
import { AuthProvider } from "./contexts/AuthContext";

const router = createBrowserRouter([
  // Nyilvános route-ok (Layout nélkül)
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
    middleware: [authMiddleware],
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
  return (
    <AuthProvider>
      <RouterProvider router={router} />
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

> [!NOTE] > **Főbb változások a Module 2-höz képest:**
>
> - ❌ **Töröltük:** `src/services/authService.js` (mock service)
> - ✅ **Hozzáadtuk:** `src/services/api.js` (valódi API service)
> - 🔄 **Frissítettük:** AuthContext - most az `api.js` authService-ét használja
> - ✅ **Megtartottuk:** Az AuthContext továbbra is NEM használ `useNavigate`-et
> - ✅ **Megtartottuk:** A komponensek továbbra is kezelik a navigációt
> - ✅ **Hozzáadtuk:** `refreshUser()` funkció a user adatok frissítéséhez
> - ✅ **Hozzáadtuk:** Chart.js, LinkedIn Widget, Polling, stb.

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
