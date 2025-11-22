# 3. modul workshop (rövid) - REST API integráció befejezése

- Dashboard Recent Activity implementálása
- MentorsPage foglalt időpontok megjelenítése
- Hiányzó API szolgáltatások implementálása
- Register funkcionalitás befejezése

> [!NOTE]  
> **Feladat:**  
> A 3. modul rövid változatában a majdnem teljes megoldással indulsz. Néhány kulcsfontosságú funkció hiányzik, amelyeket neked kell implementálnod. Ez a workshop a valódi fejlesztési munkafolyamatot szimulálja, ahol egy meglévő projektbe kell integrálnod hiányzó funkciókat.

<hr />

## Előkészületek

### Kiindulási állapot

Az alábbi funkcionalitás már **kész és működik**:

✅ React Router konfigurálva authMiddleware-rel  
✅ AuthContext implementálva (login és logout működik)  
✅ LoginPage teljes funkcionalitással  
✅ Dashboard alapvető statisztikákkal és grafikonnal  
✅ CoursesPage teljes funkcionalitással  
✅ CourseDetailsPage fejezet kezeléssel  
✅ MentorsPage elérhető időpontokkal  
✅ LinkedIn Share Widget integráció  
✅ Polling mechanizmus (30 másodperces frissítés)

### Hiányzik és **NEKED kell implementálnod**:

❌ Dashboard - Recent Activity szekció  
❌ MentorsPage - Foglalt időpontjaim szekció  
❌ api.js - `register` függvény  
❌ api.js - `getCourseById` függvény  
❌ AuthContext - `register` függvény  
❌ RegisterPage - register hívás és navigáció

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
   - `alice@example.com`
   - `bob.jones@example.com`
   - `charlie.brown@example.com`

## 1. lépés - api.js register függvény implementálása

A `src/services/api.js` fájlban az `authService.register` függvény hiányzik. Implementáld!

> [!TIP]
> A `register` függvény hasonló a `login` függvényhez, de `name`, `email` és `password` paramétereket vár.

### Feladat

Nyisd meg az `src/services/api.js` fájlt és implementáld a hiányzó `register` függvényt az `authService` objektumban:

```javascript
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

  // TODO: Implementáld a register függvényt!
  // Endpoint: POST /users/register
  // Body: { name, email, password }
  // Headers: Content-Type: application/json
  async register(name, email, password) {
    // A TE KÓDOD IDE KERÜL
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/users/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response;
  },
};
```

**Megoldás elvárás:**

- HTTP metódus: `POST`
- Endpoint: `${API_BASE_URL}/users/register`
- Headers: `Content-Type: application/json`
- Body: JSON string `{ name, email, password }`
- Return: `response` objektum

## 2. lépés - AuthContext register függvény implementálása

Az `src/contexts/AuthContext.jsx` fájlban a `register` függvény hiányzik.

### Feladat

Implementáld a `register` függvényt az AuthContext-ben:

```jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ... useEffect és login függvény már kész ...

  // TODO: Implementáld a register függvényt!
  // 1. Hívd meg az authService.register(name, email, password)-t
  // 2. Ellenőrizd a response.status-t
  // 3. Ha 201 (Created), akkor return a data objektummal
  // 4. Ha 400, akkor throw Error "A felhasználó már létezik"
  // 5. Ha 422, akkor throw Error a message-zel
  // 6. Egyébként throw Error "Hiba történt a regisztráció során"
  const register = async (name, email, password) => {
    try {
      // A TE KÓDOD IDE KERÜL
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  // Logout és refreshUser már kész...

  const value = {
    user,
    token,
    loading,
    login,
    register, // Ez a függvény kell!
    logout,
    refreshUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

**Megoldás elvárás:**

- Hívd meg az `authService.register(name, email, password)`-t
- Ha `response.status === 201`: parse-old a JSON-t és return-öld
- Ha `response.status === 400`: dobj hibát "A felhasználó már létezik"
- Ha `response.status === 422`: parse-old a JSON-t és dobj hibát a message-zel
- Egyébként: dobj általános hibát
- Ne felejtsd el a `try-catch` blokkot!

> [!IMPORTANT]
> A `register` függvény **NEM** navigál! A navigációt a komponens kezeli (RegisterPage).

## 3. lépés - RegisterPage register hívás implementálása

Az `src/pages/RegisterPage.jsx` fájlban a `handleSubmit` függvény register hívása hiányzik.

### Feladat

Nyisd meg az `src/pages/RegisterPage.jsx` fájlt és egészítsd ki a `handleSubmit` függvényt:

```jsx
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

  // TODO: Register API hívás implementálása
  // 1. setLoading(true)
  // 2. try { await register(...) }
  // 3. Sikeres esetén setSuccessMessage
  // 4. Navigáció /login-ra 2 másodperc után
  // 5. catch { setServerError }
  // 6. finally { setLoading(false) }

  // A TE KÓDOD IDE KERÜL
};
```

**Megoldás elvárás:**

1. `setLoading(true)` a hívás előtt
2. `try` blokk:
   - Hívd meg a `register(name, email, password)` függvényt (useAuth-ból)
   - Sikeres esetén: `setSuccessMessage(result.message || "Sikeres regisztráció!")`
   - `setTimeout(() => { navigate("/login"); }, 2000);` - 2 másodperc után navigáció
3. `catch` blokk:
   - `setServerError(error.message)`
4. `finally` blokk:
   - `setLoading(false)`

## 4. lépés - api.js getCourseById függvény implementálása

A `src/services/api.js` fájlban a `courseService.getCourseById` függvény hiányzik.

### Feladat

Implementáld a hiányzó `getCourseById` függvényt a `courseService` objektumban:

```javascript
// Kurzus szolgáltatások
export const courseService = {
  async getAllCourses() {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  // TODO: Implementáld a getCourseById függvényt!
  // Endpoint: GET /courses/:id
  // Headers: X-API-TOKEN, Content-Type
  async getCourseById(id) {
    // A TE KÓDOD IDE KERÜL
  },

  async enrollInCourse(id) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/enroll`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response;
  },
};
```

**Megoldás elvárás:**

- HTTP metódus: `GET`
- Endpoint: `${API_BASE_URL}/courses/${id}`
- Headers: `getAuthHeaders()` használata (tartalmazza a token-t)
- Return: `response` objektum

## 5. lépés - Dashboard Recent Activity szekció implementálása

A `src/pages/DashboardPage.jsx` fájlban a "Legutóbbi tevékenység" szekció hiányzik.

### Feladat

Nyisd meg a `src/pages/DashboardPage.jsx` fájlt és add hozzá a Recent Activity szekciót a `charts-section` div-en belül, a Doughnut chart után:

```jsx
{
  /* Grafikon */
}
<div className="charts-section">
  <div className="chart-container">
    {enrolledCourses > 0 || completedChapters > 0 ? (
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

  {/* TODO: Implementáld a Legutóbbi tevékenység szekciót! */}
  {/* 1. Hozz létre egy div-et "recent-activity" class-szal */}
  {/* 2. Add hozzá a <h3>Legutóbbi tevékenység</h3> címet */}
  {/* 3. Ellenőrizd: recentActivity && recentActivity.length > 0 */}
  {/* 4. Ha van tevékenység: ul.activity-list > li.activity-item */}
  {/* 5. Mapped recentActivity.slice(0, 5) */}
  {/* 6. Minden activity-hez: description, creditsEarned/creditsPaid badge, timestamp */}
  {/* 7. Ha nincs tevékenység: <p>Még nincs tevékenység</p> */}

  {/* A TE KÓDOD IDE KERÜL */}
</div>;
```

**Megoldás elvárás:**

```jsx
{
  /* Legutóbbi tevékenység */
}
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
          <small>{new Date(activity.timestamp).toLocaleString("hu-HU")}</small>
        </li>
      ))}
    </ul>
  ) : (
    <p>Még nincs tevékenység</p>
  )}
</div>;
```

**Fontos pontok:**

- Class: `recent-activity`
- Lista: `ul.activity-list > li.activity-item`
- Csak az első 5 tevékenységet jelenítsd meg: `slice(0, 5)`
- Badge-ek: `credits-badge success` (zöld) és `credits-badge danger` (piros)
- Időformátum: `toLocaleString("hu-HU")`

## 6. lépés - MentorsPage Foglalt időpontjaim szekció implementálása

A `src/pages/MentorsPage.jsx` fájlban a "Foglalt időpontjaim" szekció hiányzik.

### Feladat

Nyisd meg a `src/pages/MentorsPage.jsx` fájlt és add hozzá a "Foglalt időpontjaim" szekciót az "Elérhető időpontok" szekció **elé**:

```jsx
return (
  <div className="page mentors-page">
    <h1>Mentor foglalás</h1>
    <p className="last-update">
      Utolsó frissítés: {lastUpdate.toLocaleTimeString()}
      <br />
      <small>(Automatikus frissítés 30 másodpercenként)</small>
    </p>

    {/* TODO: Implementáld a Foglalt időpontjaim szekciót! */}
    {/* 1. Ellenőrizd: bookedSessions.length > 0 */}
    {/* 2. Ha van foglalás: section.booked-sessions */}
    {/* 3. <h2>Foglalt időpontjaim</h2> */}
    {/* 4. div.sessions-grid */}
    {/* 5. Map bookedSessions: div.session-card.booked */}
    {/* 6. session-info: mentorName, sessionDate, status, creditsPaid */}
    {/* 7. Használd a formatDateTime helper függvényt! */}

    {/* A TE KÓDOD IDE KERÜL */}

    <section className="available-sessions">
      <h2>Elérhető időpontok</h2>
      {/* ... már kész ... */}
    </section>
  </div>
);
```

**Megoldás elvárás:**

```jsx
{
  bookedSessions.length > 0 && (
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
                    <strong>Időpont:</strong> {formatDateTime(s.sessionDate)}
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
  );
}
```

**Fontos pontok:**

- A `bookedSessions` már be van töltve (a komponens elején)
- A `loadBookedSessions()` függvény már kész
- A `usePolling` már meghívja
- Class-ok: `booked-sessions`, `sessions-grid`, `session-card booked`, `session-info`
- A `session` nested object: `item.session.mentorName`, `item.session.sessionDate`
- Használd a `formatDateTime()` helper függvényt!

## Tesztelés

### 1. Register tesztelése

1. Indítsd az alkalmazást: `npm run dev`
2. Nyisd meg: `http://localhost:5173`
3. Kattints a "Regisztrálj ingyen!" linkre
4. Töltsd ki a formot:
   - Név: Teszt Elek
   - Email: teszt@example.com
   - Jelszó: password123
   - Jelszó megerősítése: password123
5. Kattints a "Regisztráció" gombra
6. Látnod kell egy sikeres üzenetet
7. 2 másodperc után automatikusan átirányít a login oldalra

### 2. Dashboard Recent Activity tesztelése

1. Jelentkezz be (pl. alice@example.com / password123)
2. Navigálj a Dashboard-ra
3. Látnod kell a "Legutóbbi tevékenység" szekciót
4. Ha Alice-nak van tevékenysége, láthatod:
   - Tevékenység leírását
   - Zöld badge-et a szerzett kreditekkel (+X kredit)
   - Piros badge-et a költött kreditekkel (-X kredit)
   - Időbélyeget

### 3. Kurzus részletek tesztelése

1. Navigálj a "Kurzusok" oldalra
2. Beiratkozol egy kurzusra (ha még nem vagy beiratkozva)
3. Kattints a "Folytatás" gombra
4. Látnod kell a kurzus részleteit:
   - Címet, leírást
   - Előrehaladási sávot
   - Fejezetek listáját
5. Kattints egy fejezet "Befejezés" gombjára
6. Kapsz egy alert-et a megszerzett kreditekkel
7. A fejezet zöldre vált

### 4. MentorsPage Foglalt időpontok tesztelése

1. Navigálj a "Mentorok" oldalra
2. Látnod kell az "Elérhető időpontok" szekciót
3. Kattints egy "Foglalás" gombra
4. A foglalás megjelenik a "Foglalt időpontjaim" szekcióban a lap tetején
5. Látod:
   - Mentor nevét
   - Időpontot
   - Állapotot (status)
   - Költséget (creditsPaid)
6. Várj 30 másodpercet - az adatok automatikusan frissülnek

## Hibakezelés tesztelése

### Register - duplikált email

1. Próbálj meg ugyanazzal az email címmel újra regisztrálni
2. Látnod kell: "A felhasználó már létezik"

### Register - validáció

1. Próbálj meg 5 karakternél rövidebb jelszót megadni
2. Látnod kell: "A jelszónak legalább 8 karakter hosszúnak kell lennie"

### MentorsPage - nincs elég kredit

1. Próbálj meg egy drágább mentor időpontot lefoglalni, mint amennyi kreditje van
2. Látnod kell: "Nem elég kredit a foglaláshoz"

## Összefoglalás

Ebben a rövid workshopban implementáltad:

✅ **api.js register függvény** - POST /users/register endpoint  
✅ **api.js getCourseById függvény** - GET /courses/:id endpoint  
✅ **AuthContext register függvény** - HTTP státuszkód kezelés  
✅ **RegisterPage register hívás** - form submit, navigáció, error handling  
✅ **Dashboard Recent Activity** - tevékenység lista badge-ekkel  
✅ **MentorsPage Foglalt időpontok** - saját foglalások megjelenítése

### Főbb tanulságok

1. **API Service Layer** - központosított backend kommunikáció
2. **HTTP státuszkódok kezelése** - 200, 201, 400, 403, 422, 404
3. **Context API használata** - AuthContext, useAuth hook
4. **Komponens architektúra** - logika elválasztása a prezentációtól
5. **Navigáció kezelése** - komponensek kezelik a navigate-et, nem a Context
6. **Polling mechanizmus** - automatikus frissítés 30 másodpercenként
7. **Conditional rendering** - különböző állapotok kezelése (loading, error, empty, success)

> [!TIP]
> Ha elakadsz, nézd meg a teljes megoldást a `module-3/workshop-solution` mappában!

## Következő lépések (opcionális)

Ha szeretnéd tovább gyakorolni:

1. **Implementálj optimista UI frissítést** - ne várj a szerverválaszra, azonnal frissítsd a UI-t
2. **Add hozzá a loading skeleton-t** - szebb loading állapot
3. **Implementálj toast notifikációkat** - szebb alert-ek helyett
4. **Add hozzá az error boundary-t** - globális hibakezelés
5. **Implementálj lazy loading-ot** - Route-okhoz React.lazy()-vel

Gratulálunk! 🎉 Sikeresen befejezted a SkillShare Academy alkalmazás fejlesztését!
