import React, { useState, useEffect } from 'react';
import './App.css';
import PasswordGenerator from './components/PasswordGenerator';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [contentReady, setContentReady] = useState(false);
  const [transitionsReady, setTransitionsReady] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Explicitly define darkMode state

  // Initialize dark mode immediately
  useEffect(() => {
    // Get dark mode preference
    const darkModePreference = localStorage.getItem('darkMode') === 'false' ? false : true;

    // Set the state based on preference
    setDarkMode(darkModePreference);

    // Apply correct theme to HTML and body
    if (!darkModePreference) {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
      document.body.style.backgroundColor = '#f9fafb';
    } else {
      document.documentElement.classList.remove('light-mode');
      document.documentElement.classList.add('dark-mode');
      document.body.style.backgroundColor = '#111827';
    }

    // Mark content as ready to display with slight delay
    const contentTimer = setTimeout(() => setContentReady(true), 10);

    // Enable transitions only after initial render
    const transitionTimer = setTimeout(() => setTransitionsReady(true), 300);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(transitionTimer);
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className={`app-container ${contentReady ? 'content-ready' : 'content-loading'} ${transitionsReady ? 'transitions-ready' : ''}`}>
        <PasswordGenerator darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
