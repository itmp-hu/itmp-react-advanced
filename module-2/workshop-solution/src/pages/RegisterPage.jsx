import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validáció
    if (!name || !email || !password || !confirmPassword) {
      setError("Minden mező kitöltése kötelező");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("A jelszavak nem egyeznek");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie");
      setLoading(false);
      return;
    }

    const result = await register(name, email, password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="page register-page">
      <div className="register-container">
        <h1>Regisztráció</h1>
        <p>Ingyenes regisztráció</p>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Teljes név</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kovács János"
              disabled={loading}
            />
          </div>

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
              placeholder="Legalább 6 karakter"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Jelszó megerősítése</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Jelszó újra"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Regisztráció..." : "Regisztráció"}
          </button>
        </form>

        <p className="login-link">
          Már van fiókod? <Link to="/login">Jelentkezz be!</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;

