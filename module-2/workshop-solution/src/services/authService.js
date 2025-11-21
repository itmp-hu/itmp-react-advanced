const MOCK_USERS = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "password123",
    credits: 150,
    enrolledCoursesCount: 3,
    completedChaptersCount: 12,
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    credits: 200,
    enrolledCoursesCount: 5,
    completedChaptersCount: 25,
  },
];

// Simulált késleltetés (mintha hálózati kérés lenne)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Login függvény - szimulálja a backend login endpoint-ot
export const login = async (email, password) => {
  await delay(800); // Szimuláljuk a hálózati késleltetést

  // Keressük meg a usert
  const user = MOCK_USERS.find((u) => u.email === email);

  // Ha nincs ilyen user
  if (!user) {
    throw new Error("Hibás email vagy jelszó");
  }

  // Ha rossz a jelszó
  if (user.password !== password) {
    throw new Error("Hibás email vagy jelszó");
  }

  // Generálunk egy mock tokent
  const token = `mock-token-${user.id}-${Date.now()}`;

  // Visszaadjuk a user adatokat (jelszó nélkül) és a tokent
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token: token,
  };
};

// Register függvény - szimulálja a backend register endpoint-ot
export const register = async (name, email, password) => {
  await delay(800); // Szimuláljuk a hálózati késleltetést

  // Ellenőrizzük, hogy létezik-e már ilyen email
  const existingUser = MOCK_USERS.find((u) => u.email === email);

  if (existingUser) {
    throw new Error("Ez az email cím már használatban van");
  }

  // Új user létrehozása
  const newUser = {
    id: MOCK_USERS.length + 1,
    name,
    email,
    password,
    credits: 100, // Kezdő kreditek
    enrolledCoursesCount: 0,
    completedChaptersCount: 0,
  };

  // Mock adatbázishoz hozzáadjuk
  MOCK_USERS.push(newUser);

  return {
    success: true,
    message: "Sikeres regisztráció! Most már bejelentkezhetsz.",
  };
};

// Get user by token - szimulálja a backend /users/me endpoint-ot
export const getUserByToken = async (token) => {
  await delay(500);

  // Token formátum: mock-token-{userId}-{timestamp}
  const userId = parseInt(token.split("-")[2]);

  const user = MOCK_USERS.find((u) => u.id === userId);

  if (!user) {
    throw new Error("Érvénytelen token");
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Logout függvény - szimulálja a backend logout endpoint-ot
export const logout = async () => {
  await delay(300);
  // Mock logout - nincs mit csinálni, a frontend törli a tokent
  return { success: true };
};