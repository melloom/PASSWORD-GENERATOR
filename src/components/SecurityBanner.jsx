import React, { useState, useEffect } from 'react';
import { Shield, Info, Lock, AlertTriangle, X, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { enforceSecureContext } from '../utils/securityEnhancements';

const SecurityBanner = ({ darkMode }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [secureContext, setSecureContext] = useState(true);
  const [securityInfo, setSecurityInfo] = useState({
    isSecure: true,
    warnings: []
  });
  
  // Check security on mount
  useEffect(() => {
    // Check if we're in a secure context (HTTPS)
    const isSecure = window.isSecureContext;
    setSecureContext(isSecure);
    
    // If not secure, always show the banner
    if (!isSecure) {
      setShowBanner(true);
      setSecurityInfo({
        isSecure: false,
        warnings: ['Application is not running in a secure context (HTTPS)']
      });
    } else {
      // Check if it's the first visit or it's been more than 7 days
      const lastBannerDismiss = localStorage.getItem('security-banner-dismissed');
      const shouldShowBanner = !lastBannerDismiss || 
                              (Date.now() - parseInt(lastBannerDismiss, 10) > 7 * 24 * 60 * 60 * 1000);
      
      if (shouldShowBanner) {
        setShowBanner(true);
      }
    }
    
    // Try to enforce secure context
    try {
      enforceSecureContext();
    } catch (e) {
      console.warn('Could not enforce secure context:', e);
    }
  }, []);
  
  const dismissBanner = () => {
    setShowBanner(false);
    // Only save dismiss time if we're in a secure context
    if (secureContext) {
      localStorage.setItem('security-banner-dismissed', Date.now().toString());
    }
  };

  if (!showBanner) return null;
  
  return (
    <div className={`w-full py-2 px-4 ${
      secureContext 
        ? (darkMode ? 'bg-primary-900/30 border-b border-primary-800/50' : 'bg-primary-50 border-b border-primary-200') 
        : (darkMode ? 'bg-danger-900/30 border-b border-danger-800/50' : 'bg-danger-50 border-b border-danger-200')
    }`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {secureContext ? (
            <Shield size={16} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
          ) : (
            <AlertTriangle size={16} className={`mr-2 ${darkMode ? 'text-danger-400' : 'text-danger-600'}`} />
          )}
          <span className={`text-sm ${
            secureContext 
              ? (darkMode ? 'text-primary-300' : 'text-primary-700') 
              : (darkMode ? 'text-danger-300' : 'text-danger-700')
          }`}>
            {secureContext 
              ? 'This password generator runs locally in your browser for maximum security.' 
              : 'Warning: Not running in a secure context. Your data may be at risk.'}
          </span>
        </div>
        
        <div className="flex items-center">
          <button 
            onClick={() => setExpanded(!expanded)}
            className={`mr-3 text-xs flex items-center ${
              secureContext 
                ? (darkMode ? 'text-primary-300 hover:text-primary-200' : 'text-primary-700 hover:text-primary-800')
                : (darkMode ? 'text-danger-300 hover:text-danger-200' : 'text-danger-700 hover:text-danger-800')
            }`}
          >
            {expanded ? <ChevronDown size={14} className="mr-1" /> : <ChevronRight size={14} className="mr-1" />}
            {expanded ? 'Hide details' : 'Learn more'}
          </button>
          
          <button
            onClick={dismissBanner}
            className={`p-1 rounded-full ${
              secureContext 
                ? (darkMode ? 'hover:bg-primary-800/50' : 'hover:bg-primary-100/80')
                : (darkMode ? 'hover:bg-danger-800/50' : 'hover:bg-danger-100/80')
            }`}
            aria-label="Dismiss security banner"
          >
            <X size={14} className={
              secureContext 
                ? (darkMode ? 'text-primary-300' : 'text-primary-600')
                : (darkMode ? 'text-danger-300' : 'text-danger-600')
            } />
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className={`container mx-auto mt-2 mb-1 text-xs ${
          secureContext 
            ? (darkMode ? 'text-primary-300/90' : 'text-primary-700/90')
            : (darkMode ? 'text-danger-300/90' : 'text-danger-700/90')
        }`}>
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center">
              <Lock size={12} className="mr-1.5 flex-shrink-0" />
              <span>
                All password generation happens on your device, nothing is sent to a server.
              </span>
            </div>
            <div className="flex items-center">
              <Info size={12} className="mr-1.5 flex-shrink-0" />
              <span>
                Passwords are stored in memory only and cleared when you close the browser.
              </span>
            </div>
            <div className="flex items-center">
              <Shield size={12} className="mr-1.5 flex-shrink-0" />
              <span>
                Industry-standard encryption is used for secure password sharing.
              </span>
            </div>
            {!secureContext && (
              <div className="flex items-center text-danger-500">
                <AlertTriangle size={12} className="mr-1.5 flex-shrink-0" />
                <span>
                  For better security, please access this app via HTTPS.
                </span>
              </div>
            )}
            <div className="flex items-center mt-1">
              <a 
                href="https://github.com/melloom/password-generator" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >
                View source code for transparency <ExternalLink size={10} className="ml-1" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityBanner;
