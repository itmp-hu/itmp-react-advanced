const API_BASE_URL = "http://localhost:5000/api/v1";

// Helper függvény a hitelesítéshez szükséges headerek összeállításához
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "X-API-TOKEN": token,
    "Content-Type": "application/json",
  };
}

// Hitelesítési szolgáltatások
export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  async register(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response;
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/users/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response;
  },
};

// Felhasználói szolgáltatások
export const userService = {
  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders(),
    });
    return response;
  },
};

// Kurzus szolgáltatások
export const courseService = {
  async getAllCourses() {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  async getCourseById(id) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  async enrollInCourse(id) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/enroll`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response;
  },
};

// Fejezet szolgáltatások
export const chapterService = {
  async completeChapter(courseId, chapterId) {
    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/complete`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return response;
  },
};

// Mentor szolgáltatások
export const mentorService = {
  async getAvailableSessions() {
    const response = await fetch(`${API_BASE_URL}/mentors/sessions`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  async bookSession(id) {
    const response = await fetch(`${API_BASE_URL}/mentors/sessions/${id}/book`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response;
  },
};
