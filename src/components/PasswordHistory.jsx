import React from 'react';
import { Copy, Clock, Trash2, RotateCw, Eye, Lock } from 'lucide-react';

const PasswordHistory = ({ history, darkMode, onClear, onUse }) => {
  if (history.length === 0) {
    return (
      <div className={`p-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <Clock size={36} className="mx-auto mb-2 opacity-40" />
        <p className="text-lg font-medium mb-1">No history yet</p>
        <p className="text-sm">Generated and copied passwords will appear here</p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Recent Passwords</h3>
          <button
            onClick={onClear}
            className={`px-3 py-1.5 rounded-md text-xs flex items-center ${
              darkMode
                ? 'bg-dark-700 hover:bg-dark-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <Trash2 size={14} className="mr-1" />
            Clear All
          </button>
        </div>
        <div className={`space-y-3 ${darkMode ? '' : 'divide-y divide-gray-100'}`}>
          {history.map((item, index) => (
            <div
              key={index}
              className={`${index !== 0 ? 'pt-3' : ''} ${
                darkMode
                  ? 'hover:bg-dark-700/50 rounded-lg'
                  : 'hover:bg-gray-50 rounded-lg'
              } p-2`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex-1 font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.password}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUse(item.password)}
                    title="Use this password"
                    className={`p-1.5 rounded-full ${
                      darkMode
                        ? 'hover:bg-dark-600 text-primary-400'
                        : 'hover:bg-gray-200 text-primary-500'
                    }`}
                  >
                    <RotateCw size={14} />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.password)
                        .then(() => {
                          // Create toast notification
                          const notification = document.createElement('div');
                          notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white ${
                            darkMode ? 'bg-primary-600' : 'bg-primary-500'
                          } shadow-lg z-50 animate-fadeIn`;
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
                          errorNotification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white bg-danger-500 shadow-lg z-50 animate-fadeIn`;
                          errorNotification.textContent = 'Failed to copy password!';
                          document.body.appendChild(errorNotification);
                          setTimeout(() => document.body.removeChild(errorNotification), 2000);
                        });
                    }}
                    title="Copy to clipboard"
                    className={`p-1.5 rounded-full ${
                      darkMode
                        ? 'hover:bg-dark-600 text-primary-400'
                        : 'hover:bg-gray-200 text-primary-500'
                    }`}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center mt-1.5 justify-between">
                <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <span className="flex items-center">
                    {item.type === 'checked' ? (
                      <Lock size={12} className={`mr-1 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} />
                    ) : (
                      <Eye size={12} className="mr-1" />
                    )}
                    {item.type === 'checked' ? 'Checked' : item.type === 'memorable' ? 'Memorable' : 'Random'} · {item.length} chars
                  </span>
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <Clock size={12} className="inline mr-1" />
                  {item.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PasswordHistory;
