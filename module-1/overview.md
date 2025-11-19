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
npm install react-router-dom
```

### Alapvető használat

**1. BrowserRouter beállítása** (az alkalmazás gyökerében, `main.jsx`):

```jsx
import { BrowserRouter } from "react-router-dom";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

**2. Route-ok definiálása** (az `App.jsx`-ben):

```jsx
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

**3. Navigáció Link komponenssel:**

```jsx
import { Link } from "react-router-dom";

function Navigation() {
  return (
    <nav>
      <Link to="/">Főoldal</Link>
      <Link to="/about">Rólunk</Link>
    </nav>
  );
}
```

### Fontos Router koncepciók

**URL paraméterek:**

```jsx
// Route definiálása:
<Route path="/courses/:id" element={<CourseDetails />} />;

// Paraméter kiolvasása a komponensben:
import { useParams } from "react-router-dom";

function CourseDetails() {
  const { id } = useParams();
  // id tartalmazza az URL-ből kinyert értéket
}
```

**Programozott navigáció (JavaScript-ből):**

```jsx
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Login logika...
    navigate("/dashboard"); // Átirányítás a dashboard-ra
  };
}
```

**NavLink - aktív link stílusozása:**

```jsx
import { NavLink } from "react-router-dom";

<NavLink to="/courses" className={({ isActive }) => (isActive ? "active" : "")}>
  Kurzusok
</NavLink>;
```

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

### X-API token tárolása

```jsx
// Token mentése login után
localStorage.setItem("token", apiToken);

// Token kiolvasása
const token = localStorage.getItem("token");

// Token törlése (logout)
localStorage.removeItem("token");
```

### Védett route implementálása

**Védő komponens létrehozása:**

```jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Ha nincs token, irányítsuk a login oldalra
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Ha van token, jelenítsd meg az oldalt
  return children;
}
```

**Használat a route definíciókban:**

```jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  {/* Védett route-ok */}
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
</Routes>
```

### Automatikus átirányítás login után

Ha valaki be van jelentkezve és megpróbálja elérni a login oldalt, érdemes automatikusan átirányítani a dashboard-ra:

```jsx
function LoginPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Ha már be van jelentkezve, irányítsuk a dashboard-ra
  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  return <div>Login form...</div>;
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
import { Outlet } from "react-router-dom";

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

// App.jsx-ben:
<Routes>
  <Route element={<Layout />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/courses" element={<CoursesPage />} />
    <Route path="/mentors" element={<MentorsPage />} />
  </Route>
</Routes>;
```

### Navigációs komponens

```jsx
import { NavLink } from "react-router-dom";

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
│   │   ├── ProtectedRoute.jsx
│   │   ├── CourseCard.jsx
│   │   └── ...
│   ├── pages/               # Oldal komponensek
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── CoursesPage.jsx
│   │   ├── CourseDetailsPage.jsx
│   │   └── MentorsPage.jsx
│   ├── contexts/            # Context API
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
- **`contexts/`**: React Context API provider-ek (pl. AuthContext a hitelesítéshez)
- **`hooks/`**: Egyedi hook-ok, amelyek logikát tartalmaznak (pl. useAuth, useApi)
- **`services/`**: API kommunikációs függvények (fetch hívások)
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

### Következő lépések

Az 1. modul gyakorlati részében a következőket fogjuk megvalósítani:

1. ✅ Vite projekt inicializálása React-tel
2. ✅ React Router telepítése és beállítása
3. ✅ Projekt mappa struktúra kialakítása
4. ✅ Layout komponens létrehozása
5. ✅ Alapvető oldalak létrehozása (Login, Register, Dashboard, stb.)
6. ✅ Védett route-ok implementálása
7. ✅ Navigáció létrehozása
8. ✅ Alapvető CSS struktúra a wireframe-ek alapján

A modul végére egy működő, többoldalas alkalmazás vázzal fogunk rendelkezni, amely készen áll arra, hogy a következő modulokban hitelesítést és API integrációt adjunk hozzá!
