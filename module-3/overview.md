# 3. modul elméleti áttekintés - REST API integráció és befejező lépések

- REST API integráció
- Aszinkron műveletek React-ben
- Loading állapotok és hibakezelés
- HTTP státuszkódok és jelentésük
- Chart.js könyvtár integrációja
- Polling valós idejű frissítésekhez
- Külső szkriptek integrálása
- Service layer minta

## REST API integráció

### Mi az a REST API?

A **REST** (Representational State Transfer) egy architekturális stílus web szolgáltatások készítésére. A REST API-k HTTP protokollon keresztül kommunikálnak, és szabványos HTTP metódusokat használnak:

- **GET**: Adatok lekérése (olvasás)
- **POST**: Új adat létrehozása
- **PUT**: Meglévő adat teljes frissítése
- **PATCH**: Meglévő adat részleges frissítése
- **DELETE**: Adat törlése

#### Példa REST API végpontok

```
GET    /api/v1/users/me           # Bejelentkezett felhasználó adatai
GET    /api/v1/courses            # Összes kurzus listázása
POST   /api/v1/courses/5/enroll   # Beiratkozás egy kurzusra
POST   /api/v1/chapters/12/complete # Fejezet befejezettnek jelölése
GET    /api/v1/mentor-sessions    # Elérhető mentor foglalások
POST   /api/v1/mentor-sessions/3/book # Mentor foglalás
```

### HTTP státuszkódok

A szerver válaszai státuszkódokkal jelzik a kérés eredményét:

#### 2xx - Sikeres válaszok

- **200 OK**: Sikeres GET, PUT, PATCH kérés
- **201 Created**: Sikeres POST kérés, új erőforrás létrehozva
- **204 No Content**: Sikeres kérés, de nincs visszaadandó adat

#### 4xx - Kliens oldali hibák

- **400 Bad Request**: Hibás kérés formátum (pl. hiányos vagy helytelen adatok)
- **401 Unauthorized**: Hiányzó vagy érvénytelen hitelesítés (token)
- **403 Forbidden**: Nincs jogosultság a művelethez (pl. már beiratkozott kurzus)
- **404 Not Found**: A kért erőforrás nem található
- **422 Unprocessable Entity**: Validációs hiba (pl. nem elég kredit)

#### 5xx - Szerver oldali hibák

- **500 Internal Server Error**: Általános szerver hiba
- **502 Bad Gateway**: Gateway hiba
- **503 Service Unavailable**: A szolgáltatás átmenetileg nem elérhető

### Példa HTTP válaszok kezelése

```jsx
async function fetchUserData() {
  try {
    const response = await fetch('/api/v1/users/me', {
      headers: {
        'X-API': token
      }
    });

    if (response.status === 200) {
      const data = await response.json();
      return { success: true, data };
    }

    if (response.status === 401) {
      // Nincs bejelentkezve vagy lejárt a token
      return { success: false, error: 'Kérlek jelentkezz be újra!' };
    }

    if (response.status === 404) {
      return { success: false, error: 'Felhasználó nem található' };
    }

    if (response.status === 500) {
      return { success: false, error: 'Szerver hiba történt' };
    }

    // Más hibák kezelése
    return { success: false, error: 'Ismeretlen hiba történt' };
  } catch (error) {
    // Hálózati hiba (nincs internet, szerver nem elérhető)
    return { success: false, error: 'Hálózati hiba történt' };
  }
}
```

## Aszinkron műveletek React-ben

### A fetch API használata

A modern JavaScript-ben a `fetch()` API-t használjuk HTTP kérések küldésére. Ez egy Promise-alapú API, amely `async/await` szintaxissal használható.

#### Alapvető GET kérés

```jsx
async function getCourses() {
  const response = await fetch('/api/v1/courses', {
    method: 'GET',
    headers: {
      'X-API': token
    }
  });
  
  const data = await response.json();
  return data;
}
```

#### POST kérés adatokkal

