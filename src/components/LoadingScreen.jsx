import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const LoadingScreen = ({ darkMode }) => {
  useEffect(() => {
    const loadingElement = document.getElementById('loading-screen');
    if (loadingElement) {
      loadingElement.style.opacity = '1';
    }

    // Add a forced cleanup mechanism to ensure loading screen doesn't get stuck
    const forceHideTimeout = setTimeout(() => {
      if (loadingElement) {
        loadingElement.style.opacity = '0';
        setTimeout(() => {
          if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
          }
        }, 300); // transition time
      }
      console.log('Force hiding loading screen after timeout');
    }, 8000);

    return () => clearTimeout(forceHideTimeout);
  }, []);

  return ReactDOM.createPortal(
    <div
      id="loading-screen"
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        darkMode ? 'bg-dark-900' : 'bg-white'
      }`}
      style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
    >
      <div className="loader"></div>
    </div>,
    document.body
  );
};

export default LoadingScreen;