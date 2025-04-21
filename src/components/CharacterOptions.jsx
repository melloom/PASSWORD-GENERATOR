import React from 'react';
import { AlertTriangle } from 'lucide-react';

const CharacterOptions = ({
  includeLowercase,
  setIncludeLowercase,
  includeUppercase,
  setIncludeUppercase,
  includeNumbers,
  setIncludeNumbers,
  includeSymbols,
  setIncludeSymbols,
  darkMode
}) => {
  const noOptionsSelected = !includeLowercase && !includeUppercase && !includeNumbers && !includeSymbols;

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 gap-3">
        <label className={`flex items-center space-x-2 p-3 rounded-lg transition-all hover:bg-dark-700/30 border ${
          darkMode ? 'border-dark-600' : 'border-gray-200'
        }`}>
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={() => setIncludeLowercase(!includeLowercase)}
            className="w-4 h-4 accent-primary-500"
          />
          <span className="text-sm">Include lowercase letters (a-z)</span>
        </label>

        <label className={`flex items-center space-x-2 p-3 rounded-lg transition-all hover:bg-dark-700/30 border ${
          darkMode ? 'border-dark-600' : 'border-gray-200'
        }`}>
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={() => setIncludeUppercase(!includeUppercase)}
            className="w-4 h-4 accent-primary-500"
          />
          <span className="text-sm">Include uppercase letters (A-Z)</span>
        </label>

        <label className={`flex items-center space-x-2 p-3 rounded-lg transition-all hover:bg-dark-700/30 border ${
          darkMode ? 'border-dark-600' : 'border-gray-200'
        }`}>
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={() => setIncludeNumbers(!includeNumbers)}
            className="w-4 h-4 accent-primary-500"
          />
          <span className="text-sm">Include numbers (0-9)</span>
        </label>

        <label className={`flex items-center space-x-2 p-3 rounded-lg transition-all hover:bg-dark-700/30 border ${
          darkMode ? 'border-dark-600' : 'border-gray-200'
        }`}>
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={() => setIncludeSymbols(!includeSymbols)}
            className="w-4 h-4 accent-primary-500"
          />
          <span className="text-sm">Include symbols (!@#$%^&*)</span>
        </label>
      </div>
    </div>
  );
};

export default CharacterOptions;
