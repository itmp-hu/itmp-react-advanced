function MentorsPage() {
  return (
    <div className="page mentors-page">
      <h1>Mentor foglalás</h1>

      <div className="mentors-section">
        <h2>Elérhető mentorok</h2>
        <div className="mentor-card">
          <h3>Mentor neve</h3>
          <p>Szakterület: Web Development</p>
          <p>Óradíj: 10 kredit/óra</p>
          <div className="mentor-actions">
            <button className="btn btn-secondary" disabled>
              Profil megtekintése
            </button>
          </div>
        </div>
      </div>

      <div className="sessions-section">
        <h2>Elérhető időpontok</h2>
        <div className="session-card">
          <p>Időpont: 2025-11-25 14:00</p>
          <p>Időtartam: 1 óra</p>
          <p>Költség: 10 kredit</p>
          <button className="btn btn-primary">Foglalás</button>
        </div>
      </div>

      <div className="booked-sessions">
        <h2>Foglalt időpontjaim</h2>
        <p>Még nincs foglalt időpontod.</p>
      </div>
    </div>
  );
}

export default MentorsPage;

