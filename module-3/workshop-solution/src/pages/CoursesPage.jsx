import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseService } from "../services/api";
import { useAuth } from "../hooks/useAuth";

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [enrolling, setEnrolling] = useState(null); // ID of course being enrolled

  const { refreshUser } = useAuth();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await courseService.getAllCourses();

      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else if (response.status === 401) {
        setError("Kérlek jelentkezz be újra");
      } else {
        setError("Nem sikerült betölteni a kurzusokat");
      }
    } catch (err) {
      setError("Hálózati hiba történt");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(courseId);

      const response = await courseService.enrollInCourse(courseId);

      if (response.status === 200) {
        alert("Sikeres beiratkozás!");
        // Frissítsük a kurzusok listáját és a felhasználó adatait
        await loadCourses();
        await refreshUser();
      } else if (response.status === 403) {
        alert("Már beiratkoztál erre a kurzusra");
      } else if (response.status === 422) {
        const data = await response.json();
        alert(data.message || "Nem elég kredit a beiratkozáshoz");
      } else {
        alert("Hiba történt a beiratkozás során");
      }
    } catch (error) {
      alert("Hálózati hiba történt");
    } finally {
      setEnrolling(null);
    }
  };

  // Szűrés és keresés
  const filteredCourses = courses.filter(course => {
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
        <h1>Kurzuskatalógus</h1>
        <p>Betöltés...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page courses-page">
        <h1>Kurzuskatalógus</h1>
        <div className="error-message">
          ⚠️ {error}
          <button onClick={loadCourses} className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Újrapróbálás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page courses-page">
      <h1>Kurzuskatalógus</h1>

      {/* Keresés és szűrés */}
      <div className="courses-filters">
        <input
          type="text"
          placeholder="Keresés kurzusok között..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="">Minden nehézségi szint</option>
          <option value="beginner">Kezdő</option>
          <option value="intermediate">Haladó</option>
          <option value="advanced">Szakértő</option>
        </select>
      </div>

      {/* Kurzusok listája */}
      {filteredCourses.length === 0 ? (
        <p>Nincs találat</p>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <span>Nehézség: {getDifficultyLabel(course.difficulty)}</span>
                <span>Fejezetek: {course.chapters_count}</span>
                <span>Kreditek: {course.total_credits}</span>
              </div>

              {course.enrolled ? (
                <Link to={`/courses/${course.id}`} className="btn btn-primary">
                  Tanulás folytatása
                </Link>
              ) : (
                <button
                  onClick={() => handleEnroll(course.id)}
                  className="btn btn-primary"
                  disabled={enrolling === course.id}
                >
                  {enrolling === course.id ? "Beiratkozás..." : "Beiratkozás"}
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
    advanced: "Szakértő"
  };
  return labels[difficulty] || difficulty;
}

export default CoursesPage;
