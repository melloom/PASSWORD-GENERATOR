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
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={() => setIncludeLowercase(!includeLowercase)}
            className="w-4 h-4 accent-blue-600"
          />
          <span className="text-sm">Lowercase (a-z)</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={() => setIncludeUppercase(!includeUppercase)}
            className="w-4 h-4 accent-blue-600"
          />
          <span className="text-sm">Uppercase (A-Z)</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={() => setIncludeNumbers(!includeNumbers)}
            className="w-4 h-4 accent-blue-600"
          />
          <span className="text-sm">Numbers (0-9)</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={() => setIncludeSymbols(!includeSymbols)}
            className="w-4 h-4 accent-blue-600"
          />
          <span className="text-sm">Symbols (!@#$%^&*)</span>
        </label>
      </div>

      {noOptionsSelected && (
        <div className={`mt-3 p-2 rounded-md flex items-center text-xs ${
          darkMode ? 'bg-danger-900/30 text-danger-300 border border-danger-800/50' :
          'bg-danger-100 text-danger-700 border border-danger-200'
        }`}>
          <AlertTriangle size={14} className="mr-1.5 flex-shrink-0" />
          Please select at least one character type
        </div>
      )}
    </div>
  );
};

export default CharacterOptions;