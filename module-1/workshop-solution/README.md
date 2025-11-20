# SkillShare Academy - Module 1 Solution

Ez a mappa tartalmazza az 1. modul végállapotát, amely a 2. modul kiindulópontja.

## Telepítés

```bash
npm install
```

## Futtatás

```bash
npm run dev
```

Az alkalmazás elérhető lesz: `http://localhost:5173`

## Tesztelés

### Bejelentkezés tesztelése:

1. Nyisd meg: `http://localhost:5173`
2. Automatikusan átirányít a login oldalra (mivel nincs token)
3. Kattints a "Bejelentkezés" gombra
4. Teszt token kerül beállításra, átirányít a dashboard-ra

### Védett route-ok tesztelése:

- Próbáld meg közvetlenül megnyitni: `http://localhost:5173/dashboard`
- Az `authMiddleware` ellenőrzi a tokent
- Ha nincs token, átirányít a login oldalra

### Navigáció tesztelése:

- Dashboard, Kurzusok, Mentorok menüpontok működnek
- NavLink automatikusan jelzi az aktív oldalt
- Kijelentkezés törli a tokent és visszairányít

## Implementált funkciók

✅ React Router v7 Data Router minta
✅ Middleware-alapú hitelesítés (`authMiddleware`)
✅ Nested route-ok (`children`)
✅ 6 oldal: Login, Register, Dashboard, Courses, Course Details, Mentors
✅ Layout komponens Outlet-tel
✅ Navigation komponens NavLink-ekkel
✅ Alap CSS stílusok
✅ Védett route-ok middleware-rel

## Projekt struktúra

```
src/
├── components/
│   ├── Layout.jsx
│   └── Navigation.jsx
├── middleware/
│   └── authMiddleware.js
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── CoursesPage.jsx
│   ├── CourseDetailsPage.jsx
│   └── MentorsPage.jsx
├── contexts/ (később)
├── hooks/ (később)
├── services/ (később)
├── App.jsx
├── main.jsx
└── index.css
```

## Következő lépések (Modul 2)

A 2. modulban hozzá fogjuk adni:

- Loaders - adatbetöltés a komponens renderelése előtt
- Actions - form kezelés beépített újratöltéssel
- AuthContext - globális állapotkezelés
- API integráció - valódi backend hívások
- Validáció - form mezők ellenőrzése

## Megjegyzések

- A token most lokálisan tárolódik (`localStorage`)
- Login és Register most csak teszt tokent állítanak be
- A 2. modulban valódi API hívásokkal helyettesítjük ezeket
- Chart.js-t és LinkedIn widget-et később integrálunk

