import React, { useState } from 'react';
import { Copy, Lock, ArrowRight, Check } from 'lucide-react';

const PasswordHistory = ({ history = [], darkMode, onUse }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Helper function to localize text (temporary until i18next is set up)
  const t = (key) => {
    const translations = {
      'passwordHistory.empty': 'No password history yet',
      'passwordHistory.title': 'Password History',
      'passwordHistory.timestamp': 'Generated',
      'common.characters': 'characters',
      'common.copy': 'Copy',
      'common.use': 'Use'
    };
    return translations[key] || key;
  };

  const handleCopy = (password, index) => {
    navigator.clipboard.writeText(password)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch(err => console.error('Failed to copy password:', err));
  };

  if (history.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center">
        <Lock size={36} className={`${darkMode ? 'text-gray-600' : 'text-gray-400'} mb-3`} />
        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
          {t('passwordHistory.empty')}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Title - simplified header without tabs */}
      <h3 className={`p-3 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <Lock size={16} className="mr-2 inline" />
        {t('passwordHistory.title')}
      </h3>
      
      {/* Password history list - now always displayed */}
      <div className="p-4 space-y-3">
        {history.map((item, index) => (
          <div key={index} className={`p-3 rounded-lg ${
            darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-50 hover:bg-gray-100'
          } transition-colors cursor-default`}>
            <div className={`font-mono text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {item.password.substring(0, 35)}{item.password.length > 35 ? '...' : ''}
            </div>
            <div className={`flex items-center justify-between ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="flex items-center text-xs">
                <span>
                  {t('passwordHistory.timestamp')}: {item.timestamp}
                </span>
                <span className="mx-2">•</span>
                <span>
                  {item.type === 'memorable' ? 'Memorable' : 'Random'} ({item.length} {t('common.characters')})
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleCopy(item.password, index)}
                  className={`p-1.5 rounded ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-200'}`}
                  title={t('common.copy')}
                >
                  {copiedIndex === index ? 
                    <Check size={16} className={darkMode ? 'text-green-400' : 'text-green-500'} /> :
                    <Copy size={16} />
                  }
                </button>
                <button
                  onClick={() => onUse(item.password)}
                  className={`p-1.5 rounded ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-200'}`}
                  title={t('common.use')}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordHistory;