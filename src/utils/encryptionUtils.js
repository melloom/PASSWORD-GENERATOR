/**
 * Utilities for secure encryption and decryption of passwords
 */

// Generate a secure random key for encryption
export const generateEncryptionKey = (length = 16) => {
  if (window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback (less secure)
    let key = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    for (let i = 0; i < length; i++) {
      key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return key;
  }
};

// Encrypt text using AES or a fallback method
export const encryptText = (text, key) => {
  try {
    // Use CryptoJS if available
    if (window.CryptoJS && window.CryptoJS.AES) {
      return window.CryptoJS.AES.encrypt(text, key).toString();
    }
    
    // Fallback encryption (less secure)
    const encodedText = encodeURIComponent(text);
    const encodedKey = encodeURIComponent(key);
    const combined = `${encodedText}:${encodedKey}`;
    const base64 = btoa(combined);
    // Add simple obfuscation
    return base64.split('').reverse().join('') + btoa(Date.now());
  } catch (error) {
    console.error("Encryption failed:", error);
    // Return a marked plaintext as fallback
    return `UNENCRYPTED:${text}`;
  }
};

// Decrypt text using AES or the fallback method
export const decryptText = (encryptedText, key) => {
  try {
    // Check if it's unencrypted
    if (encryptedText.startsWith('UNENCRYPTED:')) {
      return encryptedText.substring(12);
    }
    
    // Use CryptoJS if available
    if (window.CryptoJS && window.CryptoJS.AES) {
      const bytes = window.CryptoJS.AES.decrypt(encryptedText, key);
      return bytes.toString(window.CryptoJS.enc.Utf8);
    }
    
    // Fallback decryption
    // Assuming we're using the simple obfuscation from above
    // Remove timestamp
    const base64 = encryptedText.substring(0, encryptedText.length - 8);
    // Reverse the string
    const reversed = base64.split('').reverse().join('');
    // Decode base64
    const combined = atob(reversed);
    // Split by separator
    const parts = combined.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted text format');
    
    // Verify key matches
    if (decodeURIComponent(parts[1]) !== key) throw new Error('Decryption key mismatch');
    
    // Return original text
    return decodeURIComponent(parts[0]);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "*** Decryption failed ***";
  }
};

// Verify password wasn't tampered with during transmission
export const verifyPasswordIntegrity = (encryptedPassword, originalHash, key) => {
  try {
    const decrypted = decryptText(encryptedPassword, key);
    // Hash the decrypted password
    const hashObj = new TextEncoder().encode(decrypted);
    
    // Calculate SHA-256 hash
    return crypto.subtle.digest('SHA-256', hashObj).then(hashBuffer => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      // Compare with original hash
      return hashHex === originalHash;
    });
  } catch (error) {
    console.error("Verification failed:", error);
    return Promise.resolve(false);
  }
};
