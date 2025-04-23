import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import './styles/overrides.css'; // Import last to ensure it takes priority

// Error boundary component for catching render errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App crashed:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-boundary">
          <h1>Something went wrong</h1>
          <p>The application encountered an error. Please try refreshing the page.</p>
          {this.state.error && (
            <div className="error-details">
              <p><strong>Error:</strong> {this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <details>
                  <summary>Component Stack</summary>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </details>
              )}
            </div>
          )}
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Ensure public URL is properly handled for production
const rootElement = document.getElementById('root');

// Update manifest paths if needed
const updateManifestPath = () => {
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink && process.env.PUBLIC_URL) {
    manifestLink.href = `${process.env.PUBLIC_URL}/manifest.webmanifest`;
  }
};

updateManifestPath();

// Install prompt component - Enhanced for cross-browser compatibility
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  console.log('Install prompt detected and stored for later use');

  // Show the install button across all supported browsers
  setTimeout(() => {
    // Check if banner was previously dismissed
    if (localStorage.getItem('install-banner-dismissed')) {
      return;
    }

    const installBanner = document.createElement('div');
    installBanner.id = 'install-app-banner';
    installBanner.style.position = 'fixed';
    installBanner.style.bottom = '10px';
    installBanner.style.left = '50%';
    installBanner.style.transform = 'translateX(-50%)';
    installBanner.style.backgroundColor = '#3b82f6';
    installBanner.style.color = 'white';
    installBanner.style.padding = '12px 20px';
    installBanner.style.borderRadius = '12px';
    installBanner.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
    installBanner.style.zIndex = '9999';
    installBanner.style.display = 'flex';
    installBanner.style.alignItems = 'center';
    installBanner.style.justifyContent = 'space-between';
    installBanner.style.maxWidth = '90%';
    installBanner.style.width = '370px';
    installBanner.style.fontWeight = '500';

    installBanner.innerHTML = `
      <div style="margin-right: 15px; font-size: 15px;">Install Password Generator for offline use</div>
      <div style="display: flex; align-items: center;">
        <button id="install-button" style="background:#fff;color:#3b82f6;border:none;padding:8px 16px;border-radius:8px;font-weight:600;font-size:14px;">Install</button>
      </div>
    `;

    document.body.appendChild(installBanner);

    document.getElementById('install-button').addEventListener('click', async () => {
      // Hide the banner first
      installBanner.style.display = 'none';
      
      if (deferredPrompt) {
        try {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
          deferredPrompt = null;

          if (outcome === 'accepted') {
            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'install-notification';
            notification.style.position = 'fixed';
            notification.style.bottom = '10px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = '#16a34a';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '8px';
            notification.style.zIndex = '9999';
            notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            notification.textContent = '✓ App installed successfully!';
            document.body.appendChild(notification);

            setTimeout(() => {
              document.body.removeChild(notification);
            }, 3000);
          }
        } catch (error) {
          console.error('Installation prompt failed:', error);
          // Show manual installation instructions for this platform
          showPlatformSpecificInstructions();
        }
      } else {
        // If no prompt is available, show manual installation instructions
        showPlatformSpecificInstructions();
      }
    });

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.marginLeft = '10px';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0 5px';
    closeButton.style.lineHeight = '1';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';

    closeButton.addEventListener('click', () => {
      installBanner.style.display = 'none';
      localStorage.setItem('install-banner-dismissed', 'true');
    });

    installBanner.querySelector('div:last-child').appendChild(closeButton);

    // Function to show platform-specific instructions when browser-based install fails
    function showPlatformSpecificInstructions() {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);
      
      // Determine dark mode from system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const instructionsModal = document.createElement('div');
      instructionsModal.style.position = 'fixed';
      instructionsModal.style.inset = '0';
      instructionsModal.style.backgroundColor = 'rgba(0,0,0,0.7)';
      instructionsModal.style.backdropFilter = 'blur(4px)';
      instructionsModal.style.zIndex = '10000';
      instructionsModal.style.display = 'flex';
      instructionsModal.style.alignItems = 'center';
      instructionsModal.style.justifyContent = 'center';
      instructionsModal.style.padding = '16px';
      
      let instructions = '';
      
      if (isIOS) {
        instructions = `
          <h2 style="margin-top:0;font-size:18px;">Install on iOS</h2>
          <ol style="padding-left:20px;margin-bottom:20px;text-align:left;">
            <li style="margin-bottom:10px;">Tap the <strong>Share</strong> button at the bottom of the browser</li>
            <li style="margin-bottom:10px;">Scroll down and tap <strong>"Add to Home Screen"</strong></li>
            <li>Tap <strong>"Add"</strong> in the top-right corner</li>
          </ol>
        `;
      } else if (isAndroid) {
        instructions = `
          <h2 style="margin-top:0;font-size:18px;">Install on Android</h2>
          <ol style="padding-left:20px;margin-bottom:20px;text-align:left;">
            <li style="margin-bottom:10px;">Tap the menu button (⋮) in the top right</li>
            <li style="margin-bottom:10px;">Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></li>
            <li>Follow the on-screen instructions</li>
          </ol>
        `;
      } else {
        instructions = `
          <h2 style="margin-top:0;font-size:18px;">Install as app</h2>
          <ol style="padding-left:20px;margin-bottom:20px;text-align:left;">
            <li style="margin-bottom:10px;">Click the install icon in the address bar</li>
            <li style="margin-bottom:10px;">Or open browser menu and select <strong>"Install"</strong></li>
            <li>Follow the on-screen instructions</li>
          </ol>
        `;
      }
      
      instructionsModal.innerHTML = `
        <div style="background:${prefersDarkMode ? '#1e1e2f' : 'white'};color:${prefersDarkMode ? 'white' : 'black'};border-radius:12px;padding:20px;max-width:340px;text-align:center;position:relative;box-shadow:0 4px 20px rgba(0,0,0,0.2);">
          <button style="position:absolute;top:12px;right:12px;background:none;border:none;font-size:24px;color:${prefersDarkMode ? '#aaa' : '#666'};cursor:pointer;">×</button>
          ${instructions}
          <button style="background:#3b82f6;color:white;border:none;padding:10px 20px;border-radius:8px;font-weight:600;width:100%;margin-top:10px;">Got it</button>
        </div>
      `;
      
      document.body.appendChild(instructionsModal);
      
      // Close button handler
      const closeModalBtn = instructionsModal.querySelector('button');
      closeModalBtn.addEventListener('click', () => document.body.removeChild(instructionsModal));
      
      // Got it button handler
      const gotItBtn = instructionsModal.querySelector('button:last-child');
      gotItBtn.addEventListener('click', () => document.body.removeChild(instructionsModal));
    }
  }, 3000);
});

