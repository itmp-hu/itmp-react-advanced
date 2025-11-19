# 1. modul workshop - Projekt bevezetés, alapstruktúra és routing

- React projekt inicializálása Vite-tal
- React Router telepítése és konfigurálása
- Projekt struktúra kialakítása
- Oldalkomponensek létrehozása
- Layout és navigáció implementálása
- Védett route-ok beállítása

> [!NOTE]  
> **Feladat:**  
> Hozz létre egy React projektet Vite-tal, alakítsd ki a SkillShare Academy alapstruktúráját, implementálj többoldalas navigációt React Router segítségével, és állítsd be a védett route-okat. A modul végére egy működő, navigálható alkalmazás vázzal kell rendelkezned, amely készen áll a következő modulok fejlesztéseire.

<hr />

## Előkészületek

### Szükséges eszközök ellenőrzése

Mielőtt elkezdenéd, győződj meg róla, hogy telepítve van:

- **Node.js** (18.x vagy újabb)
- **npm** (Node Package Manager)
- **Visual Studio Code** (vagy más kódszerkesztő)
- **Git** (verziókezeléshez)

Ellenőrzés parancssorból:

```bash
node --version
npm --version
git --version
```

### Backend indítása

A gyakorlat során szükséged lesz a SkillShare Academy backend API-ra. Győződj meg róla, hogy a backend fut:

1. Nyisd meg a `assets/backend-solution` mappát
2. Futtasd: `docker compose up -d`
3. Ellenőrizd: `http://localhost:5000/api/v1/health`

> [!TIP]
> Ha a backend nem elérhető, kérd a mentorod segítségét!

## 1. lépés - React projekt inicializálása

### Projekt létrehozása Vite-tal

1. Nyiss egy terminált a kívánt mappában (pl. `Documents/Projects`)

2. Futtasd a Vite projekt generátor parancsot:

```bash
npm create vite@latest
```

3. A kérdésekre válaszolj a következőképpen:

   - **Project name:** `skillshare-academy`
   - **Select a framework:** `React`
   - **Select a variant:** `JavaScript`

4. Lépj be a projekt mappába és telepítsd a függőségeket:

```bash
cd skillshare-academy
npm install
```

5. Indítsd el a fejlesztői szervert:

```bash
npm run dev
```

6. Nyisd meg a böngészőben: `http://localhost:5173`

> [!NOTE]
> Ha mindent jól csináltál, látni fogsz egy alapértelmezett Vite + React kezdőoldalt a Vite logóval.

### Projekt tisztítása

Töröljük a nem szükséges fájlokat:

1. Töröld a következő fájlokat:

   - `src/App.css`
   - `src/assets/react.svg`
   - `public/vite.svg`

2. Töröld az `src/index.css` fájl teljes tartalmát (később írunk újat)

3. Módosítsd az `src/App.jsx` fájlt:

```jsx
function App() {
  return (
    <div>
      <h1>SkillShare Academy</h1>
      <p>Hamarosan...</p>
    </div>
  );
}

export default App;
```

4. Ellenőrizd a böngészőben - egy egyszerű "SkillShare Academy" feliratot kell látnod

## 2. lépés - React Router telepítése

### Router telepítése

Telepítsd a React Router DOM könyvtárat:

```bash
npm install react-router-dom
```

### BrowserRouter beállítása

Módosítsd a `src/main.jsx` fájlt:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

> [!TIP]
> A `BrowserRouter` egy wrapper komponens, amely lehetővé teszi a React Router használatát az alkalmazásban.

## 3. lépés - Projekt struktúra kialakítása

### Mappák létrehozása

Hozd létre a következő mappa struktúrát az `src` mappában:

```
src/
├── components/
├── pages/
├── contexts/
├── hooks/
├── services/
└── styles/
```

**Windows PowerShell:**

```powershell
New-Item -ItemType Directory -Path src/components
New-Item -ItemType Directory -Path src/pages
New-Item -ItemType Directory -Path src/contexts
New-Item -ItemType Directory -Path src/hooks
New-Item -ItemType Directory -Path src/services
New-Item -ItemType Directory -Path src/styles
```

**macOS/Linux terminal:**

```bash
mkdir -p src/components src/pages src/contexts src/hooks src/services src/styles
```

