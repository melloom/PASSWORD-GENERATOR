import React, { useState, useEffect } from 'react';
import { Home } from 'lucide-react';

const InstallPWA = ({ darkMode }) => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
    };

    // Check if the app is already in standalone mode (PWA installed)
    const checkIfStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');

      setIsStandalone(isStandalone);
    };

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
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);

    // Clear the saved prompt, it can only be used once
    setInstallPrompt(null);
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

  if (!installPrompt) return null;

  return (
    <button
      onClick={handleInstallClick}
      className={`flex items-center justify-center px-3 py-2 rounded-lg
        ${darkMode
          ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'}
        transition-all`}
      title="Install app on desktop"
    >
      <Home size={20} className="mr-2" />
      <span className="text-sm">Install App</span>
    </button>
  );
};

export default InstallPWA;
