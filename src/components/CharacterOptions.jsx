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
       