### LinkedIn Share Widget másolása

Másold a LinkedIn share widget fájlokat a `public` mappába:

1. Hozd létre a `public/third-party` mappát
2. Másold az `assets/third-party/linkedin-share.js` fájlt a `public/third-party/` mappába
3. Másold az `assets/third-party/linkedin-share.css` fájlt a `public/third-party/` mappába

> [!NOTE]
> Ezt a widget-et később használni fogjuk a kurzus fejezetek megosztásához.

## 4. lépés - Oldalkomponensek létrehozása

Most létrehozzuk az alkalmazás 6 alapvető oldalát.

### LoginPage létrehozása

Hozz létre egy `src/pages/LoginPage.jsx` fájlt:

```jsx
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function LoginPage() {
  const navigate = useNavigate();

  // Ha már be van jelentkezve, irányítsuk át a dashboard-ra
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Később itt lesz a valódi API hívás
    localStorage.setItem("token", "test-token-1234567890");
    navigate("/dashboard");
  };

  return (
    <div className="page login-page">
      <div className="login-container">
        <h1>Bejelentkezés</h1>
        <p>SkillShare Academy tanulási platform</p>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input type="email" id="email" placeholder="email@példa.hu" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input type="password" id="password" placeholder="Jelszó" />
          </div>
          <button type="submit" className="btn btn-primary">
            Bejelentkezés
          </button>
        </form>
        <p className="register-link">
          Még nincs fiókod? <a href="/register">Regisztrálj ingyen!</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
```

> [!TIP]
> A `handleLogin` függvény most csak egy tesztelési tokent állít be. A 2. modulban fogjuk a valódi API hívással helyettesíteni!

> [!NOTE] > **Miért useEffect?** A `useEffect` hook-ot használjuk a token ellenőrzésére, mert a navigáció egy "mellékhatás" (side effect). React-ben a mellékhatásokat nem szabad közvetlenül a render függvényben meghívni - ehelyett a `useEffect`-ben kell őket elhelyezni. Ez biztosítja, hogy a navigáció a komponens renderelése után történjen meg.

### RegisterPage létrehozása

Hozz létre egy `src/pages/RegisterPage.jsx` fájlt:

```jsx
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function RegisterPage() {
  const navigate = useNavigate();

  // Ha már be van jelentkezve, irányítsuk át a dashboard-ra
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleRegister = (e) => {
    e.preventDefault();
    // Később itt lesz a valódi API hívás
    localStorage.setItem("token", "test-token-1234567890");
    navigate("/dashboard");
  };

  return (
    <div className="page register-page">
      <div className="register-container">
        <h1>Regisztráció</h1>
        <p>Ingyenes regisztráció</p>
        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Teljes név</label>
            <input type="text" id="name" placeholder="Kovács János" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input type="email" id="email" placeholder="email@példa.hu" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input type="password" id="password" placeholder="Jelszó" />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Jelszó megerősítése</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Jelszó újra"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Regisztráció
          </button>
        </form>
        <p className="login-link">
          Már van fiókod? <a href="/login">Jelentkezz be!</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
```

### DashboardPage létrehozása

Hozz létre egy `src/pages/DashboardPage.jsx` fájlt:

```jsx
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
```

### CoursesPage létrehozása

Hozz létre egy `src/pages/CoursesPage.jsx` fájlt:

```jsx
function CoursesPage() {
  return (
    <div className="page courses-page">
      <h1>Kurzuskatalógus</h1>
      <div className="courses-filters">
        <input type="text" placeholder="Keresés kurzusok között..." />
        <select>
          <option value="">Minden nehézségi szint</option>
          <option value="beginner">Kezdő</option>
          <option value="intermediate">Haladó</option>
          <option value="advanced">Szakértő</option>
        </select>
      </div>
      <div className="courses-grid">
        <div className="course-card">
          <h3>Példa kurzus</h3>
          <p>Kurzus leírása...</p>
          <div className="course-meta">
            <span>Nehézség: Kezdő</span>
            <span>Fejezetek: 10</span>
          </div>
          <button className="btn btn-primary">Beiratkozás</button>
        </div>
      </div>
    </div>
  );
}

export default CoursesPage;
```

### CourseDetailsPage létrehozása

Hozz létre egy `src/pages/CourseDetailsPage.jsx` fájlt:

```jsx
function CourseDetailsPage() {
  return (
    <div className="page course-details-page">
      <div className="course-header">
        <h1>Kurzus címe</h1>
        <p>Kurzus leírása...</p>
        <div className="progress-info">
          <p>Előrehaladás: 0/10 fejezet</p>
          <p>Kreditek: 0/50</p>
        </div>
      </div>

      <div className="chapters-list">
        <h2>Fejezetek</h2>
        <div className="chapter-item">
          <h3>1. fejezet - Bevezetés</h3>
          <p>Fejezet leírása...</p>
          <div className="chapter-actions">
            <button className="btn btn-secondary" disabled>
              Fejezet megtekintése
            </button>
            <button className="btn btn-primary">Befejezettnek jelölés</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailsPage;
```

### MentorsPage létrehozása

Hozz létre egy `src/pages/MentorsPage.jsx` fájlt:

```jsx
function MentorsPage() {
  return (
    <div className="page mentors-page">
      <h1>Mentor foglalás</h1>

      <div className="mentors-section">
        <h2>Elérhető mentorok</h2>
        <div className="mentor-card">
          <h3>Mentor neve</h3>
          <p>Szakterület: Web Development</p>
          <p>Óradíj: 10 kredit/óra</p>
          <div className="mentor-actions">
            <button className="btn btn-secondary" disabled>
              Profil megtekintése
            </button>
          </div>
        </div>
      </div>

      <div className="sessions-section">
        <h2>Elérhető időpontok</h2>
        <div className="session-card">
          <p>Időpont: 2025-11-25 14:00</p>
          <p>Időtartam: 1 óra</p>
          <p>Költség: 10 kredit</p>
          <button className="btn btn-primary">Foglalás</button>
        </div>
      </div>

      <div className="booked-sessions">
        <h2>Foglalt időpontjaim</h2>
        <p>Még nincs foglalt időpontod.</p>
      </div>
    </div>
  );
}

export default MentorsPage;
```

> [!NOTE]
> Ezek a komponensek még nem működnek teljesen - csak a HTML struktúrát tartalmazzák. A következő modulokban fogjuk őket működővé tenni.

## 5. lépés - Layout és Navigation komponensek

### Navigation komponens létrehozása

Hozz létre egy `src/components/Navigation.jsx` fájlt:

```jsx
import { NavLink } from "react-router-dom";

function Navigation() {
  // Később ezt az AuthContext-ből fogjuk kiolvasni
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>SkillShare Academy</h2>
      </div>

      <div className="nav-links">
        {token ? (
          <>
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
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Bejelentkezés
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Regisztráció
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
```

### Layout komponens létrehozása

Hozz létre egy `src/components/Layout.jsx` fájlt:

```jsx
import { Outlet } from "react-router-dom";
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
```

> [!TIP]
> Az `Outlet` komponens a React Router speciális komponense, amely a gyermek route-okat jeleníti meg.

### ProtectedRoute komponens létrehozása

Hozz létre egy `src/components/ProtectedRoute.jsx` fájlt:

```jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Ha nincs token, irányítsuk a login oldalra
    return <Navigate to="/login" replace />;
  }

  // Ha van token, jelenítsd meg az oldalt
  return children;
}

export default ProtectedRoute;
```

## 6. lépés - Route-ok beállítása

Most összerakjuk az összes komponenst az `App.jsx` fájlban.

Módosítsd az `src/App.jsx` fájlt:

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
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
            <a href="/login">Vissza a főoldalra</a>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
```

> [!NOTE]
> Most már több oldal között tudunk navigálni! Próbáld ki a böngészőben.

## 7. lépés - Alap stílusok

Most adjunk hozzá néhány alapvető stílust, hogy az alkalmazás ne nézzen ki teljesen stílustalanul.

Módosítsd az `src/index.css` fájlt:

```css
/* Reset és alap stílusok */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --bg-color: #f8fafc;
  --text-color: #1e293b;
  --border-color: #e2e8f0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--bg-color);
}