```jsx
async function enrollInCourse(courseId) {
  const response = await fetch(`/api/v1/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: {
      'X-API': token,
      'Content-Type': 'application/json'
    }
  });
  
  return response;
}
```

### Aszinkron műveletek komponensekben

React komponensekben az aszinkron műveleteket `useEffect` hook-ban vagy eseménykezelőkben végezzük.

#### Adatok betöltése komponens mountolásakor

```jsx
function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/courses', {
          headers: { 'X-API': localStorage.getItem('token') }
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          setError('Nem sikerült betölteni a kurzusokat');
        }
      } catch (err) {
        setError('Hálózati hiba történt');
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []); // Üres dependency array = egyszer fut

  if (loading) return <div>Betöltés...</div>;
  if (error) return <div>Hiba: {error}</div>;

  return (
    <div>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

#### Aszinkron eseménykezelő

```jsx
function EnrollButton({ courseId }) {
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      
      const response = await fetch(`/api/v1/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'X-API': localStorage.getItem('token')
        }
      });

      if (response.status === 200) {
        alert('Sikeres beiratkozás!');
      } else if (response.status === 403) {
        alert('Már beiratkoztál erre a kurzusra');
      } else if (response.status === 422) {
        alert('Nem elég kreditje a beiratkozáshoz');
      }
    } catch (error) {
      alert('Hiba történt a beiratkozás során');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <button onClick={handleEnroll} disabled={enrolling}>
      {enrolling ? 'Beiratkozás...' : 'Beiratkozás'}
    </button>
  );
}
```

## Loading állapotok és hibakezelés

### Loading állapotok

A loading állapotok javítják a felhasználói élményt azáltal, hogy visszajelzést adnak a háttérben zajló műveletekről.

#### Globális loading indikátor

```jsx
function App() {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Betöltés...</p>
      </div>
    );
  }

  return <Routes>...</Routes>;
}
```

#### Lokális loading állapot

```jsx
function CourseCard({ course }) {
  const [enrolling, setEnrolling] = useState(false);

  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <button disabled={enrolling}>
        {enrolling ? (
          <>
            <Spinner size="small" />
            Beiratkozás...
          </>
        ) : (
          'Beiratkozás'
        )}
      </button>
    </div>
  );
}
```

#### Skeleton loading

A skeleton loading egy modern megközelítés, ahol az oldal struktúráját mutatjuk betöltés közben:

```jsx
function CourseListSkeleton() {
  return (
    <div className="courses-grid">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="course-card-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-button"></div>
        </div>
      ))}
    </div>
  );
}

function CoursesPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  if (loading) return <CourseListSkeleton />;
  
  return <CourseList courses={courses} />;
}
```

### Hibakezelés

#### Strukturált hibaüzenetek

```jsx
function getErrorMessage(status, defaultMessage) {
  const errorMessages = {
    400: 'Hibás kérés. Kérlek ellenőrizd az adatokat!',
    401: 'Kérlek jelentkezz be újra!',
    403: 'Nincs jogosultságod ehhez a művelethez',
    404: 'A kért erőforrás nem található',
    422: 'Validációs hiba történt',
    500: 'Szerver hiba. Kérlek próbáld újra később!'
  };

  return errorMessages[status] || defaultMessage || 'Ismeretlen hiba történt';
}
```

#### Error komponens

```jsx
function ErrorMessage({ error, onRetry }) {
  if (!error) return null;

  return (
    <div className="error-message">
      <div className="error-icon">⚠️</div>
      <p>{error}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-retry">
          Újrapróbálás
        </button>
      )}
    </div>
  );
}
```

#### Custom error handling hook

```jsx
function useApiError() {
  const [error, setError] = useState(null);

  const handleError = (response) => {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    const message = getErrorMessage(response.status);
    setError(message);
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
}
```

## Service Layer minta

A Service Layer egy tervezési minta, amely elkülöníti az API hívásokat a komponensektől. Ez javítja a kód újrafelhasználhatóságát és karbantarthatóságát.

### API Service létrehozása

```jsx
// src/services/api.js

const API_BASE_URL = 'http://localhost:5000/api/v1';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'X-API': token,
    'Content-Type': 'application/json'
  };
}

export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response;
  },

  async register(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return response;
  }
};

export const userService = {
  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders()
    });
    return response;
  }
};

export const courseService = {
  async getAllCourses() {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  async getCourseById(id) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  async enrollInCourse(id) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return response;
  }
};