// Track standalone mode and mark as installed if already running as PWA
window.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    localStorage.setItem('install-banner-dismissed', 'true');
    console.log('App is already installed and running in standalone mode');
  }
});

// Add PWA detection and fix status bar styles
window.addEventListener('DOMContentLoaded', () => {
  // Detect if running as installed PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
  
  if (isStandalone) {
    // Mark as installed in localStorage
    localStorage.setItem('install-banner-dismissed', 'true');
    console.log('App is already installed and running in standalone mode');
    
    // Apply PWA-specific styling
    document.body.classList.add('pwa-mode');
    
    // Fix status bar spacer for desktop vs mobile
    const isDesktop = window.innerWidth >= 769 && window.innerHeight >= 601;
    const statusBarSpacer = document.querySelector('.pwa-status-bar-spacer');
    
    if (statusBarSpacer) {
      if (isDesktop) {
        // Hide status bar spacer on desktop
        statusBarSpacer.style.display = 'none';
        statusBarSpacer.style.height = '0';
      } else {
        // Show status bar spacer only on mobile devices
        statusBarSpacer.style.display = 'block';
        statusBarSpacer.style.height = 'env(safe-area-inset-top, 44px)';
        // Set background color based on theme
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        statusBarSpacer.style.backgroundColor = prefersDarkMode ? '#0f172a' : '#e0e7ff';
      }
    }
    
    // Add resize listener to handle orientation changes
    window.addEventListener('resize', () => {
      const isDesktopNow = window.innerWidth >= 769 && window.innerHeight >= 601;
      if (statusBarSpacer) {
        statusBarSpacer.style.display = isDesktopNow ? 'none' : 'block';
        statusBarSpacer.style.height = isDesktopNow ? '0' : 'env(safe-area-inset-top, 44px)';
      }
    });
  }
});

// Safer initialization with more error logging
try {
  console.log("Starting React initialization...");

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error("Root element not found in the DOM");
  }

  // For React 18+
  const root = ReactDOM.createRoot(rootElement);

  // Clear any previous fallback content
  if (document.getElementById('fallback-content')) {
    document.getElementById('fallback-content').style.display = 'none';
  }

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  console.log("React rendered successfully");

  // If we're using service worker, register it
  if (typeof serviceWorkerRegistration?.register === 'function') {
    serviceWorkerRegistration.register({
      onUpdate: registration => {
        // Prompt user to refresh for new version
        if (registration && registration.waiting) {
          if (window.confirm('New version available! Reload to update?')) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      }
    });
  }

  // Report web vitals
  reportWebVitals(() => {});

} catch (error) {
  console.error("Failed to initialize React application:", error);

  // Display fallback UI
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div class="app-error-fallback">
        <h1>Password Generator</h1>
        <p>There was an error loading the application.</p>
        <p><strong>Technical details:</strong> ${error.message}</p>
        <button onclick="window.location.reload()">Try Again</button>
        <p class="hint">Try clearing your browser cache or using a different browser.</p>
      </div>
    `;
  }
}