# 2. modul workshop - Komponensek és állapotkezelés

- Mocked Auth Service létrehozása
- Controlled formok és validáció
- AuthContext implementálása
- Custom hooks készítése (useAuth)
- Login és regisztrációs formok validációval
- Token kezelés localStorage-ban
- Hibakezelés és hibaüzenetek

> [!NOTE]  
> **Feladat:**  
> Implementálj egy működő hitelesítési rendszert Context API és custom hooks használatával. Készíts form validációt, mock auth service-t, és kezelj hibákat user-friendly módon. A modul végére teljesen működő login/register rendszerrel kell rendelkezned, amely globális állapotkezelést használ. A következő modulban fogjuk bevezetni a valódi API integrációt.

<hr />

## Előkészületek

### Kiindulási állapot

A kiindulási állapot az előző modul befejeztő állapota lesz. A saját megoldásod helyett célszerű a `module-1/workshop-solution` mappába levő projekttel dolgoznod.

Győződj meg róla, hogy az 1. modul befejezett állapotában vagy:

✅ React Router telepítve és működik  
✅ 6 oldal komponens létrehozva  
✅ Layout és Navigation komponensek működnek  
✅ Protected Route implementálva  
✅ Alap CSS stílusok működnek

> [!NOTE]
> Ebben a modulban **NEM** fogjuk használni a backend API-t. Helyette mock (állapított) szolgáltatásokat fogunk létrehozni a `services/authService.js` fájlban. A valódi API integrációt a 3. modulban fogjuk megvalósítani.

## 1. lépés - Mock Auth Service létrehozása

Először hozzunk létre egy mock auth service-t, amely szimulálja a backend működését. Ez lehetővé teszi, hogy a frontend funkciókat teszteljük API nélkül.

### authService.js fájl létrehozása

Hozz létre egy `src/services/authService.js` fájlt:

```javascript
// Mock user adatbázis (normális esetben ez a backend-en lenne)
const MOCK_USERS = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "password123",
    credits: 150,
    enrolledCoursesCount: 3,
    completedChaptersCount: 12,
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    credits: 200,
    enrolledCoursesCount: 5,
    completedChaptersCount: 25,
  },
];

// Simulált késleltetés (mintha hálózati kérés lenne)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Login függvény - szimulálja a backend login endpoint-ot
export const login = async (email, password) => {
  await delay(800); // Szimuláljuk a hálózati késleltetést

  // Keressük meg a usert
  const user = MOCK_USERS.find((u) => u.email === email);

  // Ha nincs ilyen user
  if (!user) {
    throw new Error("Hibás email vagy jelszó");
  }

  // Ha rossz a jelszó
  if (user.password !== password) {
    throw new Error("Hibás email vagy jelszó");
  }

  // Generálunk egy mock tokent
  const token = `mock-token-${user.id}-${Date.now()}`;

  // Visszaadjuk a user adatokat (jelszó nélkül) és a tokent
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token: token,
  };
};

// Register függvény - szimulálja a backend register endpoint-ot
export const register = async (name, email, password) => {
  await delay(800); // Szimuláljuk a hálózati késleltetést

  // Ellenőrizzük, hogy létezik-e már ilyen email
  const existingUser = MOCK_USERS.find((u) => u.email === email);

  if (existingUser) {
    throw new Error("Ez az email cím már használatban van");
  }

  // Új user létrehozása
  const newUser = {
    id: MOCK_USERS.length + 1,
    name,
    email,
    password,
    credits: 100, // Kezdő kreditek
    enrolledCoursesCount: 0,
    completedChaptersCount: 0,
  };

  // Mock adatbázishoz hozzáadjuk
  MOCK_USERS.push(newUser);

  return {
    success: true,
    message: "Sikeres regisztráció! Most már bejelentkezhetsz.",
  };
};

// Get user by token - szimulálja a backend /users/me endpoint-ot
export const getUserByToken = async (token) => {
  await delay(500);

  // Token formátum: mock-token-{userId}-{timestamp}
  const userId = parseInt(token.split("-")[2]);

  const user = MOCK_USERS.find((u) => u.id === userId);

  if (!user) {
    throw new Error("Érvénytelen token");
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Logout függvény - szimulálja a backend logout endpoint-ot
export const logout = async () => {
  await delay(300);
  // Mock logout - nincs mit csinálni, a frontend törli a tokent
  return { success: true };
};
```

> [!TIP] > **Miért használunk mock service-t?**
>
> - **Fejlesztési sebesség**: Nem kell várni a backend készültségére
> - **Tesztelhetőség**: Könnyebb tesztelni különböző eseteket
> - **Offline fejlesztés**: Működik internet nélkül is
> - **Fokozatos átmenet**: Később egyszerűen lecserélhető valódi API-ra

## 2. lépés - LoginPage form validáció

Most frissítsük a LoginPage komponenst, hogy controlled form-ot használjon validációval, és integráljuk a mock auth service-t.

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

