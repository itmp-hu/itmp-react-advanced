# Projekt előkészítési útmutató

## VS Code és bővítmények telepítése

- Töltsd le és telepítsd a Visual Studio Code-ot: https://code.visualstudio.com/
- Telepítsd az alábbi ajánlott bővítményeket a VS Code Extensions menüpontjából:
  - **ES7+ React/Redux/React-Native snippets** - React kódrészletek gyors írásához
  - **Prettier - Code formatter** - Automatikus kód formázáshoz
  - **Auto Rename Tag** - HTML/JSX tag párok automatikus átnevezéséhez

## Git telepítése

- Töltsd le és telepítsd a Git-et: https://git-scm.com/download/win
- A telepítés során fogadd el az alapértelmezett beállításokat
- Telepítés után nyisd meg a parancsort vagy PowerShellt, és állítsd be a felhasználói adataidat:
  ```
  git config --global user.name "Teljes Neved"
  git config --global user.email "email@példa.hu"
  ```
- Ellenőrizd a telepítést: `git --version`

## Node.js telepítése

- Töltsd le és telepítsd a Node.js LTS verzióját: https://nodejs.org/
- Telepítés után ellenőrizd a verziókat a parancssorban:
  ```
  node --version
  npm --version
  ```
- Ajánlott minimális verzió: Node.js 18.x vagy újabb

## Docker Desktop telepítése

- Töltsd le és telepítsd a Docker Desktop-ot Windows-ra: https://www.docker.com/products/docker-desktop/
- A telepítés során engedélyezd a WSL 2 használatát, ha a rendszer kéri
- A telepítés után indítsd el a Docker Desktop-ot
- Ellenőrizd, hogy a Docker fut-e: `docker --version` és `docker compose version`
- **Fontos:** A képzés előtt győződj meg róla, hogy a Docker Desktop fut a háttérben!

## GitHub account létrehozása

- Ha még nincs GitHub fiókod, regisztrálj a https://github.com/signup oldalon
- Használj olyan email címet, amit rendszeresen ellenőrzöl
- **Fontos:** A GitHub fiókodra lesz szükség a MITS platformra való bejelentkezéshez!

## MITS (Marketable IT Skills) regisztráció

- A GitHub azonosítód segítségével regisztrálj a mits.skillsit.hu platformon.
- A GitHub azonosítás után az űrlapon add meg a kapott kódot az "I was invited to the MITS pilot program" mezőben.
- Töltsd ki a jelentkezés lapot értelemszerűen, majd kattints a Submit gombra.

## A fejlesztési környezet beállítása

A frontend feladat két meglévő backendet és egy adatbázist használ, melyeket Docker containerek fognak biztosítani a forntend fejlesztéshez.
A konténereke elindításához az alábbi lépéseket végezd el:

- A feladatok közül válaszd ki a "ES2025 TRAINING HU S17 - Module D" feladatot
- Kattints a Project Description fülre.
- Kattinst a Download Assets gombra a teljes projektanyag letöltéséhez zip formátumban.
- Csomagold ki a letöltött zipet.
- Lépj be az assets/backend-solution mappába.
- Add ki a `docker compose up -d` parancsot.
- A backend működésének ellenőrzéséhez írd be a `http://localhost:5000/api/v1/health` címet.
- Az adatbázist a szintén konténerként futó PHPMyadminban tudod megnézni: `http://localhost:8888`
