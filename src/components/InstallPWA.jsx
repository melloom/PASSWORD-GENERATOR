import React, { useState, useEffect } from 'react';
import { Home } from 'lucide-react';

const InstallPWA = ({ darkMode }) => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({ type: 'unknown' });

  // Enhanced browser detection
  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    
    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return {
        type: 'iOS',
        isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent) && !/CriOS/.test(userAgent),
        isChrome: /CriOS/.test(userAgent),
        standalone: window.navigator.standalone === true
      };
    }
    
    // Android detection
    if (/Android/.test(userAgent)) {
      return {
        type: 'Android',
        isChrome: /Chrome/.test(userAgent) && !/Edg/.test(userAgent),
        isSamsung: /SamsungBrowser/.test(userAgent),
        isFirefox: /Firefox/.test(userAgent)
      };
    }
    
    // Desktop detection
    if (/Windows|Macintosh|Linux/.test(userAgent)) {
      return {
        type: 'Desktop',
        isChrome: /Chrome/.test(userAgent) && !/Edg/.test(userAgent),
        isFirefox: /Firefox/.test(userAgent),
        isEdge: /Edg/.test(userAgent),
        isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
      };
    }
    
    return { type: 'Unknown' };
  };

  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
      console.log("Install prompt detected and stored for later use");
    };

    // Check if the app is already in standalone mode (PWA installed)
    const checkIfStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');

      setIsStandalone(isStandalone);
    };

    // Detect browser type
    const browser = detectBrowser();
    setBrowserInfo(browser);
    console.log("Browser detected:", browser);

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
      setInstallPrompt(null);
    });

    // Check immediately if we're in standalone mode
    checkIfStandalone();

    // Also check whenever visibility changes (app might be installed in background)
    document.addEventListener('visibilitychange', checkIfStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => setIsAppInstalled(true));
      document.removeEventListener('visibilitychange', checkIfStandalone);
    };
  }, []);

  const handleInstallClick = async () => {
    // For browsers that support the install prompt API
    if (installPrompt) {
      try {
        // Show the install prompt
        installPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;
        console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);

        // Clear the saved prompt, it can only be used once
        setInstallPrompt(null);
      } catch (error) {
        console.error("Error during installation:", error);
        // Fall back to showing manual instructions
        showManualInstructions();
      }
    } else {
      // For iOS and other browsers that don't support the install prompt
      showManualInstructions();
    }
  };

  // Show manual installation instructions based on browser
  const showManualInstructions = () => {
    // Use the global function if available (from index.html)
    if (window.showPWAInstallInstructions) {
      window.showPWAInstallInstructions();
    } else {
      // Fallback if the global function isn't available
      const isIOS = browserInfo.type === 'iOS';
      const isAndroid = browserInfo.type === 'Android';
      
      let instructionText = "";
      if (isIOS) {
        instructionText = "Open this site in Safari, tap the share icon, then 'Add to Home Screen'";
      } else if (isAndroid) {
        instructionText = "Tap the menu (⋮), then 'Add to Home screen'";
      } else {
        instructionText = "Look for the install icon in your browser's address bar";
      }
      
      alert(`To install: ${instructionText}`);
    }
  };

  // Don't render the button if already in standalone mode or if install isn't available
  if (isStandalone || isAppInstalled) {
    return (
      <div className="relative">
        <Home
          size={24}
          className={`${darkMode ? 'text-green-400' : 'text-green-500'}
            filter drop-shadow-[0_0_3px_rgba(34,197,94,0.7)]
            animate-pulse`}
        />
        {/* Small green dot indicator */}
        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full"></div>
      </div>
    );
  }

  // Show install button specific to platform
  const buttonText = browserInfo.type === 'iOS' ? "Install App" : 
                     browserInfo.type === 'Android' ? "Add to Home" :
                     "Install App";

  return (
    <button
      onClick={handleInstallClick}
      className={`flex items-center justify-center px-3 py-2 rounded-lg
        ${darkMode
          ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'}
        transition-all`}
      title="Install app on your device"
    >
      <Home size={20} className="mr-2" />
      <span className="text-sm">{buttonText}</span>
    </button>
  );
};

export default InstallPWA;
