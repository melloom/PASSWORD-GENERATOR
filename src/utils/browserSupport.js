/**
 * Utility functions for browser capability detection
 */

// Check if Web Share API is available and functioning
export const hasWebShareSupport = () => {
  // Basic check for Web Share API
  if (!navigator.share) return false;
  
  // Some browsers report having navigator.share but it doesn't work
  // or has limited functionality
  
  // Safari on macOS has share API but only works with URLs
  const isMacSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) && 
                     /Mac/.test(navigator.platform);
  
  // For macOS Safari, report as unsupported since it has limited text sharing capability
  if (isMacSafari) return false;
  
  return true;
};

// Detect iOS version
export const getIOSVersion = () => {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    // iOS device
    const version = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (version) {
      return [parseInt(version[1], 10), parseInt(version[2], 10), parseInt(version[3] || 0, 10)];
    }
  }
  return null; // Not iOS
};

// Check if device is running in PWA mode
export const isRunningAsPWA = () => {
  return (window.matchMedia('(display-mode: standalone)').matches) || 
         (window.navigator.standalone) || 
         document.referrer.includes('android-app://');
};

// Detect browser type
export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "Unknown";
  
  if (ua.indexOf("Firefox") > -1) {
    browserName = "Firefox";
    browserVersion = ua.match(/Firefox\/([0-9.]+)/)[1];
  } else if (ua.indexOf("Chrome") > -1 && ua.indexOf("Edg") === -1) {
    browserName = "Chrome";
    browserVersion = ua.match(/Chrome\/([0-9.]+)/)[1];
  } else if (ua.indexOf("Edg") > -1) {
    browserName = "Edge";
    browserVersion = ua.match(/Edg\/([0-9.]+)/)[1];
  } else if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) {
    browserName = "Safari";
    browserVersion = ua.match(/Version\/([0-9.]+)/)[1];
  } else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident/") > -1) {
    browserName = "IE";
    browserVersion = ua.match(/(?:MSIE |rv:)([0-9.]+)/)[1];
  }
  
  return { name: browserName, version: browserVersion };
};

// Test if clipboard API is fully supported
export const hasClipboardSupport = async () => {
  try {
    return navigator?.clipboard?.writeText !== undefined;
  } catch {
    return false;
  }
};
