# Module 3 Starting Point

Üdvözöl a **3. modul** kiindulási pontja! Ez a branch tartalmazza a teljes **2. modul** megoldását.

## 📚 Mit tartalmaz ez a kiindulási pont?

### ✅ Modul 1 (Befejezett)

- React Router telepítve és konfigurálva
- 6 oldal komponens létrehozva
- Layout és Navigation komponensek
- Protected Route implementálva
- Alap CSS stílusok

### ✅ Modul 2 (Befejezett)

- **AuthContext** - Globális hitelesítési állapotkezelés
- **useAuth hook** - Auth context egyszerű használata
- **usePolling hook** - 30 másodperces polling támogatás
- **API Service Layer** (`src/services/api.js`) - Központosított backend kommunikáció
- **Login és Register** formok - Teljes validációval és API integrációval
- **Dashboard** - Chart.js vizualizációkkal (kredit történet, kurzus előrehaladás)
- Token kezelés localStorage-ban
- Hibakezelés és loading állapotok

## 🎯 Mi a feladatod a 3. modulban?

A 3. modulban be fogod fejezni a SkillShare Academy alkalmazást:

1. **Kurzuskatalógus** - API integráció, keresés, szűrés, beiratkozás
2. **Kurzus részletek** - Fejezetek megjelenítése, befejezés, LinkedIn share widget
3. **Mentor foglalás** - 30 másodperces polling, foglalás kezelés
4. **Véglegesítés** - Teljes hibakezelés, loading állapotok

## 🚀 Kezdés

### 1. Függőségek telepítése

```bash
npm install
```

### 2. Backend indítása

```bash
cd assets/backend-solution
docker compose up -d
```

Ellenőrizd: http://localhost:5000/api/v1/health

### 3. Alkalmazás indítása

```bash
npm run dev
```

Megnyitás: http://localhost:5173

### 4. Teszt fiókok

Email: `alice.smith@example.com`  
Jelszó: `password123`

Email: `bob.jones@example.com`  
Jelszó: `password123`

## 📖 Workshop útmutató

A részletes feladatleírást a `module-3/workshop.md` fájlban találod.

## 🏗️ Projekt struktúra

```
src/
├── components/
│   ├── Layout.jsx           ✅ Kész
│   ├── Navigation.jsx        ✅ AuthContext-tel
│   └── ProtectedRoute.jsx    ✅ Kész
├── contexts/
│   └── AuthContext.jsx       ✅ Teljes API integrációval
├── hooks/
│   ├── useAuth.js            ✅ Kész
│   └── usePolling.js         ✅ 30 mp polling
├── pages/
│   ├── LoginPage.jsx         ✅ Teljes validáció és API
│   ├── RegisterPage.jsx      ✅ Teljes validáció és API
│   ├── DashboardPage.jsx     ✅ Chart.js vizualizációkkal
│   ├── CoursesPage.jsx       ✅ API integráció
│   ├── CourseDetailsPage.jsx ✅ Fejezetek, befejezés, LinkedIn
│   └── MentorsPage.jsx       ✅ Polling, foglalás
├── services/
│   └── api.js                ✅ Teljes API service layer
├── App.jsx                   ✅ AuthProvider-rel
└── index.css                 ✅ Teljes stílusok

module-3/
├── overview.md               📖 Elméleti áttekintés
└── workshop.md               🛠️ Gyakorlati workshop
```

## ✨ Amit már használhatsz

### AuthContext

```jsx
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { user, login, logout, refreshUser, isAuthenticated } = useAuth();
  // ...
}
```

### API Services

```jsx
import { courseService, userService, mentorService } from "../services/api";

// Kurzusok lekérése
const response = await courseService.getAllCourses();

// User adatok
const response = await userService.getCurrentUser();
```

### Polling Hook

```jsx
import { usePolling } from "../hooks/usePolling";

usePolling(fetchData, 30000); // 30 másodpercenként
```

## 🎨 Chart.js

A Chart.js már telepítve és konfigurálva van. Példa a Dashboard-on:

```jsx
import { Line, Doughnut } from "react-chartjs-2";
```

## 🔗 Hasznos linkek

- **Backend API dokumentáció**: `assets/api/skillshare-academy-api.yaml`
- **Wireframe-ek**: `assets/wireframes/`
- **LinkedIn Widget**: `public/third-party/linkedin-share.js`
- **Elméleti háttér**: `module-3/overview.md`
- **Workshop feladatok**: `module-3/workshop.md`

## ❓ Gyakori problémák

### Backend nem elérhető

```bash
cd assets/backend-solution
docker compose restart
```

### Chart.js hiba

Chart.js már telepítve van és be van konfigurálva, csak importálni kell.

### Polling nem működik

A `usePolling` hook már implementálva van - csak használd!

## 📝 Következő lépések

1. Nyisd meg a `module-3/workshop.md` fájlt
2. Kövesd a lépésről lépésre útmutatót
3. Ha elakadsz, nézd meg az elméleti hátteret: `module-3/overview.md`

Sok sikert a 3. modulhoz! 🚀

---

> **Megjegyzés:** Ez a branch a 2. modul teljes megoldását tartalmazza. Ha szeretnéd látni az eredeti kiindulási állapotot, váltsd át a `module-2-start` branch-re.
