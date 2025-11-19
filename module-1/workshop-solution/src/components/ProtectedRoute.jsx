import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Ha nincs token, irányítsuk a login oldalra
    return <Navigate to="/login" replace />;
  }
  
  // Ha van token, jelenítsd meg az oldalt
  return children;
}

export default ProtectedRoute;

