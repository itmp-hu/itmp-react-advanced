# 1. modul elméleti áttekintés - Projekt bevezetés, alapstruktúra és routing

- A SkillShare Academy projekt bemutatása
- Single Page Application (SPA) koncepció
- React Router alapok
- Védett route-ok és hitelesítési folyamat
- Layout komponensek és oldalstruktúra
- Projekt felépítés és mappa struktúra

## A SkillShare Academy projekt bemutatása

Ezen a tréningen egy valós, komplex React alkalmazást fogunk építeni: a **SkillShare Academy** tanulási platform frontendjét. Ez a projekt a MITS (Marketable IT Skills) projektadatbázisból származik, és egy olyan gyakorlati feladaton alapul, amelyet nemzetközi programozó versenyeken is használnak.

**Mit csinál az alkalmazás?**

A SkillShare Academy egy tanulási platform, ahol a felhasználók:

- Regisztrálhatnak és bejelentkezhetnek
- Böngészhetnek a kurzusok között és beiratkozhatnak rájuk
- Fejezetek elvégzésével krediteket gyűjthetnek
- A megszerzett kreditekkel mentorálási foglalások foglalhatnak
- Nyomon követhetik a tanulási előrehaladásukat diagramok segítségével

**Mit kapunk készként?**

- Működő backend API-t (REST API)
- API dokumentációt (OpenAPI formátumban)
- 7 wireframe tervet az oldalak kinézetéhez
- Adatbázis struktúrát (az adatok megértéséhez)
- LinkedIn megosztó widget-et (előre elkészített JavaScript könyvtár)

**Mit fogunk mi megépíteni?**

A teljes frontend alkalmazást, amely:

- 7 oldalból áll (Login, Regisztráció, Dashboard, Kurzuskatalógus, Kurzus részletek, Mentorok, Foglalások)
- REST API-val kommunikál
- Valós időben frissülő adatokat jelenít meg
- Diagramokat rajzol Chart.js segítségével
- Külső JavaScript könyvtárat integrál

## Single Page Application (SPA) koncepció

### Mi az a Single Page Application?

A Single Page Application (SPA) egy olyan webalkalmazás típus, amely **egyetlen HTML oldalt tölt be**, majd a további navigáció során dinamikusan frissíti a tartalmat, **anélkül, hogy újratöltené az oldalt**.

**Hagyományos többoldalas alkalmazás:**

```
Felhasználó kattint egy linkre
  → A böngésző új kérést küld a szervernek
  → A szerver egy új HTML oldalt küld vissza
  → A böngésző újratölti az egész oldalt
  → Fehér villanás, minden újratöltődik
```

**Single Page Application:**

```
Felhasználó kattint egy linkre
  → A JavaScript elfogja a kattintást
  → A React frissíti csak a megváltozott komponenseket
  → Az URL megváltozik (de nincs újratöltés)
  → Folyamatos, app-szerű élmény
```

### Miért jó az SPA?

- **Gyorsabb felhasználói élmény:** Nincs fehér villanás, azonnal reagál
- **Kevesebb adat mozog:** Csak az új adatokat kell letölteni, nem az egész oldalt
- **Jobb felhasználói élmény:** Olyan, mint egy mobilalkalmazás
- **Több kontroll:** A JavaScript teljes irányítást ad a felhasználói élmény felett

### Mikor érdemes SPA-t használni?

- Dinamikus, interaktív alkalmazások (pl. Gmail, Facebook, Twitter)
- Dashboard-ok és adminisztrációs felületek
- E-learning platformok (mint a SkillShare Academy)
- Bármilyen alkalmazás, ahol sok interakció van

### Mi a különbség a klasszikus weboldalhoz képest?

| Hagyományos többoldalas              | Single Page Application                 |
| ------------------------------------ | --------------------------------------- |
| Minden kattintásnál új HTML töltődik | Egyszer töltődik be, utána csak adatok  |
| Szerver rendereli a HTML-t           | Kliens (böngésző) rendereli a React-tel |
| Lassabb navigáció                    | Gyors, azonnali navigáció               |
| SEO könnyebb                         | SEO nehezebb (de megoldható)            |
| Egyszerűbb fejlesztés                | Komplexebb, de jobb UX                  |

## React Router alapok

### Mi az a React Router?

A React Router a legnépszerűbb routing könyvtár React alkalmazásokhoz. Lehetővé teszi, hogy **többoldalas navigációt valósítsunk meg** egy single-page alkalmazásban.

**Mit csinál?**