export const chapterService = {
  async completeChapter(id) {
    const response = await fetch(`${API_BASE_URL}/chapters/${id}/complete`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return response;
  }
};

export const mentorService = {
  async getAvailableSessions() {
    const response = await fetch(`${API_BASE_URL}/mentor-sessions`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  async bookSession(id) {
    const response = await fetch(`${API_BASE_URL}/mentor-sessions/${id}/book`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return response;
  },

  async getBookedSessions() {
    const response = await fetch(`${API_BASE_URL}/mentor-sessions/booked`, {
      headers: getAuthHeaders()
    });
    return response;
  }
};
```

### Service használata komponensekben

```jsx
import { courseService } from '../services/api';

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      const response = await courseService.getAllCourses();
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
      
      setLoading(false);
    }

    loadCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    const response = await courseService.enrollInCourse(courseId);
    
    if (response.status === 200) {
      alert('Sikeres beiratkozás!');
      // Frissítsd a kurzusok listáját
    }
  };

  return (
    <div>
      {courses.map(course => (
        <CourseCard 
          key={course.id} 
          course={course} 
          onEnroll={handleEnroll}
        />
      ))}
    </div>
  );
}
```

## Chart.js integráció

A Chart.js egy népszerű, nyílt forráskódú JavaScript könyvtár diagramok készítésére. React-ben a `react-chartjs-2` wrapper-t használjuk.

### Chart.js telepítése

```bash
npm install chart.js react-chartjs-2
```

### Line Chart (vonaldiagram) példa

```jsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Regisztráljuk a szükséges komponenseket
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function CreditProgressChart({ creditHistory }) {
  // Adatok formázása Chart.js-hez
  const data = {
    labels: creditHistory.map(item => item.date), // X tengely
    datasets: [
      {
        label: 'Összegyűjtött kreditek',
        data: creditHistory.map(item => item.credits), // Y tengely
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4, // Simított vonalak
      }
    ]
  };

  // Diagram konfiguráció
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Kredit gyűjtés az elmúlt 30 napban'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Kreditek'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Dátum'
        }
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={data} options={options} />
    </div>
  );
}
```

### Doughnut Chart (fánk diagram) példa

```jsx
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function CourseCompletionChart({ completedChapters, totalChapters }) {
  const remainingChapters = totalChapters - completedChapters;

  const data = {
    labels: ['Befejezett', 'Hátralevő'],
    datasets: [
      {
        data: [completedChapters, remainingChapters],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Zöld - befejezett
          'rgba(226, 232, 240, 0.8)'  // Szürke - hátralevő
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(226, 232, 240)'
        ],
        borderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Kurzus előrehaladás'
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
```

### Dashboard példa Chart.js-szel

```jsx
function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const response = await userService.getCurrentUser();
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div>Betöltés...</div>;
  if (!userData) return <div>Nincs adat</div>;

  return (
    <div className="dashboard">
      <h1>Üdvözöllek, {userData.name}!</h1>
      <p>Jelenlegi kreditek: <strong>{userData.credits}</strong></p>

      <div className="charts-section">
        <div className="chart-container">
          <CreditProgressChart creditHistory={userData.credit_history} />
        </div>
        <div className="chart-container">
          <CourseCompletionChart 
            completedChapters={userData.completed_chapters_count}
            totalChapters={userData.total_chapters_count}
          />
        </div>
      </div>
    </div>
  );
}
```

## Polling (időszakos lekérdezés)

A polling egy technika, ahol az alkalmazás rendszeres időközönként lekérdezi a szervert frissített adatokért. Ez egy egyszerű módja a "valós idejű" frissítések implementálásának.

### Alapvető polling useEffect-tel

```jsx
function MentorBookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Azonnal lekérjük az adatokat
    async function fetchBookings() {
      const response = await mentorService.getBookedSessions();
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    }

    fetchBookings();

    // Polling beállítása - 30 másodpercenként
    const intervalId = setInterval(() => {
      fetchBookings();
    }, 30000); // 30000 ms = 30 másodperc

    // Cleanup: interval törlése komponens unmount-kor
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <h2>Foglalt időpontjaim</h2>
      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

### Custom polling hook

```jsx
function usePolling(callback, interval = 30000) {
  const savedCallback = useRef(callback);

  // Mindig a legfrissebb callback-et használjuk
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // Azonnal meghívjuk egyszer
    savedCallback.current();

    // Beállítjuk az intervallumot
    const id = setInterval(() => {
      savedCallback.current();
    }, interval);

    // Cleanup
    return () => clearInterval(id);
  }, [interval]);
}

// Használat
function MentorBookingsPage() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = useCallback(async () => {
    const response = await mentorService.getBookedSessions();
    if (response.ok) {
      const data = await response.json();
      setBookings(data);
    }
  }, []);

  // 30 másodpercenként frissít
  usePolling(fetchBookings, 30000);

  return (
    <div>
      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

### Polling start/stop vezérléssel

```jsx
function useControllablePolling(callback, interval = 30000) {
  const [isPolling, setIsPolling] = useState(false);
  const intervalIdRef = useRef(null);

  const startPolling = useCallback(() => {
    if (intervalIdRef.current) return; // Már fut

    // Azonnal meghívjuk
    callback();

    // Elindítjuk az intervallumot
    intervalIdRef.current = setInterval(callback, interval);
    setIsPolling(true);
  }, [callback, interval]);

  const stopPolling = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
      setIsPolling(false);
    }
  }, []);

  // Cleanup komponens unmount-kor
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return { isPolling, startPolling, stopPolling };
}

