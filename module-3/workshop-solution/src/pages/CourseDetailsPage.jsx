import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { courseService, chapterService } from "../services/api";

function CourseDetailsPage() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingChapterId, setCompletingChapterId] = useState(null);

  const loadCourseDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await courseService.getCourseById(id);

      if (response.ok) {
        const data = await response.json();
        // Az API { course: {...} } formátumban adja vissza
        setCourse(data.course || data);
      } else if (response.status === 404) {
        setError("A kurzus nem található");
      } else {
        setError("Nem sikerült betölteni a kurzus adatait");
      }
    } catch (error) {
      console.error("Error loading course:", error);
      setError("Hálózati hiba történt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseDetails();
  }, [id]);

  useEffect(() => {
    LinkedInShare.init({
      container: "#linkedin-share-root",
      theme: "light",
      locale: "en-US",
    });
  }, []);

  const handleCompleteChapter = async (chapterId) => {
    setCompletingChapterId(chapterId);

    try {
      const response = await chapterService.completeChapter(id, chapterId);

      if (response.ok) {
        const data = await response.json();
        alert(`Gratulálunk! +${data.creditsEarned} kredit!`);

        // Frissítsük a kurzus adatokat és a felhasználó adatait
        await loadCourseDetails();
        await refreshUser();
      } else if (response.status === 403) {
        alert("Ezt a fejezetet már befejezted");
      } else {
        alert("Nem sikerült befejezni a fejezetet");
      }
    } catch (error) {
      console.error("Error completing chapter:", error);
      alert("Hálózati hiba történt");
    } finally {
      setCompletingChapterId(null);
    }
  };

  const share = (chapter) => {
    LinkedInShare.open({
      url: `/courses/${course.id}`,
      title: course.title,
      summary: `I just completed ${chapter.title}!`,
      source: "SkillShare Academy",
      tags: ["learning", "skills"],
    });
  };

  if (loading) {
    return (
      <div className="page course-details-page">
        <div className="loading-spinner">Betöltés...</div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="page course-details-page">
        <div className="error-message">⚠️ {error}</div>
        <Link to="/courses" className="btn btn-primary">
          Vissza a kurzusokhoz
        </Link>
      </div>
    );
  }

  const completedCount =
    course.chapters?.filter((ch) => ch.isCompleted).length || 0;
  const totalCount = course.chapters?.length || 0;
  const completedCredits =
    course.chapters
      ?.filter((ch) => ch.isCompleted)
      .reduce((sum, ch) => sum + ch.credits, 0) || 0;

  return (
    <div className="page course-details-page">
      <div className="course-header">
        <Link to="/courses" className="back-link">
          ← Vissza a kurzusokhoz
        </Link>

        <h1>{course.title}</h1>
        <p className="course-description">{course.description}</p>

        {error && <div className="error-message">⚠️ {error}</div>}

        {course.isEnrolled && (
          <div className="progress-section">
            <h3>Előrehaladás</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    totalCount > 0 ? (completedCount / totalCount) * 100 : 0
                  }%`,
                }}
              ></div>
            </div>
            <p>
              {completedCount} / {totalCount} fejezet befejezve
            </p>
            <p>Összegyűjtött kreditek: {completedCredits}</p>
          </div>
        )}
      </div>

      {course.isEnrolled && (
        <div className="chapters-section">
          <h2>Fejezetek</h2>
          <div className="chapters-list">
            {course.chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`chapter-item ${
                  chapter.isCompleted ? "completed" : ""
                }`}
              >
                <div className="chapter-info">
                  <h3>
                    {chapter.isCompleted && "✓ "}
                    {chapter.title}
                  </h3>
                  <p>Jutalom: {chapter.credits} kredit</p>
                </div>
                <div className="chapter-actions">
                  {!chapter.isCompleted && (
                    <button
                      onClick={() => handleCompleteChapter(chapter.id)}
                      disabled={completingChapterId === chapter.id}
                      className="btn btn-primary"
                    >
                      {completingChapterId === chapter.id
                        ? "Befejezés..."
                        : "Befejezés"}
                    </button>
                  )}
                  {chapter.isCompleted && (
                    <div
                      id={`linkedin-share-${chapter.id}`}
                      className="linkedin-share-container"
                    >
                      <button
                        className="btn btn-secondary"
                        onClick={() => share(chapter)}
                      >
                        Megosztás LinkedInen
                      </button>
                      <span className="completed-badge">✅ Befejezve</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div id="linkedin-share-root"></div>
    </div>
  );
}

export default CourseDetailsPage;
