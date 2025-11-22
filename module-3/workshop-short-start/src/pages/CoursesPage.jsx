import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { courseService } from "../services/api";

function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  // Kurzusok betöltése
  const loadCourses = async () => {
    setError("");

    try {
      const response = await courseService.getAllCourses();

      if (response.ok) {
        const data = await response.json();
        // Az API { courses: [...] } formátumban adja vissza
        setCourses(data.courses || data);
      } else {
        setError("Nem sikerült betölteni a kurzusokat");
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      setError("Hálózati hiba történt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    setEnrollError("");
    setEnrollingCourseId(courseId);

    try {
      const response = await courseService.enrollInCourse(courseId);

      if (response.ok) {
        // refresh list
        await loadCourses();
      } else if (response.status === 403) {
        setEnrollError("Már beiratkoztál erre a kurzusra");
      } else {
        setEnrollError("Nem sikerült beiratkozni a kurzusra");
      }
    } catch (err) {
      console.error("Error enrolling:", err);
      setEnrollError("Hálózati hiba történt");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Szűrés és keresés
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty =
      !difficultyFilter || course.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="page courses-page">
        <h1>Kurzusok</h1>
        <div className="loading-spinner">Betöltés...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page courses-page">
        <h1>Kurzusok</h1>
        <div className="error-message">
          ⚠️ {error}
          <button
            onClick={loadCourses}
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Újrapróbálás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page courses-page">
      <h1>Kurzusok</h1>

      <p style={{ marginBottom: "2rem", color: "var(--secondary-color)" }}>
        Helló {user?.name}! Itt láthatod az elérhető kurzusokat.
      </p>

      <div className="courses-filters">
        <input
          type="text"
          placeholder="Keresés..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="">Minden nehézség</option>
          <option value="beginner">Kezdő</option>
          <option value="intermediate">Haladó</option>
          <option value="advanced">Szakértő</option>
        </select>
      </div>

      {enrollError && <div className="error-message">⚠️ {enrollError}</div>}

      {filteredCourses.length === 0 ? (
        <div className="no-results">
          <p>Nincs találat a keresési feltételeknek megfelelően.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <span>📚 {course.totalChapters} fejezet</span>
                <span>⭐ {getDifficultyLabel(course.difficulty)}</span>
              </div>
              {course.isEnrolled ? (
                <Link
                  to={`/courses/${course.id}`}
                  className="btn btn-secondary"
                >
                  Folytatás
                </Link>
              ) : (
                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrollingCourseId === course.id}
                  className="btn btn-primary"
                >
                  {enrollingCourseId === course.id
                    ? "Beiratkozás..."
                    : "Beiratkozás"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getDifficultyLabel(difficulty) {
  const labels = {
    beginner: "Kezdő",
    intermediate: "Haladó",
    advanced: "Szakértő",
  };
  return labels[difficulty] || difficulty;
}

export default CoursesPage;
