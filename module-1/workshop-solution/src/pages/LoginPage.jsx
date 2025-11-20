import { useNavigate } from "react-router";
import { useEffect } from "react";

function LoginPage() {
  const navigate = useNavigate();

  // Ha már be van jelentkezve, irányítsuk át a dashboard-ra
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Később itt lesz a valódi API hívás
    localStorage.setItem("token", "test-token-1234567890");
    navigate("/dashboard");
  };

  return (
    <div className="page login-page">
      <div className="login-container">
        <h1>Bejelentkezés</h1>
        <p>SkillShare Academy tanulási platform</p>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input type="email" id="email" placeholder="email@példa.hu" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input type="password" id="password" placeholder="Jelszó" />
          </div>
          <button type="submit" className="btn btn-primary">
            Bejelentkezés
          </button>
        </form>
        <p className="register-link">
          Még nincs fiókod? <a href="/register">Regisztrálj ingyen!</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

