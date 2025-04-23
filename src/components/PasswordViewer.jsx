import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertTriangle, Copy, Check, ArrowLeft } from 'lucide-react';

const PasswordViewer = ({ darkMode }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    try {
      const hash = window.location.hash.substring(1); // Get data after #
      const params = new URLSearchParams(hash);
      
      // Simplified handling without secure tokens
      const encodedPassword = params.get('data');

      if (encodedPassword) {
        try {
          const decodedPassword = atob(encodedPassword); // Decode Base64
          setPassword(decodedPassword);
        } catch (e) {
          setError('Invalid password format');
        }
      } else {
        setError('No password data found in the link.');
      }
    } catch (e) {
      console.error("Failed to decode password:", e);
      setError('Invalid or corrupted password link.');
    }
  }, []);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-dark-900 text-gray-200' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800'}`}>
      <div className={`w-full max-w-md p-6 rounded-xl shadow-lg ${darkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}`}>
        <h2 className="text-xl font-semibold mb-4 text-center">Shared Password</h2>

        {error ? (
          <div className={`p-4 rounded-lg text-sm ${darkMode ? 'bg-red-900/30 text-red-300 border border-red-700/50' : 'bg-red-100 text-red-700 border border-red-200'} flex items-center`}>
            <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
            {error}
          </div>
        ) : (
          <>
            <div className={`mb-4 p-4 rounded-lg border-2 ${darkMode ? 'bg-yellow-900/20 border-yellow-700/60' : 'bg-yellow-50 border-yellow-300'} flex items-start`}>
              <AlertTriangle size={20} className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-0.5 mr-3 flex-shrink-0`} />
              <div>
                <h4 className={`font-medium mb-1 ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>Security Warning</h4>
                <p className={`text-xs ${darkMode ? 'text-yellow-400/90' : 'text-yellow-700'}`}>
                  This link contains sensitive information. Do not share it further unless you trust the recipient completely. Consider this password potentially compromised if the link was shared insecurely.
                </p>
              </div>
            </div>

            <div className="mb-4 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                readOnly
                value={password}
                className={`w-full p-3 pr-10 rounded-lg font-mono text-lg border ${darkMode ? 'bg-dark-700 text-white border-dark-600' : 'bg-gray-100 text-gray-800 border-gray-300'}`}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-0 px-3 flex items-center ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              onClick={handleCopy}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                showCopied
                  ? (darkMode ? 'bg-green-700 text-white border-green-600' : 'bg-green-100 text-green-800 border-green-300')
                  : (darkMode ? 'bg-primary-600 hover:bg-primary-500 text-white' : 'bg-primary-500 hover:bg-primary-400 text-white')
              }`}
            >
              {showCopied ? (
                <>
                  <Check size={18} className="mr-2" />
                  Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy size={18} className="mr-2" />
                  Copy Password
                </>
              )}
            </button>
          </>
        )}
         <div className="mt-6">
          <a 
            href="/" 
            className={`flex items-center justify-center py-3 px-4 rounded-lg transition-all ${
              darkMode ? 'bg-dark-700 hover:bg-dark-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Password Generator
          </a>
        </div>
      </div>
    </div>
  );
};

export default PasswordViewer;
