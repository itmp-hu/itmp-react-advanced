import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService, userService } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Token ellenőrzése és felhasználó betöltése oldal betöltéskor
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      
      if (token) {
        try {
          const response = await userService.getCurrentUser();
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token érvénytelen, töröljük
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Error loading user:", error);
          localStorage.removeItem("token");
        }
      }
      
      setLoading(false);
    }

    loadUser();
  }, []);

  // Bejelentkezés
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      if (response.status === 200) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        setUser(data.user);
        navigate("/dashboard");
        return { success: true };
      }

      if (response.status === 401) {
        return { success: false, error: "Hibás email vagy jelszó" };
      }

      if (response.status === 422) {
        const data = await response.json();
        return { success: false, error: data.message || "Validációs hiba" };
      }

      return { success: false, error: "Hiba történt a bejelentkezés során" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Hálózati hiba történt" };
    }
  };

  // Regisztráció
  const register = async (name, email, password) => {
    try {
      const response = await authService.register(name, email, password);

      if (response.status === 201) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        setUser(data.user);
        navigate("/dashboard");
        return { success: true };
      }

      if (response.status === 400) {
        return { success: false, error: "A felhasználó már létezik" };
      }

      if (response.status === 422) {
        const data = await response.json();
        return { success: false, error: data.message || "Validációs hiba" };
      }

      return { success: false, error: "Hiba történt a regisztráció során" };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Hálózati hiba történt" };
    }
  };

  // Kijelentkezés
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  // Felhasználó adatainak frissítése (pl. kredit változás után)
  const refreshUser = async () => {
    try {
      const response = await userService.getCurrentUser();
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

