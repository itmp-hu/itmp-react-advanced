# 1. modul workshop (Rövid verzió) - Routing és Middleware implementálás

**Időigény:** ~45-60 perc

## Áttekintés

Ebben a rövid gyakorlatban egy félig kész SkillShare Academy alkalmazásba fogod implementálni az alábbiakat:

1. **MentorsPage komponens** - mentor foglalási oldal
2. **Data Router konfiguráció** - React Router beállítás (még védelem nélkül)
3. **Navigation komponens** - navigációs menü
4. **Layout frissítés** - Navigation hozzáadása és Outlet használata
5. **authMiddleware** - védett route-ok middleware-alapú védelme
6. **Átirányítások** - login/register oldalakról dashboard-ra (ha már be van jelentkezve)

### Mit kapsz kiindulásként?

- ✅ Telepített Vite + React projekt
- ✅ Összes oldal komponens **KIVÉVE** a MentorsPage
- ✅ Layout komponens (üres `<header>` taggel, még nincs Navigation)
- ✅ Teljes CSS stílusok
- ✅ Projekt struktúra
- ✅ App.jsx létezik, de csak egy statikus oldalt renderel
- ✅ main.jsx tartalmazza az összes oldalt, de csak egy van uncommentálva
- ❌ **NINCS** routing (React Router nincs konfigurálva)
- ❌ **NINCS** Navigation komponens
- ❌ **NINCS** middleware
- ❌ **NINCS** MentorsPage

---

## Előkészületek

### 1. Kiinduló projekt ellenőrzése

1. Nyisd meg a kiinduló projektet (később fogjuk létrehozni)
2. Telepítsd a függőségeket:

```bash
npm install
```

3. Indítsd el a dev szervert:

```bash
npm run dev
```

4. Nyisd meg: `http://localhost:5173`

> [!NOTE]
> Jelenleg csak a Dashboard oldak jelenik meg. A main.jsx-ben az összes többi oldal ki van kommentezve. Az App.jsx csak egy statikus komponenst renderel. Később ezeket routing-gal fogjuk helyettesíteni!

### 2. Projekt struktúra áttekintése

```
src/
├── components/
│   └── Layout.jsx          ✅ Kész (üres <header>, nincs Navigation!)
├── pages/
│   ├── LoginPage.jsx       ✅ Kész
│   ├── RegisterPage.jsx    ✅ Kész
│   ├── DashboardPage.jsx   ✅ Kész
│   ├── CoursesPage.jsx     ✅ Kész
│   ├── CourseDetailsPage.jsx ✅ Kész
│   └── MentorsPage.jsx     ❌ HIÁNYZIK - Te fogod megírni!
├── middleware/              ❌ Üres mappa - Te fogod implementálni!
├── contexts/                ⏭️ Később (2. modul)
├── hooks/                   ⏭️ Később (2. modul)
├── services/                ⏭️ Később (2. modul)
├── App.jsx                  ⚠️ Statikus oldal - Te fogod átírni!
├── main.jsx                 ⚠️ Oldalak felsorolása - Te fogod átírni Outlet-re!
└── index.css                ✅ Kész
```

---

## Feladat 1 - MentorsPage implementálása

Kezdjük valami egyszerűvel! Implementálnod kell a hiányzó MentorsPage komponenst.

### Hozd létre a MentorsPage.jsx fájlt

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

> [!TIP]
> A stílusok már készen vannak az `index.css` fájlban, így ez az oldal szépen fog kinézni!

Teszteld az oldalt! Importáld a `MentorsPage` komponenst az `App.jsx`-be, add hozzá a komponenst a `main` részhez, a `Dashboard` komponenst pedig kommenteld ki.

---

## Feladat 2 - Data Router konfiguráció (védelem nélkül)

Most implementáljuk a React Router v7 Data Router-t. Először védelem nélkül, hogy lássuk, hogyan működik!

### React Router telepítése

```bash
npm install react-router
```

### App.jsx teljes átírása

Cseréld le az **EGÉSZ App.jsx tartalmát** erre:

