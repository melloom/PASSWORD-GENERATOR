import React, { useState } from 'react';
import { analyzePasswordSecurity } from '../utils/passwordUtils';
import SecurityCheck from './SecurityCheck';

const PasswordChecker = ({ darkMode }) => {
  const [passwordToCheck, setPasswordToCheck] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const checkPassword = () => {
    if (!passwordToCheck.trim()) return;
    const result = analyzePasswordSecurity(passwordToCheck);
    setAnalysisResult(result);
  };

  return (
    <div className={`rounded-xl shadow-md overflow-hidden ${darkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
        <h3 className="font-medium text-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Check Your Password
        </h3>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Input field */}
          <input
            type="text"
            value={passwordToCheck}
            onChange={(e) => setPasswordToCheck(e.target.value)}
            placeholder="Enter a password to check its strength"
            className={`p-4 border rounded-lg ${
              darkMode
                ? 'bg-dark-700 text-white border-dark-600 focus:border-primary-500'
                : 'bg-gray-50 text-gray-800 border-gray-300 focus:border-primary-400'
            } w-full focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
          />

          {/* Check button - larger touch target for mobile */}
          <button
            onClick={checkPassword}
            className={`w-full mb-4 px-4 py-4 touch-target ${
              darkMode
                ? 'bg-primary-600 hover:bg-primary-700'
                : 'bg-primary-500 hover:bg-primary-600'
            } text-white rounded-lg font-medium transition transform hover:scale-[1.01] active:scale-[0.99]`}
          >
            Check Password
          </button>

          {/* Results section */}
          {analysisResult && (
            <div className={`mt-4 p-4 rounded-lg animate-fadeIn ${
              darkMode ? 'bg-dark-700 border border-dark-600' : 'bg-gray-50 border border-gray-200'
            }`}>
              <SecurityCheck analysis={analysisResult} darkMode={darkMode} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordChecker;