// Használat
function MentorBookingsPage() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = useCallback(async () => {
    const response = await mentorService.getBookedSessions();
    if (response.ok) {
      const data = await response.json();
      setBookings(data);
    }
  }, []);

  const { isPolling, startPolling, stopPolling } = useControllablePolling(
    fetchBookings,
    30000
  );

  useEffect(() => {
    startPolling(); // Automatikus indítás
    return () => stopPolling(); // Automatikus leállítás
  }, [startPolling, stopPolling]);

  return (
    <div>
      <div className="polling-indicator">
        {isPolling && (
          <span className="status-badge">
            🔄 Automatikus frissítés aktív (30 mp)
          </span>
        )}
      </div>
      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

### Polling teljesítmény optimalizálás

```jsx
function OptimizedMentorBookings() {
  const [bookings, setBookings] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await mentorService.getBookedSessions();
      
      if (response.ok) {
        const data = await response.json();
        
        // Csak akkor frissítünk, ha változott az adat
        setBookings(prevBookings => {
          if (JSON.stringify(prevBookings) !== JSON.stringify(data)) {
            setLastUpdate(new Date());
            return data;
          }
          return prevBookings;
        });
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, []);

  usePolling(fetchBookings, 30000);

  return (
    <div>
      {lastUpdate && (
        <p className="last-update">
          Utolsó frissítés: {lastUpdate.toLocaleTimeString()}
        </p>
      )}
      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

## Külső szkriptek integrálása

Néha külső JavaScript könyvtárakat kell integrálnunk, amelyek nem érhetők el npm package-ként.

### Script betöltése useEffect-ben

```jsx
function useScript(src) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Ellenőrizzük, hogy már be van-e töltve
    const existingScript = document.querySelector(`script[src="${src}"]`);
    
    if (existingScript) {
      setLoaded(true);
      return;
    }

    // Létrehozunk egy script taget
    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    const handleLoad = () => setLoaded(true);
    const handleError = () => setError(true);

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    document.body.appendChild(script);

    // Cleanup
    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      document.body.removeChild(script);
    };
  }, [src]);

  return { loaded, error };
}
```

### LinkedIn Share Widget integráció

A SkillShare Academy projektben a LinkedIn Share Widget-et használjuk a befejezett fejezetek megosztására.

#### Widget betöltése

```jsx
function CourseDetailsPage() {
  const { loaded, error } = useScript('/third-party/linkedin-share.js');

  useEffect(() => {
    // CSS betöltése
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/third-party/linkedin-share.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (!loaded) return <div>Widget betöltése...</div>;
  if (error) return <div>Hiba a widget betöltésekor</div>;

  return <div>{/* ... */}</div>;
}
```

#### Widget használata

```jsx
function ChapterItem({ chapter }) {
  const [completed, setCompleted] = useState(chapter.completed);

  const handleComplete = async () => {
    const response = await chapterService.completeChapter(chapter.id);
    
    if (response.ok) {
      setCompleted(true);
      
      // LinkedIn Share Widget inicializálása
      if (window.LinkedInShare) {
        window.LinkedInShare.init({
          elementId: `linkedin-share-${chapter.id}`,
          text: `Befejeztem a "${chapter.title}" fejezetet a SkillShare Academy-n!`,
          url: window.location.href
        });
      }
    }
  };

  return (
    <div className="chapter-item">
      <h3>{chapter.title}</h3>
      
      {completed ? (
        <>
          <span className="completed-badge">✓ Befejezve</span>
          <div id={`linkedin-share-${chapter.id}`}></div>
        </>
      ) : (
        <button onClick={handleComplete}>
          Befejezettnek jelölés
        </button>
      )}
    </div>
  );
}
```

## Összefoglalás

A 3. modulban a következő témákat érintettük:

✅ **REST API integráció** - HTTP kérések küldése, válaszok kezelése  
✅ **Aszinkron műveletek** - async/await, Promise-ok, fetch API  
✅ **Loading állapotok** - felhasználói visszajelzés async műveletek során  
✅ **Hibakezelés** - HTTP státuszkódok, error üzenetek, retry logika  
✅ **Service Layer** - API hívások elkülönítése komponensektől  
✅ **Chart.js** - adatvizualizáció line és doughnut chartokkal  
✅ **Polling** - valós idejű frissítések 30 másodperces intervallummal  
✅ **Külső szkriptek** - third-party library-k integrálása React-be

A következő gyakorlati workshopban ezeket a technikákat fogjuk alkalmazni a SkillShare Academy alkalmazás befejezéséhez!

## Ellenőrző kérdések

1. Mi a különbség a 401 és 403 HTTP státuszkód között?
2. Miért használunk Service Layer mintát az API hívásokhoz?
3. Hogyan működik a polling és mikor érdemes használni?
4. Miért fontos a cleanup függvény a useEffect-ben polling esetén?
5. Milyen Chart.js komponenseket kell regisztrálni egy line chart használatához?
6. Hogyan töltünk be biztonságosan egy külső JavaScript fájlt React-ben?

