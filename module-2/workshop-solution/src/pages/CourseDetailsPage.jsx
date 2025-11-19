import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { courseService, chapterService } from "../services/api";
import { useAuth } from "../hooks/useAuth";

function CourseDetailsPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(null); // ID of chapter being completed

  const { refreshUser } = useAuth();

  useEffect(() => {
    loadCourseDetails();
  }, [id]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await courseService.getCourseById(id);

      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else if (response.status === 404) {
        setError("A kurzus nem található");
      } else if (response.status === 401) {
        setError("Kérlek jelentkezz be újra");
      } else {
        setError("Nem sikerült betölteni a kurzus adatait");
      }
    } catch (err) {
      setError("Hálózati hiba történt");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChapter = async (chapterId) => {
    try {
      setCompleting(chapterId);

      const response = await chapterService.completeChapter(chapterId);

      if (response.status === 200) {
        const data = await response.json();
        alert(`Gratulálunk! +${data.credits_earned} kredit!`);
        
        // Frissítsük a kurzus adatokat és a felhasználó adatait
        await loadCourseDetails();
        await refreshUser();

        // LinkedIn share widget inicializálása
        initLinkedInShare(chapterId);
      } else if (response.status === 403) {
        alert("Ez a fejezet már be van fejezve");
      } else if (response.status === 404) {
        alert("A fejezet nem található");
      } else {
        alert("Hiba történt a fejezet befejezése során");
      }
    } catch (error) {
      alert("Hálózati hiba történt");
    } finally {
      setCompleting(null);
    }
  };

  const initLinkedInShare = (chapterId) => {
    // LinkedIn share widget inicializálása
    // Ez a widget a public/third-party mappából lesz betöltve
    if (window.LinkedInShare) {
      const chapter = course.chapters.find(ch => ch.id === chapterId);
      if (chapter) {
        window.LinkedInShare.init({
          elementId: `linkedin-share-${chapterId}`,
          text: `Befejeztem a "${chapter.title}" fejezetet a SkillShare Academy-n!`,
          url: window.location.href
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="page course-details-page">
        <p>Betöltés...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page course-details-page">
        <div className="error-message">
          ⚠️ {error}
        </div>
        <Link to="/courses" className="btn btn-primary">
          Vissza a kurzusokhoz
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page course-details-page">
        <p>Nincs adat</p>
      </div>
    );
  }

  const completedCount = course.chapters?.filter(ch => ch.completed).length || 0;
  const totalCount = course.chapters?.length || 0;
  const completedCredits = course.chapters
    ?.filter(ch => ch.completed)
    .reduce((sum, ch) => sum + ch.credits, 0) || 0;

  return (
    <div className="page course-details-page">
      {/* Kurzus fejléc */}
      <div className="course-header">
        <Link to="/courses" className="back-link">
          ← Vissza a kurzusokhoz
        </Link>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div className="progress-info">
          <p>
            Előrehaladás: {completedCount}/{totalCount} fejezet
          </p>
          <p>
            Kreditek: {completedCredits}/{course.total_credits}
          </p>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Fejezetek listája */}
      <div className="chapters-list">
        <h2>Fejezetek</h2>
        {course.chapters && course.chapters.length > 0 ? (
          course.chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className={`chapter-item ${chapter.completed ? "completed" : ""}`}
            >
              <div className="chapter-header">
                <h3>
                  {index + 1}. fejezet - {chapter.title}
                </h3>
                {chapter.completed && (
                  <span className="completed-badge">✓ Befejezve</span>
                )}
              </div>
              <p>{chapter.description}</p>
              <p className="chapter-credits">Kredit: {chapter.credits}</p>

              <div className="chapter-actions">
                <button className="btn btn-secondary" disabled>
                  Fejezet megtekintése (később)
                </button>

                {chapter.completed ? (
                  <div
                    id={`linkedin-share-${chapter.id}`}
                    className="linkedin-share-container"
                  >
                    {/* LinkedIn share widget jelenik meg ide */}
                  </div>
                ) : (
                  <button
                    onClick={() => handleCompleteChapter(chapter.id)}
                    className="btn btn-primary"
                    disabled={completing === chapter.id}
                  >
                    {completing === chapter.id
                      ? "Befejezés..."
                      : "Befejezettnek jelölés"}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>Ennek a kurzusnak még nincsenek fejezetei.</p>
        )}
      </div>
    </div>
  );
}

export default CourseDetailsPage;