### Hibakezelő stílusok hozzáadása

Add hozzá az `src/index.css` fájl végéhez:

```css
/* Error styling */
.input-error {
  border-color: var(--danger-color) !important;
}

.error-text {
  display: block;
  color: var(--danger-color);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.alert-error {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
}

.alert-success {
  background-color: #d1fae5;
  border: 1px solid #10b981;
  color: #065f46;
}
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

## 3. lépés - RegisterPage implementálása

Módosítsd a `src/pages/RegisterPage.jsx` fájlt:

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { register } from "../services/authService";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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

    // Register API hívás (mock service)
    setLoading(true);
    try {
      const result = await register(name, email, password);
      setSuccessMessage(result.message);
      // 2 másodperc után átirányítás
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page register-page">
      <div className="register-container">
        <h1>Regisztráció</h1>
        <p>Ingyenes regisztráció</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Teljes név</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: "" }));
                }
              }}
              className={errors.name ? "input-error" : ""}
              placeholder="Kovács János"
              disabled={loading}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

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
              placeholder="Legalább 8 karakter"
              disabled={loading}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Jelszó megerősítése</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }
              }}
              className={errors.confirmPassword ? "input-error" : ""}
              placeholder="Jelszó újra"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
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

## 4. lépés - AuthContext létrehozása

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

### Main.jsx egyszerűsítése

Módosítsd az `src/main.jsx` fájlt - NEM kell BrowserRouter:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

> [!NOTE]
> A Data Router mintával **NEM** használunk `BrowserRouter`-t a main.jsx-ben. A routing context-et a `RouterProvider` biztosítja.

### App.jsx és AuthProvider beállítása

Most konfiguráljuk az App.jsx-et a Data Router mintával és AuthProvider-rel.

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
    middleware: [authMiddleware],
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
> - A page komponensek (LoginPage, RegisterPage, Navigation) kezelik a navigációt
> - Ez tiszta szeparációt biztosít: auth logic ≠ navigation logic

## 5. lépés - Login és Register oldalak frissítése AuthContext-tel

Most frissítsük a Login és Register oldalakat, hogy az AuthContext-et használják.

### LoginPage frissítése

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

### RegisterPage frissítése

Módosítsd a `src/pages/RegisterPage.jsx` fájlt:

- Importáld a `useAuth`-ot az AuthContext-ből
- A `register` függvény már az AuthContext-ből jön
- **Fontos:** A `handleSubmit`-ben a `navigate("/login")` hívást BENT kell hagyni, mert a regisztráció után a komponens kezeli a navigációt (nem az AuthContext)!

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function RegisterPage() {
  // ... (state-ek)

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Ha már be van jelentkezve, irányítsuk a dashboard-ra
  if (isAuthenticated) {
    navigate("/dashboard");
  }

  // ... (validateForm)

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (validáció)

    setLoading(true);
    try {
      const result = await register(name, email, password);
      setSuccessMessage(result.message);
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

  // ... (JSX return)
}
```

## 6. lépés - User név megjelenítése Dashboard és Courses oldalon

### Navigation frissítése

Frissítsük a Navigation komponenst, hogy megjelenítse a bejelentkezett user nevét:

Módosítsd a `src/components/Navigation.jsx` fájlt:

```jsx
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
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

Add hozzá az `src/index.css`-hez:

```css
/* User greeting */
.user-greeting {
  color: var(--text-color);
  font-weight: 500;
  padding: 0.5rem 1rem;
}
```

### DashboardPage frissítése

Frissítsük a Dashboard-ot, hogy megjelenítse a user adatait:

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

### CoursesPage frissítése

Módosítsd a `src/pages/CoursesPage.jsx` fájlt, hogy megjelenítse a user nevét:

```jsx
import { useAuth } from "../contexts/AuthContext";

function CoursesPage() {
  const { user } = useAuth();

  return (
    <div className="page courses-page">
      <h1>Kurzusok</h1>

      <p style={{ marginBottom: "2rem", color: "var(--secondary-color)" }}>
        Helló {user?.name}! Itt láthatod az elérhető kurzusokat.
      </p>

      <div className="courses-filters">
        <input type="text" placeholder="Keresés..." />
        <select>
          <option>Minden kategória</option>
          <option>Frontend</option>
          <option>Backend</option>
          <option>DevOps</option>
        </select>
      </div>

      <div className="courses-grid">
        <div className="course-card">
          <h3>React alapok</h3>
          <p>Tanuld meg a React alapjait</p>
          <div className="course-meta">
            <span>12 fejezet</span>
            <span>6 óra</span>
          </div>
          <button className="btn btn-primary">Részletek</button>
        </div>

        <div className="course-card">
          <h3>Node.js haladó</h3>
          <p>Haladó backend fejlesztés</p>
          <div className="course-meta">
            <span>15 fejezet</span>
            <span>8 óra</span>
          </div>
          <button className="btn btn-primary">Részletek</button>
        </div>

        <div className="course-card">
          <h3>TypeScript mesteri szint</h3>
          <p>Típusbiztos kód írása</p>
          <div className="course-meta">
            <span>10 fejezet</span>
            <span>5 óra</span>
          </div>
          <button className="btn btn-primary">Részletek</button>
        </div>
      </div>
    </div>
  );
}

