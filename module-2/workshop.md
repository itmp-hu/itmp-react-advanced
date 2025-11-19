# 2. modul workshop - Komponensek és állapotkezelés

- AuthContext implementálása
- Custom hooks készítése (useAuth)
- Login és regisztrációs formok validációval
- API integráció (login, register endpoints)
- Token kezelés localStorage-ban
- Hibakezelés és hibaüzenetek

> [!NOTE]  
> **Feladat:**  
> Implementálj egy működő hitelesítési rendszert Context API és custom hooks használatával. Készíts form validációt, integráld a backend API-t, és kezelj hibákat user-friendly módon. A modul végére teljesen működő login/register rendszerrel kell rendelkezned, amely globális állapotkezelést használ.

<hr />

## Előkészületek

### Kiindulási állapot ellenőrzése

Győződj meg róla, hogy az 1. modul befejezett állapotában vagy:

✅ React Router telepítve és működik  
✅ 6 oldal komponens létrehozva  
✅ Layout és Navigation komponensek működnek  
✅ Protected Route implementálva  
✅ Alap CSS stílusok működnek  

Ha bármelyik hiányzik, térj vissza a `module-1-solution` branchhez:

```bash
git checkout module-1-solution
```

### Backend ellenőrzése

Ellenőrizd, hogy a backend API fut-e:

```bash
# Böngészőben nyisd meg:
http://localhost:5000/api/v1/health
```

Ha nem működik:

```bash
cd assets/backend-solution
docker compose up -d
```

## 1. lépés - AuthContext létrehozása

Az AuthContext fogja tárolni a hitelesítési állapotot (user, token) és a hitelesítéssel kapcsolatos műveleteket (login, logout, register).

### AuthContext fájl létrehozása

Hozz létre egy `src/contexts/AuthContext.jsx` fájlt:

```jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Context létrehozása
const AuthContext = createContext();

// 2. Provider komponens
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Alkalmazás indulásakor ellenőrizzük, van-e mentett token
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // User adatok betöltése a tokennel
      fetchUserData(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // User adatok lekérése
  const fetchUserData = async (authToken) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/users/me', {
        headers: {
          'X-API-Key': authToken
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token érvénytelen, töröljük
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Hiba a user adatok betöltésekor:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Login függvény
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Hibás email vagy jelszó');
        }
        throw new Error('Hiba a bejelentkezés során');
      }

      const data = await response.json();
      
      // Token és user mentése
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);

      // Átirányítás a dashboard-ra
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      console.error('Login hiba:', error);
      throw error;
    }
  };

  // Register függvény
  const register = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Ez az email cím már használatban van');
        }
        throw new Error('Hiba a regisztráció során');
      }

      const data = await response.json();
      
      // Regisztráció után átirányítás a login oldalra
      navigate('/login');
      
      return { success: true, message: 'Sikeres regisztráció! Most már bejelentkezhetsz.' };
    } catch (error) {
      console.error('Regisztráció hiba:', error);
      throw error;
    }
  };

  // Logout függvény
  const logout = async () => {
    try {
      // Opcionális: logout API hívás
      if (token) {
        await fetch('http://localhost:5000/api/v1/users/logout', {
          method: 'POST',
          headers: {
            'X-API-Key': token
          }
        });
      }
    } catch (error) {
      console.error('Logout hiba:', error);
    } finally {
      // Token és user törlése
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook a Context használatához
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
```

> [!TIP]
> Az AuthContext három fő részből áll:
> 1. **Context létrehozása** - createContext()
> 2. **Provider komponens** - Tartalmazza az állapotot és a műveleteket
> 3. **Custom hook** - Kényelmes hozzáférés a Context-hez

### AuthProvider beállítása

Módosítsd az `src/main.jsx` fájlt:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

> [!NOTE]
> Az AuthProvider-t a BrowserRouter-en belül kell elhelyezni, mert a useNavigate hook-ot használja!

## 2. lépés - Login oldal működővé tétele

Most frissítsük a LoginPage komponenst, hogy használja az AuthContext-et.

