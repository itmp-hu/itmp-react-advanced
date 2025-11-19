import { useState, useEffect, useCallback } from "react";
import { mentorService } from "../services/api";
import { usePolling } from "../hooks/usePolling";
import { useAuth } from "../hooks/useAuth";

function MentorsPage() {
  const [availableSessions, setAvailableSessions] = useState([]);
  const [bookedSessions, setBookedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null); // ID of session being booked
  const [lastUpdate, setLastUpdate] = useState(null);

  const { refreshUser } = useAuth();

  // Foglalások lekérése
  const loadBookings = useCallback(async () => {
    try {
      const response = await mentorService.getBookedSessions();
      if (response.ok) {
        const data = await response.json();
        setBookedSessions(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  }, []);

  // 30 másodpercenként frissítjük a foglalásokat
  usePolling(loadBookings, 30000);

  // Elérhető időpontok betöltése
  useEffect(() => {
    loadAvailableSessions();
  }, []);

  const loadAvailableSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mentorService.getAvailableSessions();

      if (response.ok) {
        const data = await response.json();
        setAvailableSessions(data);
      } else if (response.status === 401) {
        setError("Kérlek jelentkezz be újra");
      } else {
        setError("Nem sikerült betölteni az elérhető időpontokat");
      }
    } catch (err) {
      setError("Hálózati hiba történt");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (sessionId) => {
    try {
      setBooking(sessionId);

      const response = await mentorService.bookSession(sessionId);

      if (response.status === 200) {
        alert("Sikeres foglalás! A foglalás megerősítésre vár.");
        // Frissítsük az adatokat
        await loadAvailableSessions();
        await loadBookings();
        await refreshUser();
      } else if (response.status === 403) {
        alert("Már foglaltál erre az időpontra");
      } else if (response.status === 422) {
        const data = await response.json();
        alert(data.message || "Nem elég kredit a foglaláshoz");
      } else if (response.status === 404) {
        alert("Ez az időpont már nem elérhető");
        await loadAvailableSessions();
      } else {
        alert("Hiba történt a foglalás során");
      }
    } catch (error) {
      alert("Hálózati hiba történt");
    } finally {
      setBooking(null);
    }
  };

  if (loading) {
    return (
      <div className="page mentors-page">
        <h1>Mentor foglalás</h1>
        <p>Betöltés...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page mentors-page">
        <h1>Mentor foglalás</h1>
        <div className="error-message">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page mentors-page">
      <h1>Mentor foglalás</h1>

      {/* Polling indikátor */}
      <div className="polling-indicator">
        <span className="status-badge">
          🔄 Automatikus frissítés aktív (30 mp)
        </span>
        {lastUpdate && (
          <span className="last-update">
            Utolsó frissítés: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Elérhető időpontok */}
      <div className="mentors-section">
        <h2>Elérhető időpontok</h2>
        {availableSessions.length === 0 ? (
          <p>Jelenleg nincs elérhető időpont</p>
        ) : (
          availableSessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-info">
                <h3>{session.mentor_name}</h3>
                <p><strong>Időpont:</strong> {formatDateTime(session.session_time)}</p>
                <p><strong>Időtartam:</strong> {session.duration_minutes} perc</p>
                <p><strong>Költség:</strong> {session.cost_credits} kredit</p>
                <p><strong>Szakterület:</strong> {session.expertise}</p>
              </div>
              <div className="session-actions">
                <button className="btn btn-secondary" disabled>
                  Profil megtekintése (később)
                </button>
                <button
                  onClick={() => handleBookSession(session.id)}
                  className="btn btn-primary"
                  disabled={booking === session.id}
                >
                  {booking === session.id ? "Foglalás..." : "Foglalás"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Foglalt időpontok */}
      <div className="booked-sessions">
        <h2>Foglalt időpontjaim</h2>
        {bookedSessions.length === 0 ? (
          <p>Még nincs foglalt időpontod.</p>
        ) : (
          bookedSessions.map((booking) => (
            <div key={booking.id} className={`session-card booking-${booking.status}`}>
              <div className="session-info">
                <h3>{booking.mentor_name}</h3>
                <p><strong>Időpont:</strong> {formatDateTime(booking.session_time)}</p>
                <p><strong>Időtartam:</strong> {booking.duration_minutes} perc</p>
                <p><strong>Költség:</strong> {booking.cost_credits} kredit</p>
                <p>
                  <strong>Státusz:</strong>{" "}
                  <span className={`status-label status-${booking.status}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getStatusLabel(status) {
  const labels = {
    pending: "Függőben",
    confirmed: "Megerősítve",
    rejected: "Elutasítva",
    completed: "Befejezve"
  };
  return labels[status] || status;
}

export default MentorsPage;
