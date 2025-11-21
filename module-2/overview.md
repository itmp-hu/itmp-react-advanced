# 2. modul elméleti áttekintés - Komponensek és állapotkezelés

- Haladó komponens minták
- Form kezelés React-ben
- Context API globális állapotkezeléshez
- Custom hooks készítése
- Browser storage (localStorage)
- Hibakezelési stratégiák

## Haladó komponens minták

### Controlled vs Uncontrolled komponensek

A React-ben két fő megközelítés létezik a form elemek kezelésére:

#### Controlled komponens

Egy **controlled komponens** olyan form elem, amelynek értékét a React state vezérli. Minden változáskor a React state frissül, és a komponens újra renderelődik.

```jsx
function ControlledInput() {
  const [value, setValue] = useState("");

  return (
    <input
      type="text"
      value={value} // State vezérli az értéket
      onChange={(e) => setValue(e.target.value)} // Minden gépeléskor frissül
    />
  );
}
```

**Előnyök:**

- Teljes kontroll az érték felett
- Validáció minden gépeléskor
- Könnyű feltételes logika implementálása
- React state-ből mindig elérhető az aktuális érték

**Amikor használd:**

- Form validációhoz
- Dinamikus form viselkedéshez
- Amikor a form adatait más komponenseknek is meg kell jeleníteni

#### Uncontrolled komponens

Egy **uncontrolled komponens** olyan form elem, amely a saját DOM állapotát használja, nem a React state-et. A `ref`-eket használjuk az érték kiolvasásához.

```jsx
function UncontrolledInput() {
  const inputRef = useRef();

  const handleSubmit = () => {
    console.log(inputRef.current.value); // Csak akkor olvassuk ki, amikor kell
  };

  return (
    <>
      <input type="text" ref={inputRef} />
      <button onClick={handleSubmit}>Küldés</button>
    </>
  );
}
```

**Előnyök:**

- Egyszerűbb kód egyszerű esetekben
- Kevesebb re-render
- Jól működik natív HTML viselkedéssel

**Amikor használd:**

- Egyszerű formok esetén
- File upload-nál
- Amikor nem kell azonnali validáció

**Általános szabály:** A modern React alkalmazásokban a **controlled komponenseket** részesítjük előnyben, mert több kontrollt és előreláthatóságot biztosítanak.

### Komponens kompozíció stratégiák

A komponens kompozíció azt jelenti, hogy kisebb, újrafelhasználható komponenseket kombinálunk összetettebb komponensek létrehozásához.

**Children prop pattern:**

```jsx
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-content">{children}</div>
    </div>
  );
}

// Használat:
<Card title="Profil">
  <p>Felhasználó neve: {userName}</p>
  <p>Email: {userEmail}</p>
</Card>;
```

**Render props pattern:**

A render props egy olyan technika, ahol egy komponens egy függvényt kap prop-ként, amely meghatározza, hogy mit kell renderelnie. Ez lehetővé teszi a logika és a megjelenítés szétválasztását - a komponens kezeli az állapotot és viselkedést, míg a szülő komponens dönti el, hogyan jelenjen meg.

```jsx
function Toggle({ render }) {
  const [isOn, setIsOn] = useState(false);
  const toggle = () => setIsOn(!isOn);

  return render({ isOn, toggle });
}

// Használat:
<Toggle
  render={({ isOn, toggle }) => (
    <div>
      <p>Állapot: {isOn ? "BE" : "KI"}</p>
      <button onClick={toggle}>Kapcsoló</button>
    </div>
  )}
/>;
```

### Feltételes renderelés minták

**1. If-else operátorral:**

```jsx
function Greeting({ isLoggedIn }) {
  if (isLoggedIn) {
    return <h1>Üdvözöllek vissza!</h1>;
  }
  return <h1>Kérlek jelentkezz be!</h1>;
}
```

**2. Ternary operátorral (rövidebb):**

