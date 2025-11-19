import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Ha már be van jelentkezve, irányítsuk át
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Egyszerű validáció
    if (!email || !password) {
      setError("Minden mező kitöltése kötelező");
      setLoading(false);
      return;
    }

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="page login-page">
      <div className="login-container">
        <h1>Bejelentkezés</h1>
        <p>SkillShare Academy tanulási platform</p>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@példa.hu"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Jelszó"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Bejelentkezés..." : "Bejelentkezés"}
          </button>
        </form>

        <p className="register-link">
          Még nincs fiókod? <Link to="/register">Regisztrálj ingyen!</Link>
        </p>

        <div className="test-accounts">
          <p><small>Teszt fiókok (jelszó: password123):</small></p>
          <p><small>alice.smith@example.com</small></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

