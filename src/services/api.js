// src/services/api.js

import axios from 'axios';

// Base API configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor - add auth token if available
api.interceptors.request.use(
  (config) => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      config.headers.Authorization = `Bearer ${sessionId}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Clear session data
      localStorage.removeItem('sessionId');
      sessionStorage.removeItem('vaultKey');

      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session_expired=true';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// src/services/authService.js

import api from './api';
import cryptoService from './cryptoService';

/**
 * Authentication service for interacting with the backend auth endpoints
 */
const authService = {
  /**
   * Register a new user
   * @param {string} username - Username
   * @param {string} masterPassword - Master password
   * @returns {Promise} - API response
   */
  register: async (username, masterPassword) => {
    // Create the user's encryption keys
    const keys = await cryptoService.createUserKeys(masterPassword);

    // Send registration request
    const response = await api.post('/users/register', {
      username,
      masterPassword
    });

    return response.data;
  },

  /**
   * Login a user
   * @param {string} username - Username
   * @param {string} masterPassword - Master password
   * @returns {Promise} - API response with session info and vault key
   */
  login: async (username, masterPassword) => {
    // Send login request
    const response = await api.post('/users/login', {
      username,
      masterPassword
    });

    const { success, requiresMfa, userId, sessionId, vaultKey } = response.data;

    // If MFA is required, return the response directly
    if (requiresMfa) {
      return response.data;
    }

    // If login was successful and no MFA required, store the session ID
    if (success) {
      localStorage.setItem('sessionId', sessionId);
      sessionStorage.setItem('vaultKey', vaultKey);
      sessionStorage.setItem('userId', userId);
    }

    return response.data;
  },

  /**
   * Verify MFA token
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID
   * @param {string} token - MFA token
   * @returns {Promise} - API response
   */
  verifyMfa: async (userId, sessionId, token) => {
    const response = await api.post('/users/mfa/verify', {
      userId,
      sessionId,
      token
    });

    const { success, vaultKey } = response.data;

    // If verification was successful, store the session and key
    if (success) {
      localStorage.setItem('sessionId', sessionId);
      sessionStorage.setItem('vaultKey', vaultKey);
      sessionStorage.setItem('userId', userId);
    }

    return response.data;
  },

  /**
   * Set up MFA
   * @returns {Promise} - API response with MFA setup info
   */
  setupMfa: async () => {
    const response = await api.get('/users/mfa/setup');
    return response.data;
  },

  /**
   * Enable MFA after setup
   * @param {string} secret - MFA secret
   * @param {string} token - Verification token
   * @returns {Promise} - API response
   */
  enableMfa: async (secret, token) => {
    const response = await api.post('/users/mfa/enable', {
      secret,
      token
    });
    return response.data;
  },

  /**
   * Disable MFA
   * @param {string} token - MFA verification token
   * @returns {Promise} - API response
   */
  disableMfa: async (token) => {
    const response = await api.post('/users/mfa/disable', {
      token
    });
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise} - API response
   */
  logout: async () => {
    try {
      const response = await api.post('/users/logout');

      // Clear session data
      localStorage.removeItem('sessionId');
      sessionStorage.removeItem('vaultKey');
      sessionStorage.removeItem('userId');

      return response.data;
    } catch (error) {
      // Still clear local data even if API call fails
      localStorage.removeItem('sessionId');
      sessionStorage.removeItem('vaultKey');
      sessionStorage.removeItem('userId');

      throw error;
    }
  },

  /**
   * Change master password
   * @param {string} currentPassword - Current master password
   * @param {string} newPassword - New master password
   * @returns {Promise} - API response
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/password', {
      currentPassword,
      newPassword
    });

    return response.data;
  },

  /**
   * Check if the current session is valid
   * @returns {Promise} - User data if session is valid
   */
  validateSession: async () => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      throw new Error('No user ID found');
    }

    const response = await api.get(`/users/${userId}`);
    return response.data;
  }
};

export default authService;

// src/services/vaultService.js

import api from './api';
import cryptoService from './cryptoService';

/**
 * Vault service for managing vaults and password entries
 */
const vaultService = {
  /**
   * Get all vaults for the current user
   * @returns {Promise} - List of vaults
   */
  getVaults: async () => {
    const response = await api.get('/vaults');
    return response.data.vaults;
  },

  /**
   * Create a new vault
   * @param {string} name - Vault name
   * @param {string} description - Vault description
   * @returns {Promise} - New vault details
   */
  createVault: async (name, description = '') => {
    const response = await api.post('/vaults', {
      name,
      description
    });
    return response.data;
  },

  /**
   * Get a specific vault
   * @param {string} vaultId - Vault ID
   * @returns {Promise} - Vault details
   */
  getVault: async (vaultId) => {
    const response = await api.get(`/vaults/${vaultId}`);
    return response.data.vault;
  },

  /**
   * Update a vault
   * @param {string} vaultId - Vault ID
   * @param {object} data - Vault data to update
   * @returns {Promise} - API response
   */
  updateVault: async (vaultId, data) => {
    const response = await api.put(`/vaults/${vaultId}`, data);
    return response.data;
  },

  /**
   * Delete a vault
   * @param {string} vaultId - Vault ID
   * @returns {Promise} - API response
   */
  deleteVault: async (vaultId) => {
    const response = await api.delete(`/vaults/${vaultId}`);
    return response.data;
  },

  /**
   * Get all password entries in a vault
   * @param {string} vaultId - Vault ID
   * @returns {Promise} - List of entries
   */
  getEntries: async (vaultId) => {
    const response = await api.get(`/vaults/${vaultId}/entries`);
    return response.data.entries;
  },

  /**
   * Create a new password entry
   * @param {string} vaultId - Vault ID
   * @param {object} entryData - Entry data
   * @returns {Promise} - New entry details
   */
  createEntry: async (vaultId, entryData) => {
    // Get the vault key for encryption
    const vaultKeyHex = sessionStorage.getItem('vaultKey');
    if (!vaultKeyHex) {
      throw new Error('Vault key not found');
    }

    // Import the vault key
    const vaultKey = await cryptoService.importKey(vaultKeyHex);

    // Encrypt sensitive fields
    const encryptedData = {
      ...entryData,
      password: await cryptoService.encrypt(entryData.password, vaultKey),
      notes: entryData.notes
        ? await cryptoService.encrypt(entryData.notes, vaultKey)
        : null
    };

    // Send to API
    const response = await api.post(`/vaults/${vaultId}/entries`, encryptedData);
    return response.data;
  },

  /**
   * Get a specific password entry
   * @param {string} entryId - Entry ID
   * @returns {Promise} - Entry details with decrypted sensitive fields
   */
  getEntry: async (entryId) => {
    const response = await api.get(`/entries/${entryId}`);
    const entry = response.data.entry;

    // Get the vault key for decryption
    const vaultKeyHex = sessionStorage.getItem('vaultKey');
    if (!vaultKeyHex) {
      throw new Error('Vault key not found');
    }

    // Import the vault key
    const vaultKey = await cryptoService.importKey(vaultKeyHex);

    // Decrypt sensitive fields
    const decryptedEntry = {
      ...entry,
      password: await cryptoService.decrypt(entry.password, vaultKey),
      notes: entry.notes
        ? await cryptoService.decrypt(entry.notes, vaultKey)
        : null
    };

    return decryptedEntry;
  },

  /**
   * Update a password entry
   * @param {string} entryId - Entry ID
   * @param {object} entryData - Entry data to update
   * @returns {Promise} - API response
   */
  updateEntry: async (entryId, entryData) => {
    // Get the vault key for encryption
    const vaultKeyHex = sessionStorage.getItem('vaultKey');
    if (!vaultKeyHex) {
      throw new Error('Vault key not found');
    }

    // Import the vault key
    const vaultKey = await cryptoService.importKey(vaultKeyHex);

    // Prepare the data for update, only encrypt fields that are provided
    const updateData = { ...entryData };

    if (updateData.password) {
      updateData.password = await cryptoService.encrypt(updateData.password, vaultKey);
    }

    if (updateData.notes) {
      updateData.notes = await cryptoService.encrypt(updateData.notes, vaultKey);
    }

    // Send to API
    const response = await api.put(`/entries/${entryId}`, updateData);
    return response.data;
  },

  /**
   * Delete a password entry
   * @param {string} entryId - Entry ID
   * @returns {Promise} - API response
   */
  deleteEntry: async (entryId) => {
    const response = await api.delete(`/entries/${entryId}`);
    return response.data;
  },

  /**
   * Search for password entries
   * @param {string} query - Search query
   * @returns {Promise} - Search results
   */
  searchEntries: async (query) => {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data.results;
  },

  /**
   * Generate a secure password
   * @param {object} options - Password generation options
   * @returns {string} - Generated password
   */
  generatePassword: (options = {}) => {
    const {
      length = 16,
      useUppercase = true,
      useLowercase = true,
      useNumbers = true,
      useSpecial = true
    } = options;

    return cryptoService.generatePassword(
      length,
      useUppercase,
      useLowercase,
      useNumbers,
      useSpecial
    );
  }
};

export default vaultService;