- Figyeli az URL változásokat
- Az URL alapján különböző komponenseket jelenít meg
- Kezeli a navigációt (Link, useNavigate)
- Támogatja a böngésző előre/hátra gombokat
- URL paramétereket és query string-eket kezel

### Telepítés

```bash
npm install react-router
```

⚠️ **Fontos változás React Router v7-ben:** A `react-router-dom` csomag már nem szükséges. Az összes React Router funkció közvetlenül a `react-router` csomagból importálható.

### Alapvető használat - Data Router (Ajánlott)

A React Router v7 **ajánlott megközelítése** a Data Router minta, amely objektum-alapú route konfigurációt használ.

**1. Router létrehozása és route-ok definiálása** (`App.jsx`):

```jsx
import { createBrowserRouter, RouterProvider } from "react-router";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

// Route-ok definiálása objektumként
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

**2. App renderelése** (`main.jsx`):

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**3. Navigáció Link komponenssel:**

```jsx
import { Link } from "react-router";

function Navigation() {
  return (
    <nav>
      <Link to="/">Főoldal</Link>
      <Link to="/about">Rólunk</Link>
    </nav>
  );
}
```

**Miért ez az ajánlott megközelítés?**

- Központosított route konfiguráció egy helyen
- Egyszerűbb route struktúra áttekintése
- Később könnyen bővíthető loader-ekkel és action-ökkel
- Jobb TypeScript támogatás
- Felkészít bennünket a haladó funkciókra (következő modulokban)

### Alternatív megközelítés - BrowserRouter (Egyszerűbb)

Ha egyszerűbb, JSX-alapú route definíciót szeretnél, használhatod a `BrowserRouter` megközelítést is:

```jsx
// main.jsx
import { BrowserRouter } from "react-router";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

```jsx
// App.jsx
import { Routes, Route } from "react-router";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
}
```

**Mikor használjuk ezt?**

- Nagyon egyszerű projekteknél
- Gyors prototípusok készítésénél
- Ha nem tervezünk adatbetöltést vagy form kezelést

**A SkillShare Academy projektben a Data Router mintát fogjuk használni**, mivel később API integrációt és form kezelést is implementálunk.

### Fontos Router koncepciók

**URL paraméterek:**

```jsx
// Route definiálása (Data Router):
const router = createBrowserRouter([
  {
    path: "/courses/:id",
    element: <CourseDetails />,
  },
]);

// Vagy BrowserRouter esetén:
<Route path="/courses/:id" element={<CourseDetails />} />;

// Paraméter kiolvasása a komponensben:
import { useParams } from "react-router";

function CourseDetails() {
  const { id } = useParams();
  // id tartalmazza az URL-ből kinyert értéket
  return <div>Kurzus ID: {id}</div>;
}
```

**Programozott navigáció (JavaScript-ből):**

```jsx
import { useNavigate } from "react-router";

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Login logika...
    navigate("/dashboard"); // Átirányítás a dashboard-ra
  };

  return <button onClick={handleLogin}>Bejelentkezés</button>;
}
```

**NavLink - aktív link stílusozása:**

```jsx
import { NavLink } from "react-router";

function Navigation() {
  return (
    <nav>
      <NavLink
        to="/courses"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Kurzusok
      </NavLink>
    </nav>
  );
}
```

### Data Router haladó funkciói

A `createBrowserRouter` által kínált Data Router minta számos haladó funkciót tesz lehetővé:

- **Middleware**: Központosított logika (pl. hitelesítés) route-ok előtt - **ebben a modulban**
- **Loaders**: Adatok betöltése a komponens renderelése előtt (Modul 2)
- **Actions**: Form submit kezelés beépített adatfrissítéssel (Modul 2)
- **Error Boundaries**: Automatikus hibakezelés route szinten (Modul 3)

**Ebben a modulban** a Data Router alapvető használatát tanuljuk meg route definíciókkal, navigációval és middleware-rel a hitelesítéshez. A loader-eket és action-öket a következő modulokban fogjuk bevezetni.

## Védett route-ok és hitelesítési folyamat

### Mi az a védett route?

Egy **védett route (protected route)** olyan oldal, amelyet csak bejelentkezett felhasználók érhetnek el. Ha valaki nincs bejelentkezve és megpróbálja elérni, akkor automatikusan átirányítjuk a login oldalra.

**SkillShare Academy példa:**

- `/login` és `/register` - **nyilvános** (mindenki elérheti)
- `/dashboard`, `/courses`, `/mentors` - **védett** (csak bejelentkezett felhasználóknak)

### Hogyan működik a hitelesítés folyamata?

