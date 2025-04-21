import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import PasswordGenerator from './components/PasswordGenerator';
import Login from './components/Login';
import Register from './components/Register';
import SecurePasswordView from './components/SecurePasswordView';

// Protected route component using localStorage for auth
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('sessionId') !== null;
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const isAuthenticated = localStorage.getItem('sessionId') !== null;

  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" /> : <Register />
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PasswordGenerator darkMode={darkMode} setDarkMode={setDarkMode} />
            </ProtectedRoute>
          } />
          <Route path="/view" element={
            <ProtectedRoute>
              <SecurePasswordView />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
          } />
        </Routes>
      </div>
    </Router>
  );
}

// Navigation component with conditional rendering based on auth
function Navigation() {
  const isAuthenticated = localStorage.getItem('sessionId') !== null;

  const handleLogout = () => {
    localStorage.removeItem('sessionId');
    window.location.href = '/login';
  };

  return (
    <nav>
      <ul>
        <li><Link to="/dashboard">Password Generator</Link></li>
        {!isAuthenticated ? (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        ) : (
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default App;
