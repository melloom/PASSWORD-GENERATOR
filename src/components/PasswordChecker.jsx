import React from 'react';
import { Shield, AlertTriangle, Check, Info, Clock, Eye } from 'lucide-react';

const PasswordChecker = ({ password, analysis, darkMode }) => {
  if (!password || !analysis) {
    return (
      <div className={`p-4 border-2 rounded-lg ${darkMode ? 'text-gray-400 border-dark-600' : 'text-gray-600 border-gray-300'}`}>
        Enter a password to check its strength
      </div>
    );
  }

  const { score, entropy, timeToBreak, suggestions } = analysis;

  // Define strength labels and colors (updated for outline style)
  const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const strengthColors = [
    darkMode ? 'text-red-400 border-red-700' : 'text-red-600 border-red-400',
    darkMode ? 'text-orange-400 border-orange-700' : 'text-orange-600 border-orange-400',
    darkMode ? 'text-yellow-400 border-yellow-700' : 'text-yellow-600 border-yellow-400',
    darkMode ? 'text-blue-400 border-blue-700' : 'text-blue-600 border-blue-400',
    darkMode ? 'text-green-400 border-green-700' : 'text-green-600 border-green-400'
  ];

  return (
    <div className={`border-2 rounded-lg p-4 ${darkMode ? 'border-dark-600' : 'border-gray-300'}`}>
      {/* Strength summary */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-1`}>
            Password Strength
          </h3>
          <div className="flex items-center">
            <Shield size={16} className={`mr-2 ${
              score >= 3 ? (darkMode ? 'text-green-400' : 'text-green-600') :
              score >= 2 ? (darkMode ? 'text-yellow-400' : 'text-yellow-600') :
                          (darkMode ? 'text-red-400' : 'text-red-600')
            }`} />
            <span className={`text-sm font-medium ${
              score >= 3 ? (darkMode ? 'text-green-400' : 'text-green-600') :
              score >= 2 ? (darkMode ? 'text-yellow-400' : 'text-yellow-600') :
                          (darkMode ? 'text-red-400' : 'text-red-600')
            }`}>
              {strengthLabels[score]}
            </span>
          </div>
        </div>
        <div className={`px-3 py-2 rounded-lg border-2 ${strengthColors[score]}`}>
          <span className="text-lg font-bold">{entropy.toFixed(1)}</span>
          <span className="text-sm ml-1">bits</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`h-2 w-full ${darkMode ? 'bg-dark-700' : 'bg-gray-200'} rounded-full overflow-hidden mb-4`}>
        <div
          className={`h-full ${
            score === 0 ? 'bg-red-500' :
            score === 1 ? 'bg-orange-500' :
            score === 2 ? 'bg-yellow-500' :
            score === 3 ? 'bg-blue-500' :
                          'bg-green-500'
          }`}
          style={{ width: `${Math.min(100, (score + 1) * 20)}%` }}
        ></div>
      </div>

      {/* Details */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {/* Time to crack - updated with border-2 for outlined style */}
        <div className={`p-3 rounded-lg border-2 ${darkMode ? 'border-dark-600' : 'border-gray-300'}`}>
          <div className="flex items-start">
            <Clock size={16} className="mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="font-medium mb-1">Time to crack</div>
              <div className={`font-bold ${
                timeToBreak.includes('centur') || timeToBreak.includes('year') ?
                (darkMode ? 'text-green-400' : 'text-green-600') :
                timeToBreak.includes('month') || timeToBreak.includes('week') ?
                (darkMode ? 'text-blue-400' : 'text-blue-600') :
                timeToBreak.includes('day') ?
                (darkMode ? 'text-yellow-400' : 'text-yellow-600') :
                (darkMode ? 'text-red-400' : 'text-red-600')
              }`}>
                {timeToBreak}
              </div>
            </div>
          </div>
        </div>

        {/* Entropy - updated with border-2 for outlined style */}
        <div className={`p-3 rounded-lg border-2 ${darkMode ? 'border-dark-600' : 'border-gray-300'}`}>
          <div className="flex items-start">
            <Shield size={16} className="mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="font-medium mb-1">Entropy</div>
              <div>
                <span className="font-bold">{entropy.toFixed(1)} bits</span>
                <span className="ml-2 opacity-75">
                  ({entropy < 40 ? 'Low' : entropy < 60 ? 'Medium' : entropy < 80 ? 'High' : 'Very High'})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions - updated with border-2 for outlined style */}
      {suggestions && suggestions.length > 0 && (
        <div className={`mt-4 p-3 rounded-lg border-2 ${darkMode ? 'border-dark-600' : 'border-gray-300'}`}>
          <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Suggestions</h4>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <div className="mt-0.5 mr-2">
                  {suggestion.type === 'warning' ? (
                    <AlertTriangle size={14} className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} />
                  ) : suggestion.type === 'success' ? (
                    <Check size={14} className={darkMode ? 'text-green-400' : 'text-green-600'} />
                  ) : (
                    <Info size={14} className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
                  )}
                </div>
                <span className="text-sm">{suggestion.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordChecker;
