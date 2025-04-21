import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink, AlertTriangle } from 'lucide-react';
import * as tokenService from '../utils/tokenService';

const SecurePasswordsMenu = ({ darkMode, onClose }) => {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    // Load tokens when component mounts
    const validTokens = tokenService.getValidTokens();
    setTokens(validTokens);
  }, []);

  const formatTimeLeft = (expiryTimestamp) => {
    const now = Date.now();
    const timeLeft = expiryTimestamp - now;

    if (timeLeft <= 0) return 'Expired';

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 1) {
      return `${minutes}m left`;
    }

    return `${hours}h ${minutes}m left`;
  };

  const openSecureLink = (token) => {
    // Close the menu
    if (onClose) onClose();

    // Open the link
    window.open(`${window.location.origin}/view#${token}`, '_blank');
  };

  const removeToken = (e, token) => {
    e.stopPropagation(); // Prevent opening the link
    tokenService.removeToken(token);
    setTokens(tokenService.getValidTokens());
  };

  if (tokens.length === 0) {
    return (
      <div className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle size={18} className="mr-2" />
          <p>No secure passwords found</p>
        </div>
        <p className="text-xs text-center">
          When someone shares a secure password with you, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto p-2">
      <h3 className={`text-sm font-medium mb-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Your Secure Passwords
      </h3>

      <div className="space-y-2">
        {tokens.map((token, index) => (
          <div
            key={index}
            onClick={() => openSecureLink(token.token)}
            className={`rounded-lg p-3 cursor-pointer ${
              darkMode
                ? 'bg-dark-700 hover:bg-dark-600 border border-dark-600'
                : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {token.purpose}
              </div>

              <button
                onClick={(e) => removeToken(e, token.token)}
                className={`text-xs px-2 py-0.5 rounded ${
                  darkMode
                    ? 'bg-dark-600 hover:bg-dark-500 text-gray-400'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}
              >
                Remove
              </button>
            </div>

            <div className="flex items-center mt-1 text-xs">
              <Clock size={12} className={`mr-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {formatTimeLeft(token.expires)}
              </span>
            </div>

            <div className="mt-2 text-xs flex items-center text-primary-500">
              <ExternalLink size={12} className="mr-1" />
              <span>Click to open</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurePasswordsMenu;
