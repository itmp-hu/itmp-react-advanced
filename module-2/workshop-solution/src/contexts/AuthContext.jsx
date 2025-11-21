import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router";

// 1. Context létrehozása
const AuthContext = createContext(undefined);

// 2. Provider komponens
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Alkalmazás indulásakor ellenőrizzük, van-e mentett token
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      // Token validálása és user adatok betöltése
      fetchUserData(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // User adatok betöltése az API-ból
  const fetchUserData = async (authToken) => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/users/me", {
        headers: {
          "X-API-Key": authToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        // Token érvénytelen, töröljük
        localStorage.removeItem("token");
        setToken(null);
      }
    } catch (error) {
      console.error("Hiba a user adatok betöltésekor:", error);
      localStorage.removeItem("token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Login funkció
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Hibás email vagy jelszó");
        }
        throw new Error("Hiba a bejelentkezés során");
      }

      const data = await response.json();

      // Token és user mentése
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);

      // Átirányítás a dashboard-ra
      navigate("/dashboard");

      return { success: true };
    } catch (error) {
      console.error("Login hiba:", error);
      throw error;
    }
  };

  // Register funkció
  const register = async (name, email, password) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Ez az email cím már használatban van");
        }
        throw new Error("Hiba a regisztráció során");
      }

      const data = await response.json();

      // Regisztráció után átirányítás a login oldalra
      navigate("/login");

      return {
        success: true,
        message: "Sikeres regisztráció! Most már bejelentkezhetsz.",
      };
    } catch (error) {
      console.error("Regisztráció hiba:", error);
      throw error;
    }
  };

  // Logout funkció
  const logout = async () => {
    try {
      // Opcionális: logout API hívás
      if (token) {
        await fetch("http://localhost:5000/api/v1/users/logout", {
          method: "POST",
          headers: {
            "X-API-Key": token,
          },
        });
      }
    } catch (error) {
      console.error("Logout hiba:", error);
    } finally {
      // Token és user törlése
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
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

