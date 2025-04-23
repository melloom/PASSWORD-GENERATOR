/**
 * Device detection utilities for responsive PWA behavior
 * Helps ensure proper status bar display on mobile vs desktop
 */

// Check if current device is mobile
export const isMobileDevice = () => {
  // Use multiple indicators for better accuracy
  return (
    // Screen size check
    (window.innerWidth <= 768 || window.innerHeight <= 480) || 
    // Input method check
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
    // Hover capability check (most mobile devices can't hover)
    (window.matchMedia && window.matchMedia('(hover: none)').matches) ||
    // User agent check (fallback)
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
};

// Check if app is running in PWA mode
export const isPWAMode = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true
  );
};

// More comprehensive device detection
export const getDeviceInfo = () => {
  const mobile = isMobileDevice();
  const pwa = isPWAMode();
  
  return {
    isMobile: mobile,
    isPWA: pwa,
    isDesktop: !mobile,
    hasTouch: 'ontouchstart' in window,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
    isAndroid: /Android/.test(navigator.userAgent),
    hasNotch: (window.screen && (window.screen.height / window.screen.width > 2))
  };
};

// Add status bar display listener
export const initStatusBarMonitor = () => {
  // Only run in PWA mode
  if (!isPWAMode()) return;
  
  const checkStatusBarVisibility = () => {
    const statusBar = document.querySelector('.pwa-status-bar-spacer');
    const isMobile = isMobileDevice();
    
    if (!statusBar) return;
    
    // Set debug attributes
    statusBar.setAttribute('data-mobile', isMobile);
    statusBar.setAttribute('data-viewport-width', window.innerWidth);
    statusBar.setAttribute('data-viewport-height', window.innerHeight);
    
    // Log detection info
    console.log('PWA Status Bar:', {
      element: statusBar,
      mobile: isMobile,
      visible: window.getComputedStyle(statusBar).display !== 'none',
      height: window.getComputedStyle(statusBar).height
    });
  };
  
  // Check on load and resize
  window.addEventListener('load', checkStatusBarVisibility);
  window.addEventListener('resize', checkStatusBarVisibility);
};

// Initialize monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (isPWAMode()) {
      initStatusBarMonitor();
    }
  });
}