```jsx
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import Layout from "./components/Layout";
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

  // Védett route-ok (Layout-tal) - MÉG NINCS MIDDLEWARE!
  {
    path: "/",
    element: <Layout />,
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
  return <RouterProvider router={router} />;
}

export default App;

```

### Layout.jsx frissítése az Outlet komponenssel

Cseréljük ki a `{{children}}`-t az `Outlet` komponensre, hogy a routingnak megfelelő komponens rendelerőldjön ki.

```jsx

import { Outlet } from "react-router";
function Layout() {
  return (
    <div className="layout">
      <header>Navigation</header>
      <main className="main-content"><Outlet /></main>
      <footer className="footer">
        <p>&copy; 2025 SkillShare Academy. Minden jog fenntartva.</p>
      </footer>
    </div>
  );
}

export default Layout;

```



> [!NOTE]
> Figyeld meg, hogy most még **NINCS** `middleware: [authMiddleware]` a védett route-okon! Ezt később fogjuk hozzáadni.

> [!TIP]
> Most már működik a routing, de még nincs navigáció és védelem sem! A routingot tesztelhetjük pl. a `/login` és a `/mentors` címeken.

---

## Feladat 3 - Navigation komponens implementálása

Most hozzuk létre a Navigation komponenst, amely a fejléc navigációs menüje lesz.

### Hozd létre a Navigation.jsx fájlt

Hozz létre egy `src/components/Navigation.jsx` fájlt az alábbi tartalommal:

```jsx
import { NavLink, useNavigate } from "react-router";

function Navigation() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>SkillShare Academy</h2>
      </div>

      <div className="nav-links">
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
> Most már megvan a Navigation komponens! De még nincs beépítve a Layout-ba.

---

## Feladat 4 - Layout és main.jsx frissítése

Most integráljuk a Navigation-t a Layout-ba, és cseréljük le a main.jsx statikus oldalát az Outlet használatára.

### Layout komponens frissítése

Nyisd meg a `src/components/Layout.jsx` fájlt. A kiindulási pont így néz ki:

```jsx
import { Outlet } from "react-router";

