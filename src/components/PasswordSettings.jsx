import React from 'react';
import { Shield, Timer, Sliders, Info, Eye, EyeOff, Copy, ChevronUp } from 'lucide-react';
import CharacterOptions from './CharacterOptions';

const PasswordSettings = ({
  darkMode,
  passwordType,
  password,
  showPassword,
  setShowPassword,
  handleCopyPassword,
  strengthScore,
  strengthLabels,
  showAdvanced,
  setShowAdvanced,
  length,
  advancedLengthMode,
  setAdvancedLengthMode,
  setLength,
  sliderRef,
  handleSliderHover,
  setShowPreviewBubble,
  showPreviewBubble,
  includeLowercase,
  setIncludeLowercase,
  includeUppercase,
  setIncludeUppercase,
  includeNumbers,
  setIncludeNumbers,
  includeSymbols,
  setIncludeSymbols,
  useWords,
  setUseWords,
  wordCount,
  setWordCount,
  wordSeparator,
  setWordSeparator,
  wordCase,
  setWordCase,
  avoidAmbiguous,
  setAvoidAmbiguous,
  excludeSimilar,
  setExcludeSimilar,
  customExclusions,
  setCustomExclusions,
  expirationEnabled,
  setExpirationEnabled,
  expirationTime,
  setExpirationTime,
  expirationRemaining,
  setExpirationRemaining,
  setIsExpired
}) => {
  return (
    <div className={`p-6 ${darkMode ? 'bg-dark-800' : 'bg-white'} animate-fadeIn rounded-b-xl border-t ${darkMode ? 'border-dark-700' : 'border-gray-200'} w-full`}>
      {/* Password Viewer Panel */}
      <div className="mb-6 w-full">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-dark-700' : 'bg-gray-100'} border ${darkMode ? 'border-dark-600' : 'border-gray-300'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Currently Generated Password
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              strengthScore === 4 ? 'bg-success-600 text-white' :
              strengthScore === 3 ? 'bg-primary-600 text-white' :
              strengthScore === 2 ? 'bg-warning-500 text-dark-800' :
              strengthScore === 1 ? 'bg-orange-500 text-white' :
              'bg-danger-600 text-white'
            }`}>
              {strengthLabels[strengthScore]}
            </span>
          </div>
          <div className="flex w-full items-center">
            <input
              type={showPassword ? "text" : "password"}
              readOnly
              value={password}
              className={`flex-1 py-2 px-3 rounded ${
                darkMode ? 'bg-dark-600 text-white border border-dark-500' : 'bg-white text-gray-900 border border-gray-300'
              } font-mono text-sm`}
            />
            <div className="flex ml-2">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className={`p-1.5 rounded ${
                  darkMode
                    ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                } mr-1`}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={handleCopyPassword}
                className={`p-1.5 rounded ${
                  darkMode
                    ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                }`}
                title="Copy password"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
          {/* Mini strength indicator bar */}
          <div className={`mt-2 h-1 w-full ${darkMode ? 'bg-dark-600' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div
              className={`h-full ${
                strengthScore === 0 ? 'bg-danger-500' :
                strengthScore === 1 ? 'bg-orange-500' :
                strengthScore === 2 ? 'bg-warning-500' :
                strengthScore === 3 ? 'bg-primary-500' :
                'bg-success-500'
              }`}
              style={{ width: `${Math.min(100, (strengthScore + 1) * 20)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Settings content based on password type */}
      <div className="w-full overflow-visible">
        {passwordType === 'random' ? (
          <>
            {/* Length Settings */}
            <div className="mb-6 w-full">
              <div className="flex justify-between items-center mb-2 w-full">
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Length
                </label>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  darkMode ? 'bg-dark-700 border border-dark-600' : 'bg-gray-100 border border-gray-200'
                } font-mono`}>
                  {length}
                </span>
              </div>

              {/* Advanced length toggle */}
              <div className="flex justify-between items-center mb-3 w-full">
                <label className={`flex items-center space-x-2 cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <input
                    type="checkbox"
                    checked={advancedLengthMode}
                    onChange={() => {
                      const newMode = !advancedLengthMode;
                      setAdvancedLengthMode(newMode);
                      if (!newMode && length > 16) {
                        setLength(16);
                      }
                    }}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span className={`text-sm flex items-center ${advancedLengthMode ? 'text-primary-400 font-semibold' : ''}`}>
                    <Shield size={14} className="mr-1" />
                    Advanced Length (up to 128 characters)
                  </span>
                </label>
              </div>

              <div className="relative w-full">
                <input
                  ref={sliderRef}
                  type="range"
                  min="8"
                  max={advancedLengthMode ? "128" : "16"}
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  onMouseMove={handleSliderHover}
                  onMouseEnter={() => setShowPreviewBubble(true)}
                  onMouseLeave={() => setShowPreviewBubble(false)}
                  className="w-full h-2 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-lg appearance-none cursor-pointer"
                />

                {/* Password preview bubble */}
                {showPreviewBubble && (
                  <div
                    className={`absolute z-10 px-3 py-1.5 rounded-lg text-xs font-mono shadow-lg pointer-events-none transform -translate-x-1/2 animate-fadeIn ${
                      darkMode
                        ? 'bg-dark-600 border border-dark-500 text-white'
                        : 'bg-gray-800 text-white'
                    }`}
                    style={{ left: `${(length - 8) / ((advancedLengthMode ? 128 : 16) - 8) * 100}%`, top: '-30px' }}
                  >
                    {showPassword ? password : password.replace(/./g, '•')}
                  </div>
                )}
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-1 w-full">
                <span>8 Chars</span>
                <span>{advancedLengthMode ? '128' : '16'} Chars</span>
              </div>
            </div>

            {/* Character Inclusion Options */}
            <CharacterOptions
              includeLowercase={includeLowercase}
              setIncludeLowercase={setIncludeLowercase}
              includeUppercase={includeUppercase}
              setIncludeUppercase={setIncludeUppercase}
              includeNumbers={includeNumbers}
              setIncludeNumbers={setIncludeNumbers}
              includeSymbols={includeSymbols}
              setIncludeSymbols={setIncludeSymbols}
              darkMode={darkMode}
            />
          </>
        ) : (
          <>
            {/* Memorable password type toggle */}
            <div className="mb-6 w-full">
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`py-3 px-4 rounded-md font-medium transition-all ${
                    useWords
                      ? `${darkMode
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-primary-500 text-white shadow-sm border border-primary-600'}`
                      : `${darkMode
                          ? 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`
                  } hover:shadow-md`}
                  onClick={() => setUseWords(true)}
                >
                  Use Words
                </button>
                <button
                  className={`py-3 px-4 rounded-md font-medium transition-all ${
                    !useWords
                      ? `${darkMode
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-primary-500 text-white shadow-sm border border-primary-600'}`
                      : `${darkMode
                          ? 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`
                  } hover:shadow-md`}
                  onClick={() => setUseWords(false)}
                >
                  Use Characters
                </button>
              </div>

              <div className={`mt-2 px-3 py-2 rounded-lg text-xs ${
                darkMode ? 'bg-dark-700/70 text-gray-300' : 'bg-blue-50 text-blue-700'
              }`}>
                <Info size={12} className="inline-block mr-1" />
                {useWords
                  ? "Words are easier to remember but might be less secure than random characters."
                  : "Characters create stronger passwords but may be harder to remember."}
              </div>
            </div>

            {/* Word count slider - only show if using words */}
            {useWords && (
              <div className="mb-6 w-full">
                <div className="flex justify-between items-center mb-2">
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Number of Words
                  </label>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    darkMode ? 'bg-dark-700 border border-dark-600' : 'bg-gray-100 border border-gray-200'
                  } font-mono`}>
                    {wordCount}
                  </span>
                </div>

                <input
                  type="range"
                  min="2"
                  max="6"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-lg appearance-none cursor-pointer"
                />

                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2 Words</span>
                  <span>6 Words</span>
                </div>

                <div className={`mt-4 px-3 py-2 rounded-lg ${
                  darkMode ? 'bg-dark-700 border border-dark-600' : 'bg-blue-50 border border-blue-100'
                } text-xs flex items-start`}>
                  <Info size={14} className={`${darkMode ? 'text-primary-400' : 'text-primary-500'} mt-0.5 mr-2 flex-shrink-0`} />
                  <div>
                    <p className="mb-1"><strong>Examples:</strong></p>
                    <p>2 words: <span className="font-mono">RedHouse42</span></p>
                    <p>4 words: <span className="font-mono">GreenBook-Run-Fast</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Character count slider - only show if using characters */}
            {!useWords && (
              <div className="mb-6 w-full">
                <div className="flex justify-between items-center mb-2">
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Length
                  </label>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    darkMode ? 'bg-dark-700 border border-dark-600' : 'bg-gray-100 border border-gray-200'
                  } font-mono`}>
                    {Math.max(12, wordCount * 3)}
                  </span>
                </div>

                <input
                  type="range"
                  min="4"
                  max="8"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-lg appearance-none cursor-pointer"
                />

                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>12 Chars</span>
                  <span>24 Chars</span>
                </div>
              </div>
            )}

            {/* Word separators - only if using words */}
            {useWords && (
              <div className="mb-6 w-full">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Word Separator
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {['-', '.', '_', ''].map(sep => (
                    <button
                      key={sep}
                      className={`py-3 px-4 rounded-md font-medium transition-all ${
                        wordSeparator === sep
                          ? `${darkMode
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-primary-500 text-white shadow-sm border border-primary-600'}`
                          : `${darkMode
                              ? 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`
                      } hover:shadow-md`}
                      onClick={() => setWordSeparator(sep)}
                    >
                      {sep === '' ? 'None' : sep}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Word style - only if using words */}
            {useWords && (
              <div className="mb-6 w-full">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Text Style
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    className={`py-3 px-4 rounded-md font-medium transition-all ${
                      wordCase === 'mixed'
                        ? `${darkMode
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-primary-500 text-white shadow-sm border border-primary-600'}`
                        : `${darkMode
                            ? 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`
                    } hover:shadow-md`}
                    onClick={() => setWordCase('mixed')}
                  >
                    Mixed Case
                  </button>
                  <button
                    className={`py-3 px-4 rounded-md font-medium transition-all ${
                      wordCase === 'camel'
                        ? `${darkMode
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-primary-500 text-white shadow-sm border border-primary-600'}`
                        : `${darkMode
                            ? 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`
                    } hover:shadow-md`}
                    onClick={() => setWordCase('camel')}
                  >
                    camelCase
                  </button>
                  <button
                    className={`py-3 px-4 rounded-md font-medium transition-all ${
                      wordCase === 'title'
                        ? `${darkMode
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-primary-500 text-white shadow-sm border border-primary-600'}`
                        : `${darkMode
                            ? 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`
                    } hover:shadow-md`}
                    onClick={() => setWordCase('title')}
                  >
                    Title Case
                  </button>
                  <button
                    className={`py-3 px-4 rounded-md font-medium transition-all ${
                      wordCase === 'lower'
                        ? `${darkMode
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-primary-500 text-white shadow-sm border border-primary-600'}`
                        : `${darkMode
                            ? 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`
                    } hover:shadow-md`}
                    onClick={() => setWordCase('lower')}
                  >
                    lowercase
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 w-full">
              <label className={`flex items-center space-x-2 p-3 rounded-lg transition-all hover:bg-dark-700/30 border ${
                darkMode ? 'border-dark-600' : 'border-gray-200'
              }`}>
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={() => setIncludeNumbers(!includeNumbers)}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm">Add Numbers</span>
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
                <span className="text-sm">Add Symbols</span>
              </label>
            </div>
          </>
        )}

        {/* Advanced Options Toggle */}
        <button
          className={`w-full flex justify-between items-center py-3 px-4 rounded-lg transition-all my-3 ${
            darkMode
              ? (showAdvanced ? 'bg-primary-600 text-white border border-primary-700' : 'bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600')
              : (showAdvanced ? 'bg-primary-500 text-white border border-primary-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300')
          }`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span className="font-medium flex items-center">
            <Sliders size={16} className="mr-2" />
            Advanced Options
          </span>
          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {/* Advanced Options Panel */}
        {showAdvanced && (
          <div className={`p-4 rounded-lg mb-4 animate-fadeIn w-full max-w-full overflow-visible ${
            darkMode ? 'bg-dark-700/70 border border-dark-600' : 'bg-gray-100 border border-gray-300'
          }`}>
            <div className="grid grid-cols-1 gap-3 mb-4 w-full">
              <label className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-600/40 transition-all border ${
                darkMode ? 'border-dark-600' : 'border-gray-200'
              }`}>
                <input
                  type="checkbox"
                  checked={avoidAmbiguous}
                  onChange={() => setAvoidAmbiguous(!avoidAmbiguous)}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm">Avoid look-alike characters (Il1O0)</span>
              </label>

              <label className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-600/40 transition-all border ${
                darkMode ? 'border-dark-600' : 'border-gray-200'
              }`}>
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={() => setExcludeSimilar(!excludeSimilar)}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm">Exclude similar characters (i, l, 1, L, o, O, 0)</span>
              </label>

              <div className="mt-2">
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Exclude specific characters:
                </label>
                <input
                  type="text"
                  value={customExclusions}
                  onChange={(e) => setCustomExclusions(e.target.value)}
                  placeholder="Characters to exclude"
                  className={`w-full p-2.5 rounded-lg ${
                    darkMode
                      ? 'bg-dark-600 text-white border-dark-500 focus:border-primary-500'
                      : 'bg-white text-gray-800 border-gray-300 focus:border-primary-400'
                  } border focus:ring-2 focus:ring-primary-500/20 transition-all`}
                />
              </div>
            </div>

            {/* Password Expiration Timer */}
            <div className="mt-4 border-t pt-4 border-gray-700/30 w-full">
              <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password Expiration
              </h4>

              <label className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-600/40 transition-all border ${
                darkMode ? 'border-dark-600' : 'border-gray-200'
              } mb-3`}>
                <input
                  type="checkbox"
                  checked={expirationEnabled}
                  onChange={() => {
                    const newEnabled = !expirationEnabled;
                    setExpirationEnabled(newEnabled);

                    if (newEnabled) {
                      setExpirationRemaining(expirationTime * 60);
                      setIsExpired(false);
                    }
                  }}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm">Enable password expiration timer</span>
              </label>

              {expirationEnabled && (
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Expires after (minutes):
                    </label>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      darkMode ? 'bg-dark-600 border border-dark-500' : 'bg-gray-100 border border-gray-200'
                    } font-mono`}>
                      {expirationTime}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={expirationTime}
                    onChange={(e) => {
                      const newTime = parseInt(e.target.value);
                      setExpirationTime(newTime);
                      if (expirationEnabled) {
                        setExpirationRemaining(newTime * 60);
                        setIsExpired(false);
                      }
                    }}
                    className="w-full h-2 bg-gradient-to-r from-danger-400 to-warning-500 rounded-lg appearance-none cursor-pointer"
                  />

                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 min</span>
                    <span>60 min</span>
                  </div>

                  <div className={`mt-2 px-3 py-2 rounded-lg text-xs ${
                    darkMode ? 'bg-amber-900/30 border border-amber-800/50 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-700'
                  }`}>
                    <Timer size={12} className="inline-block mr-1" />
                    Temporary passwords will be marked as expired after the set time. Useful for sharing one-time access passwords.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile-specific styling */}
      <style jsx>{`
        /* Ensure password settings always expand to full width */
        div {
          box-sizing: border-box;
        }

        /* Ensure elements take full width of their container */
        .w-full {
          width: 100% !important;
          max-width: 100% !important;
        }

        /* Fix overflow issues */
        .overflow-visible {
          overflow: visible !important;
          overflow-x: visible !important;
          overflow-y: visible !important;
        }

        /* Ensure parent containers don't clip children */
        div[class*="PasswordSettings"] {
          width: 100% !important;
          max-width: 100% !important;
          overflow: visible !important;
        }

        /* Prevent horizontal scrolling */
        body, html {
          overflow-x: hidden;
        }

        /* Fix password input container */
        .password-input-container {
          position: relative;
          z-index: 10;
          opacity: 1 !important;
          pointer-events: auto !important;
        }

        /* Fix visibility and display issues */
        .password-box, .settings-container {
          opacity: 1 !important;
          pointer-events: auto !important;
        }

        /* Fix dark mode contrast */
        input, textarea {
          background-color: ${darkMode ? '#1e1e2f' : '#ffffff'};
          color: ${darkMode ? '#ffffff' : '#000000'};
        }

        @media (max-width: 640px) {
          /* Mobile-specific fixes */
          div {
            max-width: 100%;
            width: 100%;
          }

          /* Force buttons to wrap properly on small screens */
          .grid {
            grid-template-columns: 1fr;
          }

          /* Override grid for character options on slightly larger screens */
          @media (min-width: 480px) {
            .grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          /* Add some breathing room */
          button, label, input {
            margin-bottom: 4px;
          }
        }
      `}</style>

      {/* Add this additional styling to ensure proper containment */}
      <style jsx global>{`
        /* Fix password settings container */
        [class*="PasswordSettings"] {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow: visible !important;
          position: relative !important;
          z-index: 5 !important;
        }

        /* Ensure correct stacking */
        .settings-container {
          overflow: visible !important;
          width: 100% !important;
          max-width: 100% !important;
          position: relative !important;
          z-index: 5 !important;
          opacity: 1 !important;
          visibility: visible !important;
        }

        /* Ensure proper height animation */
        .transition-all {
          transition-property: opacity, max-height !important;
          transition-duration: 300ms !important;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Fix padding and margin */
        .p-6 {
          padding: 1.5rem !important;
        }

        /* Fix border radius */
        .rounded-b-xl {
          border-bottom-left-radius: 0.75rem !important;
          border-bottom-right-radius: 0.75rem !important;
        }

        /* Fix border */
        .border-t {
          border-top-width: 1px !important;
        }

        /* Fix width */
        .w-full {
          width: 100% !important;
        }

        /* Fix animations */
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out forwards !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Fix overflow */
        .overflow-visible {
          overflow: visible !important;
        }

        /* Fix absolute positioning */
        .absolute {
          position: absolute !important;
        }

        /* Fix z-index */
        .z-10 {
          z-index: 10 !important;
        }

        /* Fix grid */
        .grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
      `}</style>
    </div>
  );
};

export default PasswordSettings;