```
1. Felhasználó megadja email + jelszó párost
   ↓
2. POST kérés a /api/v1/users/login endpoint-ra
   ↓
3. Backend ellenőrzi az adatokat
   ↓
4. Ha helyes: Backend küld egy X-API tokent
   ↓
5. Frontend elmenti a tokent a localStorage-ba
   ↓
6. Minden további API kéréshez csatoljuk ezt a tokent
   ↓
7. Backend a token alapján azonosítja a felhasználót
```

### X-API token tárolása localStorage használatával

**localStorage alapműveletek:**

```jsx
// Adat mentése
localStorage.setItem("key", "value");

// Adat kiolvasása
const value = localStorage.getItem("key");

// Adat törlése
localStorage.removeItem("key");

// Minden adat törlése
localStorage.clear();
```

**JSON adatok tárolása**

A localStorage csak string-eket tud tárolni, ezért objektumokat JSON-ként kell kezelni:

```jsx
// Objektum mentése
const user = { name: "János", email: "janos@example.com" };
localStorage.setItem("user", JSON.stringify(user));

// Objektum kiolvasása
const storedUser = JSON.parse(localStorage.getItem("user"));
```

**X-API token tárolása**

```jsx
// Token mentése login után
localStorage.setItem("token", apiToken);

// Token kiolvasása
const token = localStorage.getItem("token");

// Token törlése (logout)
localStorage.removeItem("token");
```

### Védett route implementálása middleware-rel

A React Router v7 **middleware** funkciója lehetővé teszi, hogy központosított logikát futtassunk le route-ok előtt. Ez ideális hitelesítés kezelésére.

**Mi az a middleware?**

A middleware egy függvény, amely:

- A route komponens renderelése **előtt** fut le
- Ellenőrizheti a hitelesítést
- Átirányíthat más route-ra (pl. login oldalra)
- Több route-ra is alkalmazható

**Hitelesítési middleware létrehozása:**

```jsx
import { redirect } from "react-router";

// Middleware függvény
async function authMiddleware({ request }) {
  const token = localStorage.getItem("token");

  // Ha nincs token, irányítsuk a login oldalra
  if (!token) {
    throw redirect("/login");
  }

  // Ha van token, folytatódik a navigáció
  // (A middleware-nek nem kell semmit visszaadnia)
}
```

**Middleware használata a route definíciókban:**

```jsx
import { createBrowserRouter } from "react-router";

const router = createBrowserRouter([
  // Nyilvános route-ok
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // Védett route-ok - middleware listában adjuk meg
  {
    path: "/dashboard",
    element: <DashboardPage />,
    middleware: [authMiddleware], // Automatikusan lefut navigálás előtt
  },
  {
    path: "/courses",
    element: <CoursesPage />,
    middleware: [authMiddleware],
  },
  {
    path: "/mentors",
    element: <MentorsPage />,
    middleware: [authMiddleware],
  },
]);
```

**Middleware előnyei:**

✅ **Központosított logika:** Egy helyen van a hitelesítési ellenőrzés
✅ **Tisztább kód:** Nincs szükség wrapper komponensekre
✅ **Futási sorrend:** Lefut a komponens renderelése előtt
✅ **Újrafelhasználható:** Több route-ra is alkalmazható
✅ **Láncolható:** Több middleware is használható egyszerre

**Middleware működése:**

```
1. Felhasználó megpróbál elérni /dashboard-ot
   ↓
2. authMiddleware lefut
   ↓
3. Ellenőrzi a localStorage-ban a token-t
   ↓
4. Ha nincs token → throw redirect("/login")
   ↓
5. Ha van token → a navigáció folytatódik
   ↓
6. DashboardPage komponens renderelődik
```

**Több middleware láncolása:**

```jsx
async function loggingMiddleware({ request }) {
  console.log(`Navigálás ide: ${new URL(request.url).pathname}`);
}

{
  path: "/dashboard",
  element: <DashboardPage />,
  middleware: [loggingMiddleware, authMiddleware], // Sorban futnak le
}
```

**Megjegyzés:** Ebben a modulban csak a token jelenlétét ellenőrizzük. A következő modulokban fogjuk megvalósítani az igazi API hívást a backend felé a token validálásához.

### Automatikus átirányítás login után

Ha valaki be van jelentkezve és megpróbálja elérni a login oldalt, érdemes automatikusan átirányítani a dashboard-ra. Ezt is ajánlott middleware-rel megoldani, de most az egyszerűsítés kedvéért a komponensben oldjuk meg:

```jsx
import { useNavigate } from "react-router";
import { useEffect } from "react";

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div>
      <h1>Bejelentkezés</h1>
      {/* Login form... */}
    </div>
  );
}
```

