import React, { useState } from 'react';
import { Copy, Clock, Trash2, RotateCw, Check, Eye, EyeOff, Info, AlertTriangle } from 'lucide-react';

const PasswordHistory = ({ history, darkMode, onClear, onUse }) => {
  // Add state for handling copy confirmation and password visibility
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [visibleIndex, setVisibleIndex] = useState(null);

  // Function to toggle password visibility for a specific item
  const toggleVisibility = (index) => {
    setVisibleIndex(visibleIndex === index ? null : index);
  };

  // Function to handle copying with animation
  const handleCopy = (password, index) => {
    navigator.clipboard.writeText(password)
      .then(() => {
        // Show copied state for this item
        setCopiedIndex(index);

        // Reset after animation
        setTimeout(() => {
          setCopiedIndex(null);
        }, 1500);

        // Create toast notification
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white ${
          darkMode ? 'bg-primary-600' : 'bg-primary-500'
        } shadow-lg z-[9999] animate-fadeIn`;
        notification.textContent = '✓ Password copied to clipboard!';
        document.body.appendChild(notification);

        setTimeout(() => {
          notification.classList.add('animate-fadeOut');
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        // Show error toast
        const errorNotification = document.createElement('div');
        errorNotification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white bg-danger-500 shadow-lg z-[9999] animate-fadeIn`;
        errorNotification.textContent = 'Failed to copy password!';
        document.body.appendChild(errorNotification);
        setTimeout(() => document.body.removeChild(errorNotification), 2000);
      });
  };

  // Helper function to format password for display
  const formatPassword = (password, isVisible) => {
    if (isVisible) {
      return password;
    } else {
      return password.replace(/./g, '•');
    }
  };

  // Helper function to determine badge color based on password type
  const getBadgeColor = (type) => {
    switch (type) {
      case 'memorable':
        return darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-700';
      case 'random':
        return darkMode ? 'bg-success-900/30 text-success-400' : 'bg-success-100 text-success-700';
      case 'checked':
        return darkMode ? 'bg-warning-900/30 text-warning-400' : 'bg-warning-100 text-warning-700';
      default:
        return darkMode ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  if (history.length === 0) {
    return (
      <div className={`p-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className={`mx-auto w-16 h-16 rounded-full ${darkMode ? 'bg-dark-700' : 'bg-gray-100'} flex items-center justify-center mb-3`}>
          <Clock size={28} className="opacity-60" />
        </div>
        <p className="text-lg font-medium mb-1">No password history yet</p>
        <p className="text-sm">Generated and copied passwords will appear here</p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} flex items-center`}>
            <Clock size={16} className="mr-2" />
            Recent Passwords <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
              darkMode ? 'bg-dark-700 text-gray-400' : 'bg-gray-200 text-gray-700'
            }`}>{history.length}</span>
          </h3>
          <button
            onClick={onClear}
            className={`px-3 py-1.5 rounded-md text-xs flex items-center ${
              darkMode
                ? 'bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-gray-100'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900'
            } transition-all`}
          >
            <Trash2 size={14} className="mr-1.5" />
            Clear History
          </button>
        </div>

        <div className="space-y-3">
          {history.map((item, index) => {
            const isPasswordVisible = visibleIndex === index;
            const isJustCopied = copiedIndex === index;

            return (
              <div
                key={index}
                className={`${
                  darkMode
                    ? `bg-dark-700 border border-dark-600`
                    : `bg-white border border-gray-200`
                } rounded-lg p-3 transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-grow min-w-0">
                    {/* Password display with ability to toggle visibility */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleVisibility(index)}
                        className={`p-1 rounded-full ${
                          darkMode
                            ? 'hover:bg-dark-600 text-gray-400 hover:text-gray-300'
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        } transition-colors focus:outline-none`}
                        title={isPasswordVisible ? "Hide password" : "Show password"}
                      >
                        {isPasswordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>

                      <div className={`font-mono text-sm truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatPassword(item.password, isPasswordVisible)}
                      </div>
                    </div>

                    {/* Timestamp and metadata row */}
                    <div className="flex flex-wrap items-center mt-1.5 gap-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {new Date(item.timestamp).toLocaleString()}
                      </span>

                      <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColor(item.type)}`}>
                        {item.type === 'memorable' ? 'Memorable' : item.type === 'random' ? 'Random' : 'Checked'}
                      </span>

                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {item.length} chars
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUse(item.password)}
                      title="Use this password"
                      className={`p-1.5 rounded-full ${
                        darkMode
                          ? 'hover:bg-dark-600 text-primary-400 hover:text-primary-300'
                          : 'hover:bg-gray-100 text-primary-500 hover:text-primary-600'
                      } transition-colors`}
                    >
                      <RotateCw size={14} />
                    </button>

                    <button
                      onClick={() => handleCopy(item.password, index)}
                      title="Copy to clipboard"
                      className={`p-1.5 rounded-full ${
                        isJustCopied
                          ? darkMode
                            ? 'bg-success-900/30 text-success-400'
                            : 'bg-success-100 text-success-600'
                          : darkMode
                            ? 'hover:bg-dark-600 text-primary-400 hover:text-primary-300'
                            : 'hover:bg-gray-100 text-primary-500 hover:text-primary-600'
                      } transition-all`}
                    >
                      {isJustCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <p className={`text-xs mt-4 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          For security, passwords are never stored on disk or sent to any server
        </p>
      </div>

      {/* Animations for copy feedback */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .pulse-animation {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PasswordHistory;