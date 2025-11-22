import { createContext, useState, useContext, useEffect } from "react";
import { authService, userService } from "../services/api";

// 1. Context létrehozása
const AuthContext = createContext();

// 2. Provider komponens
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Token ellenőrzése és felhasználó betöltése oldal betöltéskor
  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem("token");

      if (savedToken) {
        setToken(savedToken);

        try {
          const response = await userService.getCurrentUser();

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
          } else {
            // Token érvénytelen, töröljük
            localStorage.removeItem("token");
            setToken(null);
          }
        } catch (error) {
          console.error("Error loading user:", error);
          localStorage.removeItem("token");
          setToken(null);
        }
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  // Login függvény
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      if (response.status === 200) {
        const data = await response.json();

        // Token és user mentése
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);

        return { success: true };
      }

      if (response.status === 401) {
        throw new Error("Hibás email vagy jelszó");
      }

      if (response.status === 422) {
        const data = await response.json();
        throw new Error(data.message || "Validációs hiba");
      }

      throw new Error("Hiba történt a bejelentkezés során");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Register függvény
  const register = async (name, email, password) => {
    try {
      const response = await authService.register(name, email, password);

      if (response.status === 201) {
        const data = await response.json();
        return data;
      }

      if (response.status === 400) {
        throw new Error("A felhasználó már létezik");
      }

      if (response.status === 422) {
        const data = await response.json();
        throw new Error(data.message || "Validációs hiba");
      }

      throw new Error("Hiba történt a regisztráció során");
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  // Logout függvény
  const logout = async () => {
    try {
      // Hívjuk a backend logout endpoint-ot (token revocation)
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Ha a backend hívás sikertelen, akkor is töröljük a tokent
    } finally {
      // Mindenképp töröljük a tokent a frontenden
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  // Felhasználó adatainak frissítése (pl. kredit változás után)
  const refreshUser = async () => {
    try {
      const response = await userService.getCurrentUser();
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Custom hook a Context használatához
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
