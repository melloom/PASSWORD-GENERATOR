import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

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

// Install prompt component
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;

  // Show the install button if not on iOS
  if (!(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)) {
    // Wait for app to load
    setTimeout(() => {
      const installBanner = document.createElement('div');
      installBanner.id = 'install-app-banner';
      installBanner.style.position = 'fixed';
      installBanner.style.bottom = '10px';
      installBanner.style.left = '50%';
      installBanner.style.transform = 'translateX(-50%)';
      installBanner.style.backgroundColor = '#3b82f6';
      installBanner.style.color = 'white';
      installBanner.style.padding = '10px 20px';
      installBanner.style.borderRadius = '8px';
      installBanner.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      installBanner.style.zIndex = '9999';
      installBanner.style.display = 'flex';
      installBanner.style.alignItems = 'center';
      installBanner.style.justifyContent = 'space-between';

      installBanner.innerHTML = `
        <span style="margin-right: 15px;">Install Password Generator</span>
        <button id="install-button" style="background:#fff;color:#3b82f6;border:none;padding:5px 10px;border-radius:4px;">Install</button>
      `;

      document.body.appendChild(installBanner);

      document.getElementById('install-button').addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
          deferredPrompt = null;
          installBanner.style.display = 'none';
        }
      });

      // Add close button
      const closeButton = document.createElement('button');
      closeButton.textContent = '×';
      closeButton.style.marginLeft = '10px';
      closeButton.style.background = 'transparent';
      closeButton.style.border = 'none';
      closeButton.style.color = 'white';
      closeButton.style.fontSize = '20px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.padding = '0 5px';

      closeButton.addEventListener('click', () => {
        installBanner.style.display = 'none';
        localStorage.setItem('install-banner-dismissed', 'true');
      });

      installBanner.appendChild(closeButton);

      // Check if previously dismissed
      if (localStorage.getItem('install-banner-dismissed')) {
        installBanner.style.display = 'none';
      }
    }, 3000);
  }
});

// Log to help debug startup issues
console.log('React initialization starting...');

// Create a root for concurrent React
const root = ReactDOM.createRoot(document.getElementById('root'));

// Wrap rendering in try-catch to identify errors
try {
  // Render the app with React 18 syntax
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React render completed');
} catch (error) {
  console.error('Failed to render React application:', error);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// Report web vitals
reportWebVitals();