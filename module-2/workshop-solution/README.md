# SkillShare Academy - Module 2 Solution

## Áttekintés

Ez a Module 2 teljes megoldása, amely tartalmazza:

- ✅ **AuthContext** - Globális hitelesítési állapot kezelés
- ✅ **Login & Register** - Form validációval és hibakezeléssel
- ✅ **Protected Routes** - ProtectedRoute komponenssel
- ✅ **Navigation** - Felhasználói állapot megjelenítése
- ✅ **Dashboard** - Felhasználói adatok megjelenítése
- ✅ **Error Handling** - Professional error messages

## Telepítés

```bash
npm install
```

## Fejlesztői szerver indítása

```bash
npm run dev
```

## Backend szükségessége

Ez az alkalmazás egy backend API-ra épül. Indítsd el a backend szervert:

```bash
# Backend mappában
cd backend
npm install
npm start
```

A backend az `http://localhost:5000` címen fut.

## Funkciók

### AuthContext

- Globális hitelesítési state
- Login/Register/Logout műveletek
- Token perzisztencia localStorage-ban
- Automatikus user adatok betöltése

### Oldalak

1. **LoginPage** - Email/jelszó validációval
2. **RegisterPage** - Teljes név, email, jelszó validációval
3. **DashboardPage** - Felhasználói adatok megjelenítése
4. **CoursesPage** - Kurzuslista (statikus)
5. **CourseDetailsPage** - Kurzus részletek (statikus)
6. **MentorsPage** - Mentor foglalás (statikus)

### Komponensek

- **AuthContext** - Context provider
- **ProtectedRoute** - Route védelem
- **Navigation** - Dinamikus navigáció auth state alapján
- **Layout** - Oldal layout Navigation-nel

## Következő lépések (Module 3)

- API integráció a kurzusokhoz és mentorokhoz
- Chart.js diagramok
- Haladó form kezelés
- Optimistic UI updates

## Tesztelési adatok

Backend teszteléshez használható:

```
Email: test@example.com
Password: password123
```

(Vagy regisztrálj új felhasználót!)