function Layout() {
  return (
    <div className="layout">
      <header>{/* Itt lesz a Navigation */}</header>

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

**Frissítsd a Layout.jsx fájlt:**

1. Add hozzá az import-ot:

```jsx
import Navigation from "./Navigation";
```

2. Cseréld le a `<header>` részt:

```jsx
<header>
  <Navigation />
</header>
```

A teljes Layout.jsx fájl most így néz ki:

```jsx
import { Outlet } from "react-router";
import Navigation from "./Navigation";

function Layout() {
  return (
    <div className="layout">
      <header>
        <Navigation />
      </header>

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
> Az `Outlet` komponens a React Router speciális komponense, amely a gyermek route-okat (children) jeleníti meg.

### Teszteld az alkalmazást!

Most már működnie kell a navigációnak! Próbáld ki:

1. Nyisd meg: `http://localhost:5173`
2. Átirányít a dashboard-ra
3. Most már látod a navigációt!
4. Kattints a "Kurzusok" és "Mentorok" linkekre - működik a routing!

> [!NOTE]
> Figyeld meg, hogy minden oldal elérhető, még védelem nélkül is! A következő lépésben fogjuk védeni a route-okat.

---

## Feladat 5 - authMiddleware implementálása

Most védjük le a route-okat middleware segítségével! A middleware a React Router v7 egyik legerősebb funkciója - a komponens renderelése ELŐTT fut le.

### Hozd létre az authMiddleware.js fájlt

Hozz létre egy `src/middleware/authMiddleware.js` fájlt:

```js
import { redirect } from "react-router";

/**
 * Middleware a hitelesítés ellenőrzésére
 * Ha nincs token, átirányít a login oldalra
 */
async function authMiddleware({ request }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Ha nincs token, irányítsuk a login oldalra
    throw redirect("/login");
  }

  // Ha van token, a navigáció folytatódik
  // (Nem kell visszatérési érték)
}

export default authMiddleware;
```

> [!NOTE] > **Miért middleware?**
>
> - ✅ Lefut a komponens renderelése ELŐTT (hatékonyabb)
> - ✅ Központosított hitelesítési logika
> - ✅ Újrafelhasználható több route-on
> - ✅ `throw redirect()` azonnal leállítja a navigációt

### Middleware hozzáadása a routerhez

Most add hozzá a middleware-t az App.jsx-ben a védett route-okhoz!

Nyisd meg az `src/App.jsx` fájlt és:

1. **Add hozzá az import-ot** a fájl elejéhez:

```jsx
import authMiddleware from "./middleware/authMiddleware";
```

2. **Add hozzá a middleware property-t** a védett route-ok parent route-jához:

Keresd meg ezt a részt:

```jsx
// Védett route-ok (Layout-tal) - MÉG NINCS MIDDLEWARE!
{
  path: "/",
  element: <Layout />,
  children: [
```

És változtasd meg erre:

```jsx
// Védett route-ok (Layout-tal)
{
  path: "/",
  element: <Layout />,
  middleware: [authMiddleware], // MINDEN child route védett lesz!
  children: [
```

> [!TIP]
> A `middleware: [authMiddleware]` egy tömb, mert több middleware-t is használhatsz egyszerre (pl. logging, auth, stb.)

### Teszteld a middleware-t!

1. Nyisd meg a böngésző Developer Tools-t (F12) → Application → Local Storage
2. Töröld ki a `token` bejegyzést (ha létezik)
3. Próbáld meg megnyitni: `http://localhost:5173/dashboard`
4. **Várható:** Automatikusan átirányít a `/login` oldalra!
5. Jelentkezz be → most már eléred a védett oldalakat!

> [!NOTE]
> A middleware MINDEN child route-on automatikusan működik! Dashboard, Courses, Mentors - mind védett!

---

## Feladat 6 - Login/Register átirányítás implementálása

Most implementálnod kell az automatikus átirányítást a login és register oldalakon.

### LoginPage módosítása

Nyisd meg az `src/pages/LoginPage.jsx` fájlt és **add hozzá** az alábbi `useEffect`-et:

Az import sorban módosítsd:

```jsx
import { useNavigate } from "react-router";
import { useEffect } from "react";
```

A `navigate` deklaráció után add hozzá:

```jsx
// Ha már be van jelentkezve, irányítsuk át a dashboard-ra
const navigate = useNavigate()
useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    navigate("/dashboard");
  }
}, [navigate]);
```

> [!TIP]
> Ez biztosítja, hogy ha valaki már be van jelentkezve, nem férhet hozzá a login oldalhoz.

A bejelentkezés után irányítsunk át automatikusan a dashboard-ra! Ehhez adjuk hozzá a hadleLogin függvényhez a `navigate("/dashboard")` utasítást:

```jsx
const handleLogin = (e) => {
  e.preventDefault();
  localStorage.setItem("token", "test-token-1234567890");
  navigate("/dashboard");
};
```

### RegisterPage módosítása

Ugyanezt add hozzá a `src/pages/RegisterPage.jsx` fájlhoz is:

Import:

```jsx
import { useNavigate } from "react-router";
import { useEffect } from "react";

const navigate = useNavigate();
useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    navigate("/dashboard");
  }
}, [navigate]);

const handleRegister = (e) => {
  e.preventDefault();
  localStorage.setItem("token", "test-token-1234567890");
  alert("Regisztráltál! (Később itt routing lesz)");
  navigate("/dashboard");
};
```

---

## Tesztelés

Most teszteld az alkalmazást!

### 1. Middleware teszt (védett route-ok)

1. Nyisd meg: `http://localhost:5173`
2. **Várható:** Automatikus átirányítás a `/login` oldalra (mert nincs token)
3. Próbáld meg közvetlenül megnyitni: `http://localhost:5173/dashboard`
4. **Várható:** Ismét átirányít a login-ra (middleware működik!)

### 2. Login teszt

1. A login oldalon kattints a "Bejelentkezés" gombra
2. **Várható:** Átirányít a dashboard-ra és megjelenik a navigáció
3. Most már láthatod a navigációs linkeket: Dashboard, Kurzusok, Mentorok

### 3. Navigáció teszt

1. Kattints a "Kurzusok" linkre
2. **Várható:** Betöltődik a CoursesPage
3. Kattints a "Mentorok" linkre
4. **Várható:** Betöltődik az általad implementált MentorsPage

### 4. Kijelentkezés teszt

1. Kattints a "Kijelentkezés" gombra
2. **Várható:** Törli a tokent és átirányít a login oldalra
3. Próbáld meg újra megnyitni: `http://localhost:5173/dashboard`
4. **Várható:** Middleware átirányít a login-ra

### 5. Register oldal teszt

1. A login oldalon kattints a "Regisztrálj ingyen!" linkre
2. **Várható:** Betöltődik a RegisterPage
3. Kattints a "Regisztráció" gombra
4. **Várható:** Beállít egy tokent és átirányít a dashboard-ra

### 6. Bejelentkezett állapotban login oldal elérése

1. Miután bejelentkeztél, próbáld meg közvetlenül megnyitni: `http://localhost:5173/login`
2. **Várható:** Automatikusan átirányít a dashboard-ra (useEffect működik!)

> [!TIP]
> Nyisd meg a böngésző Developer Tools-t (F12) → Console, hogy lásd a navigációs eseményeket!

---

## Összefoglalás

### Mit implementáltál? (ebben a sorrendben tanultad)

1. ✅ **MentorsPage komponens** - Mentor foglalási oldal (egyszerű komponens írás)
2. ✅ **React Router v7 Data Router** - Objektum-alapú route konfiguráció és nested route-ok
3. ✅ **Navigation komponens** - Navigációs menü token-alapú linkekkel és NavLink használatával
4. ✅ **Layout frissítés** - Navigation integráció és Outlet használata
5. ✅ **authMiddleware** - Middleware-alapú védelem a komponens renderelés előtt
6. ✅ **Átirányítások** - Login/Register → Dashboard automatikus átirányítás useEffect-tel
7. ✅ **404 oldal** - Nem létező route-ok kezelése (már készen volt!)

### Kulcs koncepciók

1. **Data Router minta** - Központosított, objektum-alapú route konfiguráció
2. **Middleware** - Komponens renderelés ELŐTT futó védelem
3. **Nested routes** - Parent-child route hierarchia (`children` array)
4. **useNavigate hook** - Programozott navigáció React Router-ben
5. **NavLink** - Aktív link stílusok kezelése
6. **Outlet** - Child route-ok renderelési helye

---

## Gyakori hibák és megoldásaik

### 1. "Cannot read property 'href' of undefined"

**Ok:** Valószínűleg még `window.location.href`-et használsz valahol  
**Megoldás:** Használd helyette a `useNavigate()` hook-ot

### 2. "authMiddleware is not defined"

**Ok:** Az import elírva vagy a fájl nem létezik  
**Megoldás:** Ellenőrizd, hogy létrehoztad-e a `src/middleware/authMiddleware.js` fájlt

### 3. Navigation nem jelenik meg

**Ok:** Hiányzik a Navigation import a Layout.jsx-ben  
**Megoldás:** Add hozzá: `import Navigation from "./Navigation";`

### 4. Middleware nem működik

**Ok:** Lehet, hogy elírtad a `middleware` property-t a route config-ban  
**Megoldás:** Győződj meg róla, hogy `middleware: [authMiddleware]` (tömb!)

### 5. Bejelentkezés után nem jelenik meg a navigáció

**Ok:** A token nincs beállítva vagy a Navigation nem olvassa ki  
**Megoldás:** Ellenőrizd a böngésző Developer Tools → Application → Local Storage

---

## Következő lépések (2. modul)

A következő modulban implementálni fogjuk:

- 🔄 **AuthContext** - Globális hitelesítési állapot
- 🪝 **useAuth hook** - Könnyebb hozzáférés az auth state-hez
- 🌐 **API integráció** - Valódi backend hívások
- 📊 **Loaders** - Adatok betöltése a route-ok renderelése előtt
- ⚡ **Actions** - Form submit-ok kezelése (Data Router)
- ✅ **Form validáció** - Komplex validációs logika

---

> [!NOTE]
> Gratulálunk! Sikeresen implementáltad a React Router v7 Data Router mintát middleware-alapú hitelesítéssel! 🎉
