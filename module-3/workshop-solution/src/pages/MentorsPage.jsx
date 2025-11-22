import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { mentorService, userService } from "../services/api";
import { usePolling } from "../hooks/usePolling";

function MentorsPage() {
  const { refreshUser } = useAuth();
  const [availableSessions, setAvailableSessions] = useState([]);
  const [bookedSessions, setBookedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadAvailableSessions = async () => {
    try {
      const response = await mentorService.getAvailableSessions();

      if (response.ok) {
        const data = await response.json();
        // Az API { sessions: [...] } formátumban adja vissza
        setAvailableSessions(data.sessions || data);
        setLastUpdate(new Date());
        setError("");
      } else {
        setError("Nem sikerült betölteni az elérhető időpontokat");
      }
    } catch (error) {
      console.error("Error loading available sessions:", error);
      setError("Hálózati hiba történt");
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([loadAvailableSessions(), loadBookedSessions()]);
    } catch (err) {
      console.error("Error loading all data:", err);
    }
    setLoading(false);
  };

  const loadBookedSessions = async () => {
    try {
      const response = await userService.getCurrentUser();

      if (response.ok) {
        const data = await response.json();
        const sessions = data.sessions;
        setBookedSessions(sessions);
        setError("");
      } else {
        setError("Nem sikerült betölteni a foglalásokat");
      }
    } catch (error) {
      console.error("Error loading booked sessions:", error);
      setError("Hálózati hiba történt");
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Polling - frissítés 30 másodpercenként (elérhető és foglalt időpontok)
  usePolling(() => {
    loadAvailableSessions();
    loadBookedSessions();
    setLastUpdate(new Date());
  }, 30000);

  const handleBookSession = async (sessionId) => {
    setBookingId(sessionId);
    setError("");

    try {
      const response = await mentorService.bookSession(sessionId);

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Sikeres foglalás!");
        // Frissítsd az adatokat és a felhasználó adatait
        await loadAllData();
        await refreshUser();
      } else if (response.status === 403) {
        alert("Nem elég kredit a foglaláshoz");
      } else if (response.status === 409) {
        alert("Ez az időpont már foglalt");
      } else {
        alert("Nem sikerült lefoglalni az időpontot");
      }
    } catch (error) {
      console.error("Error booking session:", error);
      alert("Hálózati hiba történt");
    } finally {
      setBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page mentors-page">
        <h1>Mentor foglalás</h1>
        <div className="loading-spinner">Betöltés...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page mentors-page">
        <h1>Mentor foglalás</h1>
        <div className="error-message">⚠️ {error}</div>
      </div>
    );
  }

  return (
    <div className="page mentors-page">
      <h1>Mentor foglalás</h1>
      <p className="last-update">
        Utolsó frissítés: {lastUpdate.toLocaleTimeString()}
        <br />
        <small>(Automatikus frissítés 30 másodpercenként)</small>
      </p>

      {bookedSessions.length > 0 && (
        <section className="booked-sessions">
          <h2>Foglalt időpontjaim</h2>
          {bookedSessions.length === 0 ? (
            <p>Jelenleg nincs foglalásod.</p>
          ) : (
            <div className="sessions-grid">
              {bookedSessions.map((item) => {
                const s = item.session;
                return (
                  <div key={item.id} className="session-card booked">
                    <div className="session-info">
                      <h3>{s.mentorName}</h3>
                      <p>
                        <strong>Időpont:</strong>{" "}
                        {formatDateTime(s.sessionDate)}
                      </p>
                      <p>
                        <strong>Állapot:</strong> {item.status}
                      </p>
                      <p>
                        <strong>Költség:</strong> {item.creditsPaid} kredit
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section className="available-sessions">
        <h2>Elérhető időpontok</h2>
        {availableSessions.length === 0 ? (
          <p>Jelenleg nincs elérhető időpont.</p>
        ) : (
          <div className="sessions-grid">
            {availableSessions.map((session) => (
              <div key={session.id} className="session-card">
                <div className="session-info">
                  <h3>{session.mentorName}</h3>
                  <p>
                    <strong>Időpont:</strong>{" "}
                    {formatDateTime(session.sessionDate)}
                  </p>
                  <p>
                    <strong>Időtartam:</strong> {session.durationMinutes} perc
                  </p>
                  <p>
                    <strong>Költség:</strong> {session.creditCost} kredit
                  </p>
                  <p>
                    <strong>Szakterület:</strong> {session.expertise}
                  </p>
                  <p>
                    <strong>Szint:</strong>{" "}
                    {getExperienceLabel(session.experienceLevel)}
                  </p>
                </div>
                <div className="session-actions">
                  <button
                    onClick={() => handleBookSession(session.id)}
                    disabled={bookingId === session.id || !session.isAvailable}
                    className="btn btn-primary"
                  >
                    {bookingId === session.id
                      ? "Foglalás..."
                      : !session.isAvailable
                      ? "Nem elérhető"
                      : "Foglalás"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getExperienceLabel(level) {
  const labels = {
    junior: "Junior",
    mid: "Mid-level",
    senior: "Senior",
  };
  return labels[level] || level;
}

export default MentorsPage;
