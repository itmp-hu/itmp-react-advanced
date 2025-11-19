import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import MentorsPage from './pages/MentorsPage';

function App() {
  return (
    <Routes>
      {/* Nyilvános route-ok Layout nélkül */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Védett route-ok Layout-tal */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/courses" element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/courses/:id" element={
          <ProtectedRoute>
            <CourseDetailsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/mentors" element={
          <ProtectedRoute>
            <MentorsPage />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Alapértelmezett átirányítás */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 - Not Found */}
      <Route path="*" element={
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>404 - Az oldal nem található</h1>
          <a href="/login">Vissza a főoldalra</a>
        </div>
      } />
    </Routes>
  );
}

export default App;
