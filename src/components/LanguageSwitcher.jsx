import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../i18n';

const LanguageSwitcher = ({ darkMode }) => {
  const [showLanguages, setShowLanguages] = useState(false);
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '/flags/en.svg' },
    { code: 'es', name: 'Español', flag: '/flags/es.svg' },
    { code: 'fr', name: 'Français', flag: '/flags/fr.svg' },
    { code: 'de', name: 'Deutsch', flag: '/flags/de.svg' },
    { code: 'ar', name: 'العربية', flag: '/flags/ar.svg', rtl: true },
    { code: 'ja', name: '日本語', flag: '/flags/ja.svg' },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng).then(() => {
      setShowLanguages(false);
      // Update document direction for RTL languages
      const isRTL = ['ar'].includes(lng);
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      // Store language preference
      localStorage.setItem('language', lng);
    });
  };

  return (
    <div className="language-switcher relative">
      <button
        onClick={() => setShowLanguages(!showLanguages)}
        className={`p-2 rounded-full ${
          darkMode 
            ? 'bg-dark-700 hover:bg-dark-600 text-gray-300' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        } flex items-center justify-center transition-all`}
        aria-label={t('settings.languageSelect')}
        title={t('settings.languageSelect')}
      >
        <Globe size={18} />
      </button>

      {showLanguages && (
        <div 
          className="language-options"
          onMouseLeave={() => setShowLanguages(false)}
        >
          {languages.map(language => (
            <div
              key={language.code}
              className={`language-option ${i18n.language === language.code ? 'active' : ''}`}
              onClick={() => changeLanguage(language.code)}
            >
              <img 
                src={language.flag} 
                alt={`${language.name} flag`} 
                className="language-flag"
                onError={(e) => {
                  e.target.src = '/flags/placeholder.svg'; // Fallback image
                  e.target.onerror = null;
                }}
              />
              <span>{language.name}</span>
              {i18n.language === language.code && (
                <span className="ml-auto">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
