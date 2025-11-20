function CourseDetailsPage() {
  return (
    <div className="page course-details-page">
      <div className="course-header">
        <h1>Kurzus címe</h1>
        <p>Kurzus leírása...</p>
        <div className="progress-info">
          <p>Előrehaladás: 0/10 fejezet</p>
          <p>Kreditek: 0/50</p>
        </div>
      </div>

      <div className="chapters-list">
        <h2>Fejezetek</h2>
        <div className="chapter-item">
          <h3>1. fejezet - Bevezetés</h3>
          <p>Fejezet leírása...</p>
          <div className="chapter-actions">
            <button className="btn btn-secondary" disabled>
              Fejezet megtekintése
            </button>
            <button className="btn btn-primary">Befejezettnek jelölés</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailsPage;

