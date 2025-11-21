import { useAuth } from "../contexts/AuthContext";

function CoursesPage() {
  const { user } = useAuth();

  return (
    <div className="page courses-page">
      <h1>Kurzusok</h1>

      <p style={{ marginBottom: "2rem", color: "var(--secondary-color)" }}>
        Helló {user?.name}! Itt láthatod az elérhető kurzusokat.
      </p>

      <div className="courses-filters">
        <input type="text" placeholder="Keresés..." />
        <select>
          <option>Minden kategória</option>
          <option>Frontend</option>
          <option>Backend</option>
          <option>DevOps</option>
        </select>
      </div>

      <div className="courses-grid">
        <div className="course-card">
          <h3>React alapok</h3>
          <p>Tanuld meg a React alapjait</p>
          <div className="course-meta">
            <span>12 fejezet</span>
            <span>6 óra</span>
          </div>
          <button className="btn btn-primary">Részletek</button>
        </div>

        <div className="course-card">
          <h3>Node.js haladó</h3>
          <p>Haladó backend fejlesztés</p>
          <div className="course-meta">
            <span>15 fejezet</span>
            <span>8 óra</span>
          </div>
          <button className="btn btn-primary">Részletek</button>
        </div>

        <div className="course-card">
          <h3>TypeScript mesteri szint</h3>
          <p>Típusbiztos kód írása</p>
          <div className="course-meta">
            <span>10 fejezet</span>
            <span>5 óra</span>
          </div>
          <button className="btn btn-primary">Részletek</button>
        </div>
      </div>
    </div>
  );
}

export default CoursesPage;