```jsx
function Greeting({ isLoggedIn }) {
  return <h1>{isLoggedIn ? "Üdvözöllek vissza!" : "Kérlek jelentkezz be!"}</h1>;
}
```

**3. Logikai && operátorral (csak akkor renderel, ha igaz):**

```jsx
function Notification({ message }) {
  return <>{message && <div className="alert">{message}</div>}</>;
}
```

**4. Null/undefined visszaadása (nem renderel semmit):**

```jsx
function AdminPanel({ isAdmin }) {
  if (!isAdmin) {
    return null; // Nem renderel semmit
  }

  return <div>Admin panel tartalma...</div>;
}
```

### Újrafelhasználható komponens tervezés

**Alap elvek:**

1. **Single Responsibility** - Egy komponens egy dolgot csináljon jól
2. **Props interface** - Világos, jól dokumentált props-ok
3. **Alapértelmezett értékek** - Használj defaultProps-ot vagy default paramétereket

**Példa: Újrafelhasználható Button komponens**

```jsx
function Button({
  children,
  variant = 'primary',  // Alapértelmezett érték
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button'
}) {
  const className = `btn btn-${variant} btn-${size}`;

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Használat különböző módokon:
<Button variant="primary" onClick={handleSave}>Mentés</Button>
<Button variant="secondary" size="large">Mégse</Button>
<Button variant="danger" disabled>Törlés</Button>
```

## Form kezelés React-ben

### Form state kezelése

A React-ben a form adatokat általában a komponens state-jében tároljuk:

```jsx
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // Megakadályozza az oldal újratöltését
    console.log("Form adatok:", { email, password });
    // API hívás...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Jelszó"
      />
      <button type="submit">Bejelentkezés</button>
    </form>
  );
}
```

### Real-time validáció stratégiák

**1. onChange validáció (azonnali feedback):**

```jsx
function EmailInput() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (value) => {
    if (!value) {
      return "Az email cím kötelező";
    }
    if (!/\S+@\S+\.\S+/.test(value)) {
      return "Érvénytelen email formátum";
    }
    return "";
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError(validateEmail(value)); // Azonnal validál
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={handleChange}
        className={error ? "input-error" : ""}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}
```

**2. onBlur validáció (amikor elhagyja a mezőt):**

```jsx
function PasswordInput() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const validatePassword = (value) => {
    if (value.length < 8) {
      return "A jelszónak legalább 8 karakter hosszúnak kell lennie";
    }
    return "";
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validatePassword(password));
  };

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={handleBlur}
      />
      {touched && error && <span className="error-message">{error}</span>}
    </div>
  );
}
```

**3. Submit validáció (csak a form elküldésekor):**

```jsx
function RegistrationForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Az email kötelező";
    }

    if (formData.password.length < 8) {
      newErrors.password = "A jelszó túl rövid";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Form valid, küldjük el
    console.log("Form elküldve:", formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form mezők */}
      <button type="submit">Regisztráció</button>
    </form>
  );
}
```

### Hibakezelés és hibaüzenetek megjelenítése

**Inline error messages:**

```jsx
<div className="form-group">
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    className={errors.email ? "input-error" : ""}
    value={formData.email}
    onChange={handleChange}
  />
  {errors.email && <span className="error-text">{errors.email}</span>}
</div>
```

**Összesített hibaüzenetek:**

```jsx
{
  Object.keys(errors).length > 0 && (
    <div className="alert alert-error">
      <h4>Kérlek javítsd a következő hibákat:</h4>
      <ul>
        {Object.values(errors).map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Context API globális állapotkezeléshez

### Mikor használjuk a Context API-t?

A Context API akkor hasznos, amikor **sok komponensnek** kell hozzáférnie ugyanahhoz az adathoz, és nem akarunk "prop drilling"-et alkalmazni (amikor a props-okat több szinten keresztül kell átadni).

**Props drilling probléma:**

```jsx
// ❌ Nem ideális: props-okat 3 szinten keresztül adjuk át
<App>
  <Header user={user} />
    <Navigation user={user} />
      <UserMenu user={user} />
