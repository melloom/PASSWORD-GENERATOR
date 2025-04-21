const reportWebVitals = async (onPerfEntry) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    try {
      // Dynamically import web-vitals to avoid bundling issues
      const webVitals = await import('web-vitals');

      // Check if functions exist before calling them
      if (typeof webVitals.getCLS === 'function') webVitals.getCLS(onPerfEntry);
      if (typeof webVitals.getFID === 'function') webVitals.getFID(onPerfEntry);
      if (typeof webVitals.getFCP === 'function') webVitals.getFCP(onPerfEntry);
      if (typeof webVitals.getLCP === 'function') webVitals.getLCP(onPerfEntry);
      if (typeof webVitals.getTTFB === 'function') webVitals.getTTFB(onPerfEntry);
    } catch (error) {
      console.warn('Web Vitals reporting failed:', error);
    }
  }
};

export default reportWebVitals;
