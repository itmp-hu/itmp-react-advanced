# Workshop Short Start - Projekt Információk

## Ez egy kiinduló projekt a Module 1 Workshop (Rövid verzió) gyakorlathoz

### ✅ MIT TARTALMAZ (kész komponensek/fájlok):

#### Projekt konfiguráció
- `package.json` - **React Router NINCS telepítve!** (te fogod telepíteni)
- `vite.config.js` - Vite konfiguráció
- `eslint.config.js` - ESLint konfiguráció
- `index.html` - HTML belépési pont
- `.gitignore` - Git ignore fájl

#### Alkalmazás struktúra
- `src/main.jsx` - React entry point (kész)
- `src/App.jsx` - **STATIKUS** - csak LoginPage-t renderel, nincs routing!
- `src/index.css` - **TELJES CSS** - minden stílus készen van!

#### Komponensek
- `src/components/Layout.jsx` - Layout komponens **ÜRES `<header>` taggel**, nincs Navigation!

#### Oldalak (pages)
- ✅ `src/pages/LoginPage.jsx` - **NINCS BENNE** useNavigate és useEffect átirányítás!
- ✅ `src/pages/RegisterPage.jsx` - **NINCS BENNE** useNavigate és useEffect átirányítás!
- ✅ `src/pages/DashboardPage.jsx` - Kész dashboard oldal
- ✅ `src/pages/CoursesPage.jsx` - Kész kurzuslista oldal
- ✅ `src/pages/CourseDetailsPage.jsx` - Kész kurzus részletek oldal
- ❌ **HIÁNYZIK:** `src/pages/MentorsPage.jsx` - Te fogod megírni!

#### Üres mappák (használatra várnak)
- `src/middleware/` - Itt lesz az authMiddleware.js
- `src/contexts/` - 2. modulban használjuk (AuthContext)
- `src/hooks/` - 2. modulban használjuk (useAuth)
- `src/services/` - 2. modulban használjuk (API service)

---

### ❌ MIT KELL IMPLEMENTÁLNOD (workshop során):

1. **MentorsPage.jsx** komponens
   - Teljes mentor foglalási oldal
   - Mentor kártyák, időpontok, foglalások

2. **React Router telepítése és konfiguráció**
   - `npm install react-router`
   - App.jsx átírása Data Router mintával
   - Route-ok definiálása
   - Nested route-ok (courses/:id)

3. **Navigation.jsx** komponens
   - Navigációs menü
   - NavLink használata (aktív link stílusok)
   - Token-alapú feltételes megjelenítés
   - useNavigate hook a kijelentkezéshez

4. **Layout.jsx frissítése**
   - Navigation import hozzáadása
   - `<header>` tag kitöltése Navigation-nel
   - Outlet használata (már importálva van kommentben)

5. **authMiddleware.js**
   - Middleware fájl létrehozása
   - Token ellenőrzés
   - redirect() használata
   - Middleware hozzáadása a router konfighoz

6. **LoginPage és RegisterPage frissítése**
   - useNavigate hook hozzáadása
   - useEffect átirányítás implementálása
   - navigate("/dashboard") a submit után

---

### 🎯 ELVÁRT VÉGEREDMÉNY:

A workshop végére az alkalmazásod:
- ✅ Működő React Router v7 Data Router konfigurációval
- ✅ Middleware-alapú hitelesítéssel (védett route-ok)
- ✅ Navigációs menüvel (login/logout logika)
- ✅ 6 működő oldallal (Dashboard, Courses, CourseDetails, Mentors, Login, Register)
- ✅ Automatikus átirányításokkal (login → dashboard, védett oldalak → login)

---

### 📝 ELSŐ LÉPÉSEK:

```bash
# 1. Függőségek telepítése
npm install

# 2. Dev szerver indítása
npm run dev

# 3. Nyisd meg a böngészőt
http://localhost:5173

# 4. Kövesd a workshop-short.md utasításait!
```

---

### 💡 TIPPEK:

- **Ne félj a hibáktól!** Az App.jsx-ben lévő kommentek segítenek.
- **Használd a böngésző DevTools-t!** (F12 → Console, Network, Application)
- **Lépésről lépésre haladj!** Minden feladat után tesztelj.
- **Kérdezz, ha elakadsz!** A workshop vezetők segítenek.

---

Jó tanulást! 🚀