```

**Context megoldás:**

```jsx
// ✅ Jobb: Context-ből bármelyik komponens el tudja érni
<UserContext.Provider value={user}>
  <App>
    <Header />
      <Navigation />
        <UserMenu /> {/* Közvetlenül eléri a user-t */}
```

### Context létrehozása és használata

**1. Context létrehozása:**

```jsx
// AuthContext.jsx
import { createContext, useState, useContext } from "react";
import * as authService from "../services/authService";

// 1. Létrehozzuk a Context-et
const AuthContext = createContext();

// 2. Provider komponens készítése
export function AuthProvider({ children }) {
  const {login}
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = async (email, password) => {
    // Login logika...
    const data = await authService.login()

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Custom hook a Context használatához
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
```

**2. Provider beállítása (main.jsx vagy App.jsx):**

```jsx
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

**3. Context használata komponensekben:**

```jsx
import { useAuth } from "./contexts/AuthContext";

function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Üdv, {user.name}!</h1>
      <button onClick={logout}>Kijelentkezés</button>
    </div>
  );
}
```

### Több Context használata

Egy alkalmazásban több Context is lehet (pl. AuthContext, ThemeContext, LanguageContext):

```jsx
<AuthProvider>
  <ThemeProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </ThemeProvider>
</AuthProvider>
```

## Custom Hooks készítése

### Mi az a custom hook?

A **custom hook** egy olyan függvény, amely:

- `use` előtaggal kezdődik
- React hook-okat használ (useState, useEffect, stb.)
- Újrafelhasználható logikát tartalmaz

### Miért használjunk custom hook-okat?

- **Kód újrafelhasználás:** Ugyanazt a logikát több komponensben is használhatjuk
- **Tisztább kód:** Komplex logikát kiemeljük a komponensből
- **Könnyebb tesztelés:** A logika külön tesztelhető
- **Separation of Concerns:** A komponens csak a megjelenítésre fókuszál

### useAuth hook példa

```jsx
// context/AuthContext.jsx
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
```

**Használat komponensben:**

```jsx
function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Sikeres login után átirányítás
      navigate("/dashboard");
    } catch (err) {
      // Hiba kezelése (már a useAuth-ban van error state)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Bejelentkezés..." : "Bejelentkezés"}
      </button>
    </form>
  );
}
```

### Más hasznos custom hook példák

**useLocalStorage hook:**

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Használat:
const [user, setUser] = useLocalStorage("user", null);
```

## Browser Storage (localStorage)

### localStorage vs sessionStorage

| Feature    | localStorage        | sessionStorage             |
| ---------- | ------------------- | -------------------------- |
| Életciklus | Amíg nem törlik     | Csak a böngésző session-ig |
| Scope      | Azonos origin       | Azonos tab                 |
| Méret      | ~5-10MB             | ~5-10MB                    |
| Használat  | Hosszú távú tárolás | Ideiglenes adatok          |

### Biztonság szempontok

**❌ NE tárolj érzékeny adatokat:**

- Jelszavakat
- Hitelkártya adatokat
- API secret key-eket

**✅ Tárolható:**

- Authentication tokenek (X-API-Key)
- User preferences (theme, language)
- UI state
- Cache-elt adatok

## Összefoglalás

A 2. modul gyakorlati részében a következőket fogjuk megvalósítani:

1. ✅ Login és regisztrációs formok validációval
2. ✅ AuthContext globális állapotkezeléshez
3. ✅ useAuth custom hook
4. ✅ Token tárolás localStorage-ban
5. ✅ Real-time form validáció
6. ✅ API integrációAPI (login, register)
7. ✅ Újrafelhasználható form komponensek

A modul végére egy teljesen működő hitelesítési rendszerrel fogunk rendelkezni, amely Context API-val kezeli a globális állapotot, custom hook-okkal strukturálja a logikát, és professzionális hibakezelést biztosít!
