/**
 * Comprehensive security utilities for password generator
 */

// Use Web Crypto API for all cryptographic operations
export const generateSecureRandom = (min, max) => {
  const range = max - min;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValidValue = Math.pow(256, bytesNeeded);
  const array = new Uint8Array(bytesNeeded);
  
  let randomValue;
  do {
    window.crypto.getRandomValues(array);
    randomValue = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = (randomValue << 8) | array[i];
    }
  } while (randomValue >= maxValidValue - (maxValidValue % range));
  
  return min + (randomValue % range);
};

// XSS protection - sanitize string inputs
export const sanitizeString = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Generate a cryptographically secure token
export const generateSecureToken = (length = 32) => {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Secure memory storage that automatically expires
export const secureMemoryStorage = (() => {
  const store = new Map();
  
  // Clear expired items periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (value.expiry <= now) {
        // Securely clear the data
        if (typeof value.data === 'string') {
          value.data = value.data.replace(/./g, '0');
        }
        store.delete(key);
      }
    }
  }, 30000); // Check every 30 seconds
  
  return {
    setItem: (key, data, expiryMinutes = 30) => {
      store.set(key, {
        data,
        expiry: Date.now() + (expiryMinutes * 60 * 1000)
      });
    },
    getItem: (key) => {
      const item = store.get(key);
      if (!item) return null;
      if (item.expiry <= Date.now()) {
        store.delete(key);
        return null;
      }
      return item.data;
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clearAll: () => {
      store.clear();
    }
  };
})();

// Input validation utilities
export const validators = {
  isValidEmail: (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  },
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  },
  isStrongPassword: (password) => {
    // At least 12 chars, uppercase, lowercase, number, and special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/.test(password);
  }
};

// CSRF protection - generate, validate tokens
export const csrfProtection = (() => {
  let token = null;
  
  return {
    generateToken: () => {
      token = generateSecureToken();
      return token;
    },
    validateToken: (inputToken) => {
      if (!token || !inputToken) return false;
      const isValid = token === inputToken;
      // Use a new token after validation (one-time use)
      if (isValid) token = generateSecureToken();
      return isValid;
    },
    getToken: () => token
  };
})();

// Detect potential security risks
export const detectSecurityRisks = () => {
  const risks = [];
  
  // Check if running in secure context
  if (!window.isSecureContext) {
    risks.push({
      level: 'high',
      message: 'Application is not running in a secure context (HTTPS)'
    });
  }
  
  // Check for older browsers without proper crypto support
  if (!window.crypto || !window.crypto.subtle) {
    risks.push({
      level: 'high',
      message: 'Browser lacks modern cryptography support'
    });
  }
  
  // Check for frame embedding (potential clickjacking)
  if (window.self !== window.top) {
    risks.push({
      level: 'high', 
      message: 'Application is running inside a frame or iframe'
    });
  }
  
  return risks;
};

// Initialize and run security checks
export const initSecurity = () => {
  const risks = detectSecurityRisks();
  if (risks.length > 0) {
    console.warn('Security risks detected:', risks);
  }
  
  // Apply runtime protections
  if (window.self !== window.top) {
    // Anti-clickjacking: try to break out of frames
    window.top.location = window.self.location;
  }
  
  // Return detected risks for app to handle
  return risks;
};