Módosítsd a `src/pages/LoginPage.jsx` fájlt:

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Ha már be van jelentkezve, irányítsuk a dashboard-ra
  useState(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Form mező változás kezelése
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Töröljük a hibaüzenetet, ha a user módosítja a mezőt
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Form validáció
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Az email cím kötelező';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Érvénytelen email formátum';
    }

    if (!formData.password) {
      newErrors.password = 'A jelszó kötelező';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A jelszónak legalább 6 karakter hosszúnak kell lennie';
    }

    return newErrors;
  };

  // Form elküldés
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Validáció
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Login API hívás
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      // A navigate már az AuthContext-ben van kezelve
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

        {serverError && (
          <div className="alert alert-error">
            {serverError}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              placeholder="email@példa.hu"
              disabled={loading}
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              placeholder="Jelszó"
              disabled={loading}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>
        </form>

        <p className="register-link">
          Még nincs fiókod? <Link to="/register">Regisztrálj ingyen!</Link>
        </p>
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

## 3. lépés - Registration oldal működővé tétele

Módosítsd a `src/pages/RegisterPage.jsx` fájlt:

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Ha már be van jelentkezve, irányítsuk a dashboard-ra
  if (isAuthenticated) {
    navigate('/dashboard');
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Töröljük a hibaüzenetet
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'A név kötelező';
    } else if (formData.name.length < 3) {
      newErrors.name = 'A névnek legalább 3 karakter hosszúnak kell lennie';
    }

    if (!formData.email) {
      newErrors.email = 'Az email cím kötelező';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Érvénytelen email formátum';
    }

    if (!formData.password) {
      newErrors.password = 'A jelszó kötelező';
    } else if (formData.password.length < 8) {
      newErrors.password = 'A jelszónak legalább 8 karakter hosszúnak kell lennie';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'A jelszó megerősítése kötelező';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'A két jelszó nem egyezik';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    // Validáció
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Register API hívás
    setLoading(true);
    try {
      const result = await register(formData.name, formData.email, formData.password);
      setSuccessMessage(result.message);
      // 2 másodperc után átirányítás
      setTimeout(() => {
        navigate('/login');
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

        {serverError && (
          <div className="alert alert-error">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Teljes név</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
              placeholder="Kovács János"
              disabled={loading}
            />
            {errors.name && (
              <span className="error-text">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              placeholder="email@példa.hu"
              disabled={loading}
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
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
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'input-error' : ''}
              placeholder="Jelszó újra"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Regisztráció...' : 'Regisztráció'}
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

## 4. lépés - Navigation frissítése

Frissítsük a Navigation komponenst, hogy az AuthContext-et használja:

Módosítsd a `src/components/Navigation.jsx` fájlt:

```jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Biztosan ki szeretnél jelentkezni?')) {
      logout();
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>SkillShare Academy</h2>
      </div>
      
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <span className="user-greeting">
              Szia, {user?.name || 'Felhasználó'}!
            </span>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/courses" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Kurzusok
            </NavLink>
            <NavLink 
              to="/mentors" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
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
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Bejelentkezés
            </NavLink>
            <NavLink 
              to="/register" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
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

Add hozzá az `src/index.css`-hez:

```css
/* User greeting */
.user-greeting {
  color: var(--text-color);
  font-weight: 500;
  padding: 0.5rem 1rem;
}
```

## 5. lépés - ProtectedRoute frissítése

Frissítsük a ProtectedRoute-ot, hogy az AuthContext loading állapotát kezelje:

Módosítsd a `src/components/ProtectedRoute.jsx` fájlt:

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  // Loading állapot kezelése
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Betöltés...</p>
      </div>
    );
  }
  
  // Ha nincs bejelentkezve, irányítsuk a login oldalra
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Ha be van jelentkezve, jelenítsd meg az oldalt
  return children;
}

export default ProtectedRoute;
```

Loading spinner stílus hozzáadása az `src/index.css`-hez:

```css
/* Loading spinner */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

## 6. lépés - Dashboard frissítése

Frissítsük a Dashboard-ot, hogy megjelenítse a user adatait:

Módosítsd a `src/pages/DashboardPage.jsx` fájlt:

```jsx
import { useAuth } from '../contexts/AuthContext';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="page dashboard-page">
      <h1>Dashboard</h1>
      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Üdvözöllek a SkillShare Academy-n, {user?.name}!</h2>
          <p>Email: <strong>{user?.email}</strong></p>
          <p>Jelenlegi kreditek: <strong>{user?.credits || 0}</strong></p>
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
            <p>Kredit gyűjtés grafikon (Chart.js) - 3. modulban implementáljuk</p>
          </div>
          <div className="chart-placeholder">
            <p>Kurzus előrehaladás grafikon (Chart.js) - 3. modulban implementáljuk</p>
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
   Email: test@example.com
   Jelszó: wrongpassword
   ```
   → "Hibás email vagy jelszó" üzenet

2. **Jelentkezz be a helyes adatokkal:**
   ```
   Email: test@example.com
   Jelszó: password123
   ```

3. **Ellenőrizd:**
   - Sikeres bejelentkezés
   - Átirányít a Dashboard-ra
   - A navigációban látszik a neved: "Szia, Teszt Felhasználó!"
   - Látható a Dashboard, Kurzusok, Mentorok link
   - A Dashboard megjelenít i a user adatokat

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

6. **Töröld a tokent a Local Storage-ból**
7. **Frissítsd az oldalt**
8. **Ellenőrizd:**
   - Kijelentkezik
   - Átirányít a login oldalra

### 6. Adatbázisban létező user tesztelése

A backend adatbázisában előre léteznek userek (jelszó mindenhol: `password123`):

```
Email: john.doe@skillshare.com
Jelszó: password123
```

Próbálj meg ezzel bejelentkezni és ellenőrizd, hogy működik!

## Hibakeresés

Ha valami nem működik:

**1. Konzol hibák ellenőrzése:**
- Nyisd meg a DevTools-t (F12) → Console
- Nézd meg, van-e hibaüzenet

**2. Network tab ellenőrzése:**
- DevTools (F12) → Network
- Nézd meg a login/register API hívásokat
- Ellenőrizd a status code-ot és a response-t

**3. Gyakori hibák:**

❌ **"useAuth must be used within AuthProvider"**  
→ Az AuthProvider nincs elhelyezve a main.jsx-ben

❌ **"Cannot read property 'name' of null"**  
→ A user még null, használj optional chaining-et: `user?.name`

❌ **"Failed to fetch"**  
→ A backend nem fut, indítsd el: `docker compose up -d`

❌ **"401 Unauthorized" minden kérésnél**  
→ A token nem kerül elküldésre, ellenőrizd az X-API-Key header-t

## Összefoglalás

Ebben a modulban elkészítetted:

✅ **AuthContext** - Globális hitelesítési állapotkezelés  
✅ **useAuth hook** - Kényelmes hozzáférés az auth funkciókhhoz  
✅ **Login form** - Validációval és hibakezeléssel  
✅ **Register form** - Komplex validációval (jelszó egyezés)  
✅ **Token management** - localStorage használat  
✅ **Protected Routes** - Loading state kezeléssel  
✅ **User-friendly error messages** - Professzionális hibakezelés  
✅ **Persistent sessions** - Token perzisztencia  

### Következő lépések (3. modul)

A következő modulban fogjuk:
- Implementálni a teljes API integrációt (courses, chapters, mentors)
- Chart.js diagramokat készíteni
- LinkedIn share widget-et integrálni
- Real-time polling-ot implementálni (mentor foglalások)
- Loading states-eket hozzáadni
- Teljes alkalmazást befejezni

## Kiegészítő feladatok (ha van időd)

1. **Remember Me funkció:**
   - Adj hozzá egy checkbox-ot a login form-hoz
   - Ha be van pipálva, mentsd el az emailt is a localStorage-ba

2. **Password strength indicator:**
   - Adj hozzá egy vizuális jelzőt a regisztrációs formhoz
   - Mutasd, hogy mennyire erős a jelszó (gyenge/közepes/erős)

3. **Email verification üzenet:**
   - A regisztráció után mutass egy szép üzenetet, hogy "Ellenőrizd az email-edet"

4. **Forgot password link:**
   - Adj hozzá egy "Elfelejtetted a jelszavad?" linket a login oldalhoz

> [!NOTE]
> Nagyszerű munkát végeztél! A következő modulban befejezzük az alkalmazást API integrációval és Chart.js diagramokkal!