/* Layout */
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Navigation */
.navigation {
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-brand h2 {
  color: var(--primary-color);
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: var(--bg-color);
}

.nav-link.active {
  color: var(--primary-color);
  background-color: #eff6ff;
}

/* Footer */
.footer {
  background-color: white;
  border-top: 1px solid var(--border-color);
  padding: 1.5rem 2rem;
  text-align: center;
  color: var(--secondary-color);
}

/* Pages */
.page {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Login & Register Pages */
.login-page,
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container,
.register-container {
  background: white;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-container h1,
.register-container h1 {
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.login-form,
.register-form {
  margin-top: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  width: 100%;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  background-color: #475569;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.register-link,
.login-link {
  margin-top: 1rem;
  text-align: center;
  color: var(--secondary-color);
}

.register-link a,
.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

/* Dashboard */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.welcome-section {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-top: 0.5rem;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.chart-placeholder {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color);
}

/* Courses */
.courses-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.courses-filters input,
.courses-filters select {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.course-meta {
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
  color: var(--secondary-color);
  font-size: 0.875rem;
}

/* Course Details */
.course-header {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.progress-info {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  color: var(--secondary-color);
}

.chapters-list {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chapter-item {
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.chapter-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

/* Mentors */
.mentors-section,
.sessions-section,
.booked-sessions {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.mentor-card,
.session-card {
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.mentor-actions {
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .main-content {
    padding: 1rem;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }
}
```

## Tesztelés

Most próbáld ki az alkalmazást!

1. **Navigáció tesztelése:**

   - Nyisd meg a böngészőt: `http://localhost:5173`
   - Átirányít a `/dashboard`-ra, majd mivel nincs token, a `ProtectedRoute` átirányít a `/login` oldalra
   - Kattints a "Regisztrálj ingyen!" linkre → átirányít a `/register` oldalra
   - Kattints vissza a "Jelentkezz be!" linkre → vissza a login-ra

2. **Védett route-ok tesztelése:**

   - Próbáld meg közvetlenül megnyitni: `http://localhost:5173/dashboard`
   - Mivel nincs token, átirányít a login oldalra

3. **Bejelentkezés tesztelése:**

   - A login oldalon kattints a "Bejelentkezés" gombra
   - Az alkalmazás beállít egy teszt tokent és átirányít a dashboard-ra
   - Most már látni fogod a navigációt és eléred a védett oldalakat!
   - Próbáld ki a regisztrációs oldalt is - ugyanúgy működik

4. **Különböző oldalak tesztelése:**

   - Dashboard: `http://localhost:5173/dashboard`
   - Kurzusok: `http://localhost:5173/courses`
   - Mentorok: `http://localhost:5173/mentors`

5. **Kijelentkezés tesztelése:**
   - Kattints a "Kijelentkezés" gombra
   - Az alkalmazás törli a tokent és átirányít a login oldalra

> [!TIP]
> Ha bármilyen problémád van, nyisd meg a böngésző konzolt (F12 → Console) és keresd a hibaüzeneteket!

## Összefoglalás

Ebben a modulban elkészítetted:

✅ Vite + React projekt alapstruktúráját  
✅ React Router beállítását és működését  
✅ 6 oldal komponenst (Login, Register, Dashboard, Courses, Course Details, Mentors)  
✅ Layout és Navigation komponenseket  
✅ ProtectedRoute komponenst a védett oldalakhoz  
✅ Alap CSS stílusokat

### Következő lépések (2. modul)

A következő modulban fogjuk:

- Implementálni a valódi hitelesítést (login/register működőképessé tétele)
- Létrehozni az AuthContext-et a globális állapotkezeléshez
- Készíteni custom hookokat (useAuth, useApi)
- Form validációt hozzáadni
- API integrációt megkezdeni

## Kiegészítő feladatok (ha van időd)

Ha gyorsan végez sz az alapfeladatokkal, próbáld ki ezeket:

1. **Saját stílusok:** Módosítsd a színsémát az `src/index.css` fájlban (`:root` változók)

2. **404 oldal:** Készíts egy szebb 404 oldalt (`src/pages/NotFoundPage.jsx`)

3. **Loading komponens:** Hozz létre egy loading spinner komponenst későbbi használatra

4. **Wireframe összehasonlítás:** Nyisd meg a wireframe képeket az `assets/wireframes/` mappából és hasonlítsd össze az általad készített oldalakkal

> [!NOTE]
> Jó munkát végeztél! A következő modulban tovább fejlesztjük az alkalmazást.
