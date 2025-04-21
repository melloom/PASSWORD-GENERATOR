import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

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