Ugyanígy működik a `RegisterPage` komponensben is:

```jsx
function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div>
      <h1>Regisztráció</h1>
      {/* Registration form... */}
    </div>
  );
}
```

## Layout komponensek és oldalstruktúra

### Mi az a layout komponens?

A **layout komponens** egy olyan wrapper komponens, amely közös elemeket tartalmaz több oldal számára (pl. fejléc, navigáció, lábléc). Ez biztosítja, hogy ne kelljen minden oldalon megismételni ugyanazokat az elemeket.

### Miért használunk layout-ot?

- **DRY elv (Don't Repeat Yourself):** Ne ismételjük meg a kódot
- **Konzisztens megjelenés:** Minden oldal ugyanazt a struktúrát használja
- **Könnyebb karbantartás:** Egy helyen módosítható a navigáció
- **Jobb felhasználói élmény:** Következetes navigáció

### Layout komponens struktúra

```jsx
// Layout.jsx
function Layout({ children }) {
  return (
    <div className="layout">
      <header>
        <h1>SkillShare Academy</h1>
        <Navigation />
      </header>

      <main>
        {children} {/* Itt jelennek meg a különböző oldalak */}
      </main>

      <footer>
        <p>&copy; 2025 SkillShare Academy</p>
      </footer>
    </div>
  );
}
```

### Outlet használata nested route-okhoz

A React Router `Outlet` komponense egy speciális placeholder, amely azt jelzi, hogy hol jelenjenek meg a gyermek route-ok:

```jsx
import { Outlet } from "react-router";

function Layout() {
  return (
    <div className="layout">
      <header>
        <Navigation />
      </header>

      <main>
        <Outlet /> {/* Itt jelennek meg a nested route-ok */}
      </main>

      <footer>
        <p>&copy; 2025 SkillShare Academy</p>
      </footer>
    </div>
  );
}
```

**Data Router használat (ajánlott):**

```jsx
import { createBrowserRouter } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
        middleware: [authMiddleware], // Védett route
      },
      {
        path: "courses",
        element: <CoursesPage />,
        middleware: [authMiddleware], // Védett route
      },
      {
        path: "mentors",
        element: <MentorsPage />,
        middleware: [authMiddleware], // Védett route
      },
    ],
  },
]);
```

**Middleware öröklődése (haladó):**

Ha minden child route-ra ugyanazt a middleware-t szeretnéd alkalmazni, akkor a parent route-ra is ráteheted:

```jsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    middleware: [authMiddleware], // MINDEN gyermek route-ra vonatkozik!
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "courses",
        element: <CoursesPage />,
      },
      {
        path: "mentors",
        element: <MentorsPage />,
      },
    ],
  },
]);
```

Ez azt jelenti, hogy a `/dashboard`, `/courses`, és `/mentors` route-ok mind hitelesítést igényelnek, anélkül hogy mindegyikre külön felírnánk a middleware-t.

**BrowserRouter használat (alternatív):**

```jsx
<Routes>
  <Route element={<Layout />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/courses" element={<CoursesPage />} />
    <Route path="/mentors" element={<MentorsPage />} />
  </Route>
</Routes>
```

### Navigációs komponens

```jsx
import { NavLink } from "react-router";

function Navigation() {
  const token = localStorage.getItem("token");

  return (
    <nav>
      {token ? (
        // Bejelentkezett felhasználóknak
        <>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/courses">Kurzusok</NavLink>
          <NavLink to="/mentors">Mentorok</NavLink>
          <button onClick={handleLogout}>Kijelentkezés</button>
        </>
      ) : (
        // Kijelentkezett felhasználóknak
        <>
          <NavLink to="/login">Bejelentkezés</NavLink>
          <NavLink to="/register">Regisztráció</NavLink>
        </>
      )}
    </nav>
  );
}
```

## Projekt felépítés és mappa struktúra

### Ajánlott projekt struktúra

Egy jól szervezett React projekt elengedhetetlen a karbantarthatósághoz. Íme egy ajánlott struktúra a SkillShare Academy projekthez:

```
skillshare-academy/
├── public/
│   └── third-party/          # LinkedIn share widget fájlok
│       ├── linkedin-share.js
│       └── linkedin-share.css
├── src/
│   ├── assets/              # Képek, ikonok
│   │   └── wireframes/      # Referenciaként
│   ├── components/          # Újrafelhasználható komponensek
│   │   ├── Layout.jsx
│   │   ├── Navigation.jsx
│   │   ├── CourseCard.jsx
│   │   └── ...
│   ├── pages/               # Oldal komponensek
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── CoursesPage.jsx
│   │   ├── CourseDetailsPage.jsx
│   │   └── MentorsPage.jsx
│   ├── middleware/          # Route middleware függvények
│   │   └── authMiddleware.js
│   ├── contexts/            # Context API (későbbi modulok)
│   │   └── AuthContext.jsx
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.js
│   │   └── useApi.js
│   ├── services/            # API hívások
│   │   └── api.js
│   ├── styles/              # CSS fájlok
│   │   ├── index.css
│   │   ├── Layout.module.css
│   │   └── ...
│   ├── App.jsx              # Route definíciók
│   └── main.jsx             # Belépési pont
├── package.json
└── vite.config.js
```

### Mappa funkciók magyarázata

- **`components/`**: Kisebb, újrafelhasználható komponensek (gombok, kártyák, form mezők stb.)
- **`pages/`**: Teljes oldal komponensek, amelyek route-okhoz kapcsolódnak
- **`contexts/`**: React Context API provider-ek (későbbi modulokban)
- **`hooks/`**: Egyedi hook-ok, amelyek logikát tartalmaznak (pl. useAuth, useApi)
- **`services/`**: API kommunikációs függvények (fetch hívások)
- **`middleware/`**: Route middleware függvények (pl. authMiddleware)
- **`styles/`**: CSS vagy CSS Module fájlok

### Komponens vs. Oldal (Page)

**Komponens példa** (`components/CourseCard.jsx`):

```jsx
// Kis, újrafelhasználható komponens
function CourseCard({ title, description, difficulty }) {
  return (
    <div className="course-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <span>{difficulty}</span>
    </div>
  );
}
```

**Oldal példa** (`pages/CoursesPage.jsx`):

```jsx
// Teljes oldal, amely több komponenst használ
function CoursesPage() {
  const [courses, setCourses] = useState([]);

  return (
    <div>
      <h1>Kurzuskatalógus</h1>
      <div className="courses-grid">
        {courses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>
    </div>
  );
}
```

### CSS szervezés

Két fő megközelítés:

**1. Globális CSS (`styles/index.css`):**

```css
/* Általános stílusok, változók, reset */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
}

body {
  font-family: "Inter", sans-serif;
  margin: 0;
  padding: 0;
}
```

**2. CSS Modules (`components/CourseCard.module.css`):**

```css
/* Csak a CourseCard komponensre vonatkozó stílusok */
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
}

.title {
  font-size: 1.5rem;
  margin-bottom: 8px;
}
```

Használat:

```jsx
import styles from "./CourseCard.module.css";

function CourseCard({ title }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
    </div>
  );
}
```

## Teljes példa: SkillShare Academy router konfiguráció

Így néz ki a teljes router konfiguráció middleware-ekkel a SkillShare Academy projekthez:

```jsx
// App.jsx
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
  Navigate,
} from "react-router";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import MentorsPage from "./pages/MentorsPage";

// Middleware: Hitelesítés ellenőrzése
async function authMiddleware({ request }) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw redirect("/login");
  }
}

// Router konfiguráció
const router = createBrowserRouter([
  // Nyilvános route-ok (login, register)
  // Az átirányítás a komponensekben van kezelve (useEffect)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // Védett route-ok (Layout wrapper-rel)
  {
    path: "/",
    element: <Layout />,
    middleware: [authMiddleware], // Minden child route védett lesz
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
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

**Ezt a konfigurációt fogjuk implementálni a gyakorlati részben!**

---

### Következő lépések

Az 1. modul gyakorlati részében a következőket fogjuk megvalósítani:

1. ✅ Vite projekt inicializálása React-tel
2. ✅ React Router v7 telepítése
3. ✅ Data Router beállítása (`createBrowserRouter`)
4. ✅ Projekt mappa struktúra kialakítása
5. ✅ Layout komponens létrehozása nested route-okkal
6. ✅ Alapvető oldalak létrehozása (Login, Register, Dashboard, stb.)
7. ✅ Middleware létrehozása hitelesítéshez (`authMiddleware`)
8. ✅ Védett route-ok implementálása middleware-rel
9. ✅ Navigáció létrehozása (NavLink használatával)
10. ✅ Alapvető CSS struktúra a wireframe-ek alapján

A modul végére egy működő, többoldalas alkalmazás vázzal fogunk rendelkezni Data Router mintával és middleware-alapú hitelesítéssel, amely készen áll arra, hogy a következő modulokban adatbetöltést (loaders) és form kezelést (actions) adjunk hozzá!
