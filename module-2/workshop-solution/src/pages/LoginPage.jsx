import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  console.log("isAuthenticated in LoginPage:", isAuthenticated);
  const navigate = useNavigate();

  // Ha már be van jelentkezve, irányítsuk a dashboard-ra
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Form validáció
  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Az email cím kötelező";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Érvénytelen email formátum";
    }

    if (!password) {
      newErrors.password = "A jelszó kötelező";
    } else if (password.length < 6) {
      newErrors.password =
        "A jelszónak legalább 6 karakter hosszúnak kell lennie";
    }

    return newErrors;
  };

  // Form elküldés
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Validáció
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Login API hívás (mock service az AuthContext-en keresztül)
    setLoading(true);
    try {
      await login(email, password);
      // A navigate már az AuthContext-ben van kezelve
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="login-container">
        <h1>Bejelentkezés</h1>
        <p>SkillShare Academy tanulási platform</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              className={errors.email ? "input-error" : ""}
              placeholder="email@példa.hu"
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              className={errors.password ? "input-error" : ""}
              placeholder="Jelszó"
              disabled={loading}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Bejelentkezés..." : "Bejelentkezés"}
          </button>
        </form>

        <p className="register-link">
          Még nincs fiókod? <Link to="/register">Regisztrálj ingyen!</Link>
        </p>

        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#f0f9ff",
            borderRadius: "0.5rem",
          }}
        >
          <p style={{ fontSize: "0.875rem", color: "#0369a1" }}>
            <strong>Teszt bejelentkezés:</strong>
            <br />
            Email: alice@example.com vagy john@example.com
            <br />
            Jelszó: password123
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
