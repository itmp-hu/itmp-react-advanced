function CoursesPage() {
  return (
    <div className="page courses-page">
      <h1>Kurzuskatalógus</h1>
      <div className="courses-filters">
        <input type="text" placeholder="Keresés kurzusok között..." />
        <select>
          <option value="">Minden nehézségi szint</option>
          <option value="beginner">Kezdő</option>
          <option value="intermediate">Haladó</option>
          <option value="advanced">Szakértő</option>
        </select>
      </div>
      <div className="courses-grid">
        <div className="course-card">
          <h3>Példa kurzus</h3>
          <p>Kurzus leírása...</p>
          <div className="course-meta">
            <span>Nehézség: Kezdő</span>
            <span>Fejezetek: 10</span>
          </div>
          <button className="btn btn-primary">Beiratkozás</button>
        </div>
      </div>
    </div>
  );
}

export default CoursesPage;

