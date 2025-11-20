/**
 * RegisterPage - Kiinduló állapot
 * 
 * NINCS BENNE:
 * - useNavigate hook (még nincs React Router!)
 * - useEffect átirányítás (ezt később fogod hozzáadni)
 * 
 * FONTOS: A handleRegister most csak egy teszt tokent állít be
 */
function RegisterPage() {
  const handleRegister = (e) => {
    e.preventDefault();
    // Teszt token beállítása
    localStorage.setItem("token", "test-token-1234567890");
    alert("Regisztráltál! (Később itt routing lesz)");
    // Később itt lesz: navigate("/dashboard");
  };

  return (
    <div className="page register-page">
      <div className="register-container">
        <h1>Regisztráció</h1>
        <p>Ingyenes regisztráció</p>
        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Teljes név</label>
            <input type="text" id="name" placeholder="Kovács János" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input type="email" id="email" placeholder="email@példa.hu" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input type="password" id="password" placeholder="Jelszó" />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Jelszó megerősítése</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Jelszó újra"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Regisztráció
          </button>
        </form>
        <p className="login-link">
          Már van fiókod? <a href="/login">Jelentkezz be!</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;

