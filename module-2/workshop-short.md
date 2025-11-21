# 2. modul workshop (rövid verzió) - AuthContext és form kezelés

- Controlled formok és validáció
- AuthContext implementálása
- Custom hooks készítése (useAuth)
- Login form validációval
- Token kezelés localStorage-ban
- Hibakezelés és hibaüzenetek

> [!NOTE]  
> **Feladat:**  
> Implementálj egy működő hitelesítési rendszert Context API és custom hooks használatával. Készíts form validációt a Login oldalon, és használd az AuthContext-et a globális állapotkezeléshez. Frissítsd a Navigation és Dashboard komponenseket, hogy megjelenítse a bejelentkezett user adatait.

<hr />

## Előkészületek

### Kiindulási állapot

A kiindulási állapot a **Module 1 solution + extra fájlok** lesz. Már elő van készítve számodra:

✅ React Router telepítve és működik  
✅ 6 oldal komponens létrehozva  
✅ Layout és Navigation komponensek működnek  
✅ authMiddleware implementálva  
✅ **Alap + extra CSS stílusok** (error handling, alerts)  
✅ **`src/services/authService.js`** - Mock authentication service

> [!TIP] > **Amit már kész kaptál a kiindulási állapotban:**
>
> - Az `src/services/authService.js` teljes implementációja mock user-ekkel
> - CSS stílusok form validációhoz (`.input-error`, `.error-text`, `.alert`)
> - A `RegisterPage` nem lesz módosítva ebben a feladatban
> - A `CoursesPage` nem lesz módosítva ebben a feladatban

## 1. lépés - LoginPage form validáció

Frissítsd a LoginPage komponenst, hogy controlled form-ot használjon validációval, és integráljuk a mock auth service-t.

Módosítsd a `src/pages/LoginPage.jsx` fájlt:

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { login } from "../services/authService";

function LoginPage() {
  // Form mezők state-jei (controlled inputs)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hiba kezelés
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Client-side form validáció
  const validateForm = () => {
    const newErrors = {};

    // Email validáció
    if (!email) {
      newErrors.email = "Az email cím kötelező";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Érvénytelen email formátum";
    }

    // Jelszó validáció
    if (!password) {
      newErrors.password = "A jelszó kötelező";
    } else if (password.length < 6) {
      newErrors.password =
        "A jelszónak legalább 6 karakter hosszúnak kell lennie";
    }

    return newErrors;
  };

  // Form elküldés kezelése
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Validáció
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Login API hívás (mock service)
    setLoading(true);
    try {
      const { user, token } = await login(email, password);

      // Token mentése localStorage-ba
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Sikeres login után átirányítás
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
                // Töröljük a hibaüzenetet, ha a user módosítja a mezőt
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
                // Töröljük a hibaüzenetet, ha a user módosítja a mezőt
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
            Email: alice@example.com vagy john@example.com
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

> [!NOTE] > **Controlled vs Uncontrolled Inputs:**
>
> - **Controlled**: Az input értéke state-ben van tárolva (`value={email}`)
> - **Uncontrolled**: Az input saját DOM state-jét használja
> - Mi controlled input-okat használunk, mert így könnyebb validálni és kezelni

### Tesztelés

Most próbáld ki a login form-ot:

1. **Hibás esetek tesztelése:**

   - Hagyd üresen az email mezőt → "Az email cím kötelező"
   - Írj be érvénytelen emailt (pl. "test") → "Érvénytelen email formátum"
   - Hagyd üresen a jelszó mezőt → "A jelszó kötelező"
   - Írj be rövid jelszót (pl. "123") → "Legalább 6 karakter"

2. **Rossz jelszó tesztelése:**

   ```
   Email: alice@example.com
   Jelszó: wrongpassword
   ```

   → "Hibás email vagy jelszó" üzenet

3. **Sikeres login:**
   ```
   Email: alice@example.com
   Jelszó: password123
   ```
   → Átirányít a dashboard-ra

## 2. lépés - AuthContext létrehozása

Most hozzunk létre az AuthContext-et, amely a mock service-t használja és globális állapotkezelést biztosít.

Hozz létre egy `src/contexts/AuthContext.jsx` fájlt:

```jsx
import { createContext, useState, useContext, useEffect } from "react";
import * as authService from "../services/authService";

// 1. Context létrehozása
const AuthContext = createContext();

// 2. Provider komponens
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Alkalmazás indulásakor ellenőrizzük, van-e mentett token
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  // Login függvény
  const login = async (email, password) => {
    try {
      const { user, token } = await authService.login(email, password);

      // Token és user mentése
      setToken(token);
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { success: true };
    } catch (error) {
      console.error("Login hiba:", error);
      throw error;
    }
  };

  // Register függvény
  const register = async (name, email, password) => {
    try {
      const result = await authService.register(name, email, password);
      return result;
    } catch (error) {
      console.error("Regisztráció hiba:", error);
      throw error;
    }
  };

  // Logout függvény
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout hiba:", error);
    } finally {
      // Token és user törlése
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
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

> [!TIP] > **Az AuthContext három fő részből áll:**
>
> 1. **Context létrehozása** - `createContext()`
> 2. **Provider komponens** - Tartalmazza az állapotot és a műveleteket
> 3. **Custom hook** - `useAuth()` - Kényelmes hozzáférés a Context-hez
>
> **Fontos:** Az AuthContext **NEM** használ `useNavigate`-et! A navigációt a page komponensek kezelik, mert:
>
> - Az AuthProvider az App.jsx-ben wrap-eli a RouterProvider-t
> - Így az AuthContext kívül van a routing context-en
> - A tiszta szeparáció jobb: auth logic ≠ navigation logic

### App.jsx frissítése

Most konfiguráljuk az App.jsx-et, hogy az AuthProvider wrap-elje a RouterProvider-t.

Módosítsd az `src/App.jsx` fájlt:

```jsx
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import authMiddleware from "./middleware/authMiddleware";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import MentorsPage from "./pages/MentorsPage";

// Router konfiguráció objektum-alapú route definíciókkal
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
    loader: authMiddleware,
    children: [
      {
        index: true,
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

> [!NOTE] > **Miért ez a struktúra?**
>
> - `AuthProvider` wrap-eli a `RouterProvider`-t
> - A `RouterProvider` biztosítja a routing context-et (NEM kell BrowserRouter!)
> - Az AuthContext **NEM** használ `useNavigate`-et (kívül van a routing context-en)
> - A page komponensek (LoginPage, Navigation) kezelik a navigációt
> - Ez tiszta szeparációt biztosít: auth logic ≠ navigation logic

## 3. lépés - LoginPage frissítése AuthContext-tel

Most frissítsük a LoginPage-et, hogy az AuthContext-et használja.

Módosítsd a `src/pages/LoginPage.jsx` fájlt:

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

    // Login API hívás (mock service az AuthContext-en keresztül)
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
            Email: alice@example.com vagy john@example.com
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

## 4. lépés - Navigation frissítése

Frissítsük a Navigation komponenst, hogy megjelenítse a bejelentkezett user nevét és kezelje a kijelentkezést.

Módosítsd a `src/components/Navigation.jsx` fájlt:

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

> [!NOTE]
> A `user-greeting` CSS osztály már elő van készítve az `index.css`-ben, nem kell hozzáadni.

## 5. lépés - Dashboard frissítése

Frissítsük a Dashboard-ot, hogy megjelenítse a user adatait az AuthContext-ből.

Módosítsd a `src/pages/DashboardPage.jsx` fájlt:

```jsx
import { useAuth } from "../contexts/AuthContext";

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="page dashboard-page">
      <h1>Dashboard</h1>
      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Üdvözöllek a SkillShare Academy-n, {user?.name}!</h2>
          <p>
            Email: <strong>{user?.email}</strong>
          </p>
          <p>
            Jelenlegi kreditek: <strong>{user?.credits || 0}</strong>
          </p>
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <h3>Beiratkozott kurzusok</h3>
            <p className="stat-number">{user?.enrolledCoursesCount || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Elvégzett fejezetek</h3>
            <p className="stat-number">{user?.completedChaptersCount || 0}</p>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-placeholder">
            <p>
              Kredit gyűjtés grafikon (Chart.js) - 3. modulban implementáljuk
            </p>
          </div>
          <div className="chart-placeholder">
            <p>
              Kurzus előrehaladás grafikon (Chart.js) - 3. modulban
              implementáljuk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
```

## Tesztelés

Most teszteljük le az új hitelesítési rendszert!

### 1. Login tesztelése

1. **Próbálj bejelentkezni hibás jelszóval:**

   ```
   Email: alice@example.com
   Jelszó: wrongpassword
   ```

   → "Hibás email vagy jelszó" üzenet

2. **Jelentkezz be a helyes adatokkal:**

   ```
   Email: alice@example.com
   Jelszó: password123
   ```

3. **Ellenőrizd:**
   - Sikeres bejelentkezés
   - Átirányít a Dashboard-ra
   - A navigációban látszik a neved: "Szia, Alice Johnson!"
   - Látható a Dashboard, Kurzusok, Mentorok link
   - A Dashboard megjelenít a user adatokat (név, email, kreditek: 150)

### 2. Protected Routes tesztelése

1. **Nyiss egy új inkognito ablakot**
2. **Próbáld közvetlenül megnyitni:** `http://localhost:5173/dashboard`
3. **Ellenőrizd:**
   - Átirányít a login oldalra (nincs token)

### 3. Logout tesztelése

1. **Bejelentkezett állapotban kattints a "Kijelentkezés" gombra**
2. **Erősítsd meg a dialógusban**
3. **Ellenőrizd:**
   - Átirányít a login oldalra
   - Ha megpróbálod megnyitni a `/dashboard`-ot, visszairányít a login-ra

### 4. Token perzisztencia tesztelése

1. **Jelentkezz be**
2. **Frissítsd az oldalt (F5)**
3. **Ellenőrizd:**

   - Marad bejelentkezve
   - Nem irányít vissza a login oldalra
   - A Dashboard továbbra is látható

4. **Nyisd meg a DevTools-t (F12) → Application → Local Storage**
5. **Ellenőrizd:**

   - Látható a `token` kulcs az értékkel
   - Látható a `user` kulcs JSON formátumban

6. **Töröld a tokent a Local Storage-ból**
7. **Frissítsd az oldalt**
8. **Ellenőrizd:**
   - Kijelentkezik
   - Átirányít a login oldalra

### 5. Mock user-ek tesztelése

A mock service-ben két előre létező user van:

```
Email: alice@example.com
Név: Alice Johnson
Jelszó: password123
Kreditek: 150

Email: john@example.com
Név: John Doe
Jelszó: password123
Kreditek: 200
```

Próbálj meg mindkettővel bejelentkezni és ellenőrizd, hogy különböző adatokat jelenít meg!

## Hibakeresés

Ha valami nem működik:

**1. Konzol hibák ellenőrzése:**

- Nyisd meg a DevTools-t (F12) → Console
- Nézd meg, van-e hibaüzenet

**2. Gyakori hibák:**

❌ **"useAuth must be used within AuthProvider"**  
→ Az AuthProvider nincs elhelyezve az App.jsx-ben (wrap-elnie kell a RouterProvider-t)

❌ **"Cannot read property 'name' of null"**  
→ A user még null, használj optional chaining-et: `user?.name`

❌ **"useNavigate must be called inside a Router"**  
→ A navigáció a page komponensekben történik (nem az AuthContext-ben!)

❌ **"Login nem működik"**  
→ Ellenőrizd a konzolt, nézd meg a mock service-t, és hogy a navigáció a komponensben van-e

## Összefoglalás

Ebben a modulban elkészítetted:

✅ **LoginPage form** - Controlled inputs, validációval és hibakezeléssel  
✅ **AuthContext** - Globális hitelesítési állapotkezelés  
✅ **useAuth hook** - Kényelmes hozzáférés az auth funkciókhoz  
✅ **Token management** - localStorage használat  
✅ **Navigation update** - User név megjelenítése, logout kezelés  
✅ **Dashboard update** - User-specific adatok megjelenítése  
✅ **Persistent sessions** - Token perzisztencia  
✅ **User-friendly error messages** - Professzionális hibakezelés

### Következő lépések (3. modul)

A következő modulban fogjuk:

- **Lecserélni a mock service-t valódi API hívásokra**
- Implementálni a teljes API integrációt (courses, chapters, mentors)
- Chart.js diagramokat készíteni
- LinkedIn share widget-et integrálni
- Real-time polling-ot implementálni (mentor foglalások)

> [!NOTE]
> Nagyszerű munkát végeztél! A következő modulban lecseréljük a mock service-t valódi API hívásokra!
