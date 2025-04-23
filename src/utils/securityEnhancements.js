/**
 * Enhanced Security Measures for Password Generator
 * 
 * Current security features:
 * 1. Client-side only - No server communication
 * 2. Uses Web Crypto API for CSPRNG
 * 3. Memory protection techniques
 * 4. Password history stored only in memory, never in localStorage or disk
 * 5. Multiple data clearing processes when closing
 */

export const additionalSecurityMeasures = () => {
  // 1. Content Security Policy
  // Add to meta tag in index.html with strict settings

  // 2. Secure password masking
  // Default password hiding with optional reveal

  // 3. AUTO-CLEARING timers
  // Clear passwords after configured time
  
  // 4. Multiple secure deletion passes
  // Already implemented in securelyDeleteHistory function

  // 5. Environment detection
  // Warn users if in unsecured contexts or iframe embedding
  const detectUnsafeContext = () => {
    if (window !== window.top) {
      console.warn("Application is running in an iframe - security may be compromised");
      return false;
    }
    
    if (!window.isSecureContext) {
      console.warn("Application is not running in a secure context (HTTPS)");
      return false;
    }
    
    return true;
  };

  return detectUnsafeContext();
};

/**
 * Privacy features:
 * 1. No analytics/tracking
 * 2. No cookies
 * 3. No local storage usage
 * 4. No network requests
 */

export const enforceSecureContext = () => {
  // Prevent iframe embedding
  if (window !== window.top) {
    console.error('Application is running in an iframe - security may be compromised');
    alert('This application cannot run securely in an iframe. Please open it in a new tab.');
    window.top.location = window.location.href; // Break out of iframe
  }

  // Ensure HTTPS context
  if (!window.isSecureContext) {
    console.error('Application is not running in a secure context (HTTPS)');
    alert('This application requires a secure HTTPS connection to function properly.');
  }
};

// Call this function on app initialization
enforceSecureContext();
