import React from 'react';
import { Shield, Sun, Moon, BookOpen, Code, Clock } from 'lucide-react';
import InstallPWA from './InstallPWA';

const Header = ({
  darkMode,
  setDarkMode,
  installPrompt,
  isAppInstalled,
  installationAttempted,
  handleInstallClick,
  passwordHistory,
  setShowPasswordGuides,
  setShowCreatorInfo,
  handleHistoryClick,
  HomeIcon
}) => {
  return (
    <>
      {/* Dedicated PWA Status Bar Spacer */}
      <div className={`pwa-status-bar-spacer ${darkMode ? 'bg-dark-900' : 'bg-blue-50'}`}></div>

      {/* Header component */}
      <header className={`py-0.5 pt-safe ${darkMode ? 'bg-dark-800/80 border-dark-700' : 'bg-white border-slate-200 shadow-sm'} border-b backdrop-blur-md sticky top-0 z-50 transition-all duration-300 flex items-center`}>
        <div className="container mx-auto px-2 relative z-30">
          <div className="flex items-center justify-between">
            {/* Brand/logo with larger size in PWA */}
            <div className="flex items-center">
              <Shield className={`${darkMode ? 'text-primary-400' : 'text-primary-500'} mr-1.5`} size={24} />
              <h1 className="text-xl font-bold" style={{
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: darkMode ? '0 0 1px rgba(255,255,255,0.1)' : '0 0 1px rgba(0,0,0,0.1)',
                fontWeight: 800,
                filter: 'brightness(1.1) contrast(1.1)'
              }}>
                Lockora
              </h1>

              {/* Install button with increased size */}
              {installPrompt && !isAppInstalled && !installationAttempted && (
                <button
                  onClick={handleInstallClick}
                  className={`ml-2 p-1.5 rounded-full ${
                    darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'
                  } transition-all shadow-sm hover:shadow flex items-center justify-center`}
                  title="Add to Home Screen"
                  aria-label="Add to Home Screen"
                >
                  <HomeIcon size={18} className={darkMode ? 'text-primary-300' : 'text-primary-600'} />
                </button>
              )}

              {/* Installed indicator */}
              {isAppInstalled && (
                <div className={`ml-2 flex items-center justify-center p-1.5 rounded-full ${
                  darkMode ? 'bg-dark-700' : 'bg-gray-200'
                } relative`}
                  title="App installed"
                >
                  <HomeIcon size={18} className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
              )}
            </div>

            {/* Right side buttons with larger size */}
            <div className="flex items-center ml-auto space-x-2">
              {/* Password Guides Button */}
              <button
                onClick={() => setShowPasswordGuides(true)}
                className={`p-2 rounded-full ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} relative transition-all shadow-sm hover:shadow z-30`}
                title="Password Guides"
              >
                <BookOpen size={18} className={darkMode ? 'text-primary-300' : 'text-primary-600'} />
              </button>

              {/* Creator Info Button */}
              <button
                onClick={() => setShowCreatorInfo(true)}
                className={`p-2 rounded-full ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} relative transition-all shadow-sm hover:shadow z-30`}
                title="About Creator"
              >
                <Code size={18} className={darkMode ? 'text-primary-300' : 'text-primary-600'} />
              </button>

              {/* History button with larger indicator */}
              <button
                onClick={handleHistoryClick}
                className={`p-2 rounded-full ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} relative transition-all shadow-sm hover:shadow z-30`}
                title="Password history"
                aria-label="Show password history"
              >
                <Clock size={18} className={darkMode ? 'text-primary-300' : 'text-primary-600'} />
                {passwordHistory.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
                  </span>
                )}
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} transition-all shadow-sm hover:shadow z-30`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ?
                  <Sun size={18} className="text-warning-400" /> :
                  <Moon size={18} className="text-dark-600" />
                }
              </button>

              {/* Add InstallPWA component here */}
              <div className="z-30">
                <InstallPWA darkMode={darkMode} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CSS for improved clickability */}
      <style jsx>{`
        /* Improve header clickability */
        header {
          position: relative;
          z-index: 50;
        }

        /* Make all buttons in the header more clickable */
        header button {
          position: relative;
          z-index: 30;
        }

        /* Ensure button contents are clickable */
        header button * {
          pointer-events: none;
        }

        /* Fix potential overlap issues */
        .container {
          position: relative;
          z-index: 30;
        }

        /* Fix header sizing when installed to homescreen */
        @media (display-mode: standalone) {
          /* Enhanced clickability for PWA mode */
          header button {
            min-width: 44px !important;
            min-height: 44px !important;
            margin: 2px !important;
            position: relative !important;
            z-index: 30 !important;
          }

          /* Make touch targets larger and more responsive */
          header button svg {
            pointer-events: none;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
