import React, { useState, useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';

const SecurityBanner = ({ darkMode }) => {
  const [isPWA, setIsPWA] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is running as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  window.navigator.standalone === true;
    
    // Check if device is mobile
    const isMobile = window.matchMedia('(max-width: 768px)').matches || 
                    window.matchMedia('(pointer: coarse)').matches ||
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check if device is iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    setIsPWA(isPWA);
    setIsMobile(isMobile);
    setIsIOS(isIOS);
    
    if (isPWA && isMobile) {
      // Add a class to body for additional PWA-specific styling
      document.body.classList.add('pwa-mode');
      
      if (isIOS) {
        document.body.classList.add('ios-pwa');
      }
    }
    
    return () => {
      document.body.classList.remove('pwa-mode', 'ios-pwa');
    };
  }, []);

  return (
    <>
      {/* Mobile PWA Status Bar - Only visible in mobile PWA mode */}
      {isPWA && isMobile && (
        <div 
          className="pwa-mobile-status-bar"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 'env(safe-area-inset-top, 44px)',
            backgroundColor: darkMode ? '#0f172a' : '#f8fafc', // More contrast for dark mode
            zIndex: 9999,
            boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'background-color 0.3s ease'
          }}
        >
          {/* Status bar icon for visual interest in PWA mode */}
          {isIOS && (
            <div 
              style={{
                position: 'absolute',
                bottom: '2px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.6
              }}
            >
              <Lock size={12} className={darkMode ? 'text-primary-400' : 'text-primary-500'} />
            </div>
          )}
        </div>
      )}
      
      {/* Security Banner - Always visible, not dismissible */}
      <div 
        className={`py-2.5 px-4 flex items-center justify-center gap-2 ${
          darkMode 
            ? 'bg-blue-900/40 text-blue-200 border-b border-blue-800/50' 
            : 'bg-blue-50 text-blue-800 border-b border-blue-100'
        }`}
        style={{
          position: 'relative',
          zIndex: 1000,
          marginTop: isPWA && isMobile ? 'env(safe-area-inset-top, 44px)' : 0,
          transition: 'background-color 0.3s ease, margin-top 0.3s ease',
          animation: 'fadeIn 0.5s ease-in-out'
        }}
      >
        <Shield size={16} className="flex-shrink-0" />
        <span className="text-sm font-medium">
          Password security: All processing happens locally in your browser
        </span>
      </div>
      
      {/* Add some animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (display-mode: standalone) {
          .pwa-mobile-status-bar {
            background-image: ${darkMode 
              ? 'linear-gradient(to bottom, rgba(15, 23, 42, 1), rgba(15, 23, 42, 0.95))'
              : 'linear-gradient(to bottom, rgba(248, 250, 252, 1), rgba(248, 250, 252, 0.95))'
            };
          }
        }
      `}</style>
    </>
  );
};

export default SecurityBanner;
