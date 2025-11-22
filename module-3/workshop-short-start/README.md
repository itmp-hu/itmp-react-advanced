# SkillShare Academy - Module 3 Solution

Ez a SkillShare Academy alkalmazás 3. moduljának teljes megoldása.

## Funkciók

✅ **Valódi API integráció** - Backend REST API kommunikáció  
✅ **Hitelesítés** - Login és Register a backend API-val  
✅ **Dashboard Chart.js-szel** - Line és Doughnut grafikonok  
✅ **Kurzuskatalógus** - Keresés, szűrés, beiratkozás  
✅ **Kurzus részletek** - Fejezetek, befejezés, kredit szerzés  
✅ **LinkedIn Share Widget** - Befejezett fejezetek megosztása  
✅ **Mentor foglalás** - 30 másodperces polling-gal  
✅ **Hibakezelés** - HTTP státuszkódok kezelése  
✅ **Loading állapotok** - Felhasználóbarát visszajelzések

## Telepítés

### 1. Backend indítása

Először indítsd el a backend API-t:

```bash
cd ../../assets/backend-solution
docker compose up -d
```

Ellenőrizd, hogy a backend fut:

```bash
curl http://localhost:5000/api/v1/health
```

### 2. Frontend telepítése

```bash
npm install
```

### 3. Fejlesztői szerver indítása

```bash
npm run dev
```

Az alkalmazás elérhető: `http://localhost:5173`

## Teszt felhasználók

A backend teszt felhasználókkal rendelkezik (jelszó mindenhol: `password123`):

- `alice.smith@example.com`
- `bob.jones@example.com`
- `charlie.brown@example.com`

## Projekt struktúra

```
src/
├── components/
│   ├── Layout.jsx
│   └── Navigation.jsx
├── contexts/
│   └── AuthContext.jsx
├── hooks/
│   └── usePolling.js
├── middleware/
│   └── authMiddleware.js
├── pages/
│   ├── CourseDetailsPage.jsx
│   ├── CoursesPage.jsx
│   ├── DashboardPage.jsx
│   ├── LoginPage.jsx
│   ├── MentorsPage.jsx
│   └── RegisterPage.jsx
├── services/
│   └── api.js
├── App.jsx
├── index.css
└── main.jsx
```

## Főbb változások a Module 2-höz képest

1. **Mock service lecserélése**: `authService.js` → `api.js`
2. **AuthContext frissítése**: Használja a valódi API-t
3. **Chart.js integráció**: Dashboard vizualizációk
4. **API service layer**: Központosított backend kommunikáció
5. **Polling**: Mentor foglalások automatikus frissítése
6. **LinkedIn Widget**: Third-party integráció
7. **Teljes CRUD**: Kurzusok, fejezetek, mentorok kezelése

## Architektúra

- **AuthContext**: Globális auth állapotkezelés (NEM használ `useNavigate`)
- **Komponensek**: Kezelik a navigációt sikeres műveletek után
- **API Service**: Elkülönített backend kommunikáció
- **Custom Hooks**: `usePolling` az időszakos frissítésekhez

## Build

Production build készítése:

```bash
npm run build
```

Preview módban futtatás:

```bash
npm run preview
```

## Megjegyzések

- A backend API-nak futnia kell a `http://localhost:5000` címen
- A LinkedIn Share Widget egy mock implementáció demonstrációs célokra
- A polling alapértelmezetten 30 másodpercenként frissít
