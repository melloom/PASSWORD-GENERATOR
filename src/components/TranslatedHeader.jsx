import React from 'react';
import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const TranslatedHeader = ({ darkMode, onMenuClick, onInstallClick, installPrompt }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <Shield className={`${darkMode ? 'text-primary-400' : 'text-primary-500'} mr-1.5`} size={24} />
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
          {t('app.name')}
        </h1>
        <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('app.tagline')}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <LanguageSwitcher darkMode={darkMode} />
        
        {installPrompt && (
          <button
            onClick={onInstallClick}
            className={`p-2 rounded-full ${
              darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'
            } relative transition-all shadow-sm hover:shadow flex items-center justify-center`}
            title={t('common.install')}
            aria-label={t('common.install')}
          >
            <HomeIcon size={18} className={darkMode ? 'text-primary-300' : 'text-primary-600'} />
          </button>
        )}
        
        <button
          onClick={onMenuClick}
          className={`p-2 rounded-full ${
            darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'
          } relative transition-all shadow-sm hover:shadow flex items-center justify-center`}
          title={t('common.menu')}
          aria-label={t('common.menu')}
        >
          <Menu size={18} className={darkMode ? 'text-primary-300' : 'text-primary-600'} />
        </button>
      </div>
    </div>
  );
};

export default TranslatedHeader;