export default CoursesPage;
```

## Tesztelés

Most teszteljük le az új hitelesítési rendszert!

### 1. Regisztráció tesztelése

1. **Nyisd meg a böngészőt:** `http://localhost:5173`
2. **Kattints a "Regisztráció" linkre**
3. **Próbálj regisztrálni hibás adatokkal:**

   - Hagyd üresen a név mezőt → "A név kötelező"
   - Adj meg érvénytelen emailt → "Érvénytelen email formátum"
   - Adj meg rövid jelszót → "A jelszónak legalább 8 karakter hosszúnak kell lennie"
   - Különböző jelszavak → "A két jelszó nem egyezik"

4. **Végezz sikeres regisztrációt:**

   ```
   Név: Teszt Felhasználó
   Email: test@example.com
   Jelszó: password123
   Jelszó megerősítés: password123
   ```

5. **Ellenőrizd:**
   - Sikeres üzenet jelenik meg
   - 2 másodperc után átirányít a login oldalra

### 2. Login tesztelése

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
   - A Dashboard megjelenít a user adatokat (név, email, kreditek)
   - A Kurzusok oldalon is látszik a neved

### 3. Protected Routes tesztelése

1. **Nyiss egy új inkognito ablakot**
2. **Próbáld közvetlenül megnyitni:** `http://localhost:5173/dashboard`
3. **Ellenőrizd:**
   - Átirányít a login oldalra (nincs token)

### 4. Logout tesztelése

1. **Bejelentkezett állapotban kattints a "Kijelentkezés" gombra**
2. **Erősítsd meg a dialógusban**
3. **Ellenőrizd:**
   - Átirányít a login oldalra
   - A navigáció csak a Login és Regisztráció linkeket mutatja
   - Ha megpróbálod megnyitni a `/dashboard`-ot, visszairányít a login-ra

### 5. Token perzisztencia tesztelése

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

### 6. Mock user-ek tesztelése

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

✅ **Mock Auth Service** - Szimulálja a backend viselkedését  
✅ **Controlled formok** - Validációval és hibakezeléssel  
✅ **AuthContext** - Globális hitelesítési állapotkezelés  
✅ **useAuth hook** - Kényelmes hozzáférés az auth funkciókhoz  
✅ **Login form** - Validációval és hibakezeléssel  
✅ **Register form** - Komplex validációval (jelszó egyezés)  
✅ **Token management** - localStorage használat  
✅ **Protected Routes** - Loading state kezeléssel  
✅ **User-friendly error messages** - Professzionális hibakezelés  
✅ **Persistent sessions** - Token perzisztencia  
✅ **User name display** - Dashboard és Courses oldalon

### Következő lépések (3. modul)

A következő modulban fogjuk:

- **Lecserélni a mock service-t valódi API hívásokra**
- Implementálni a teljes API integrációt (courses, chapters, mentors)
- Chart.js diagramokat készíteni
- LinkedIn share widget-et integrálni
- Real-time polling-ot implementálni (mentor foglalások)
- Loading states-eket hozzáadni
- Teljes alkalmazást befejezni

> [!NOTE] > **Miért előbb mock, aztán API?**
>
> 1. **Párhuzamos fejlesztés**: Frontend és backend egymástól függetlenül fejleszthető
> 2. **Gyors iteráció**: Nem kell várni a backend készültségére
> 3. **Egyszerű átállás**: A 3. modulban csak a service réteget kell lecserélni
> 4. **Jobb architektúra**: Tiszta szeparáció a service és UI rétegek között

## Kiegészítő feladatok (ha van időd)

1. **Remember Me funkció:**

   - Adj hozzá egy checkbox-ot a login form-hoz
   - Ha be van pipálva, mentsd el az emailt is a localStorage-ba

2. **Password strength indicator:**

   - Adj hozzá egy vizuális jelzőt a regisztrációs formhoz
   - Mutasd, hogy mennyire erős a jelszó (gyenge/közepes/erős)

3. **Email verification üzenet:**

   - A regisztráció után mutass egy szép üzenetet, hogy "Ellenőrizd az email-edet"

4. **Több mock user hozzáadása:**
   - Adj hozzá több usert különböző kreditekkel és statisztikákkal
   - Teszteld az alkalmazást különböző user-ekkel

> [!NOTE]
> Nagyszerű munkát végeztél! A következő modulban lecseréljük a mock service-t valódi API hívásokra és befejezzük az alkalmazást!
