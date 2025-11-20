/**
 * LoginPage - Kiinduló állapot
 * 
 * NINCS BENNE:
 * - useNavigate hook (még nincs React Router!)
 * - useEffect átirányítás (ezt később fogod hozzáadni)
 * 
 * FONTOS: A handleLogin most csak egy teszt tokent állít be
 */
function LoginPage() {
  const handleLogin = (e) => {
    e.preventDefault();
    // Teszt token beállítása
    localStorage.setItem("token", "test-token-1234567890");
    alert("Bejelentkeztél! (Később itt routing lesz)");
    // Később itt lesz: navigate("/dashboard");
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

