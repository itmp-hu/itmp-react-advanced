# Module 1 Starting Point

Ez a branch tartalmazza a **Module 1 workshop kezdőállapotát**.

## Mit tartalmaz ez a kiindul ópont?

Ez egy frissen inicializált **Vite + React** projekt, amely azonos azzal, amit a `npm create vite@latest` parancs generál.

### Telepített csomagok:
- React 19.2.0
- React DOM 19.2.0
- Vite 7.2.2
- ESLint (konfigurációval)

### Fájlstruktúra:
```
skillshare-academy/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
```

## Hogyan használd?

1. **Klónozd a repót és válaszd ki ezt a branchet:**
   ```bash
   git clone <repo-url>
   cd skillshare-academy
   git checkout module-1-start
   ```

2. **Telepítsd a függőségeket:**
   ```bash
   npm install
   ```

3. **Indítsd el a fejlesztői szervert:**
   ```bash
   npm run dev
   ```

4. **Nyisd meg a böngészőben:**
   ```
   http://localhost:5173
   ```

## Mi a következő lépés?

Ezt a kiindulópontot használva kövesd a **Module 1 Workshop** (`module-1/workshop.md`) útmutatóját, ahol lépésről lépésre építed fel a SkillShare Academy alkalmazás alapstruktúráját.

## Workshop során készülő funkciók:

A Module 1 workshop során a következőket fogod elkészíteni:

- ✅ React Router telepítése és konfigurálása
- ✅ Projekt mappa struktúra (components, pages, contexts, hooks, services, styles)
- ✅ 6 oldal komponens (Login, Register, Dashboard, Courses, CourseDetails, Mentors)
- ✅ Layout és Navigation komponensek
- ✅ Protected Route implementáció
- ✅ Alap CSS stílusok

## Fontos megjegyzések:

- **NE módosítsd ezt a branchet!** Ez a tiszta kiindulópont mindenki számára.
- A workshop során a saját branchedben vagy a main branchben dolgozz.
- Ha elakadsz, mindig visszatérhetsz ehhez a kiindulóponthoz.

## Ellenőrzés:

Ha minden rendben van, akkor:
- A `npm run dev` parancs elindítja a szervert
- A böngészőben megjelenik egy Vite + React alapértelmezett oldal
- A fájlok módosításakor a böngésző automatikusan frissül (Hot Module Replacement)

Készen állsz a workshop megkezdésére! 🚀

