// src/services/cryptoService.js

/**
 * Client-side crypto service for password vault
 * Implements zero-knowledge encryption/decryption using the Web Crypto API
 */

// Convert ArrayBuffer to Base64 string
const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Convert Base64 string to ArrayBuffer
  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Convert string to ArrayBuffer
  const stringToArrayBuffer = (str) => {
    return new TextEncoder().encode(str);
  };

  // Convert ArrayBuffer to string
  const arrayBufferToString = (buffer) => {
    return new TextDecoder().decode(buffer);
  };

  // Secure PBKDF2 key derivation
  const deriveKey = async (password, salt, iterations = 310000) => {
    const passwordBuffer = stringToArrayBuffer(password);
    const importedKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      importedKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    return derivedKey;
  };

  // Generate a random vault key
  const generateVaultKey = async () => {
    return window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  };

  // Export a CryptoKey to raw bytes
  const exportKey = async (key) => {
    const rawKey = await window.crypto.subtle.exportKey('raw', key);
    return arrayBufferToBase64(rawKey);
  };

  // Import a CryptoKey from raw bytes
  const importKey = async (keyData) => {
    const keyBuffer = base64ToArrayBuffer(keyData);
    return window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  };

  // Encrypt data using AES-GCM
  const encrypt = async (data, key) => {
    // Generate a random IV (initialization vector)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // If data is a string, convert to ArrayBuffer
    const dataBuffer = typeof data === 'string'
      ? stringToArrayBuffer(data)
      : data;

    // Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      key,
      dataBuffer
    );

    // Return IV and encrypted data as Base64 strings
    return {
      iv: arrayBufferToBase64(iv),
      ciphertext: arrayBufferToBase64(encryptedBuffer)
    };
  };

  // Decrypt data using AES-GCM
  const decrypt = async (encryptedData, key) => {
    // Convert Base64 strings to ArrayBuffers
    const iv = base64ToArrayBuffer(encryptedData.iv);
    const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);

    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      key,
      ciphertext
    );

    // Return decrypted data as a string
    return arrayBufferToString(decryptedBuffer);
  };

  // Generate a secure random password
  const generatePassword = (
    length = 16,
    useUppercase = true,
    useLowercase = true,
    useNumbers = true,
    useSpecial = true
  ) => {
    let charset = '';
    if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSpecial) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?/';

    // Ensure charset is not empty
    if (charset === '') charset = 'abcdefghijklmnopqrstuvwxyz';

    // Generate random bytes
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);

    // Convert random bytes to characters
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(randomValues[i] % charset.length);
    }

    return password;
  };

  // User key management functions
  const createUserKeys = async (masterPassword) => {
    // Generate a random salt
    const salt = window.crypto.getRandomValues(new Uint8Array(32));

    // Derive a key from the master password
    const masterKey = await deriveKey(masterPassword, salt);

    // Generate a random vault encryption key
    const vaultKey = await generateVaultKey();

    // Export the vault key as raw bytes
    const rawVaultKey = await exportKey(vaultKey);

    // Encrypt the vault key with the master key
    const encryptedVaultKey = await encrypt(rawVaultKey, masterKey);

    // Return key data
    return {
      encryptedVaultKey: encryptedVaultKey,
      salt: arrayBufferToBase64(salt),
      // The vault key is returned so it can be used immediately
      // but should never be stored unencrypted
      vaultKey: rawVaultKey
    };
  };

  // Decrypt the vault key using the master password
  const decryptVaultKey = async (masterPassword, encryptedVaultKey, salt) => {
    // Convert salt from Base64 to ArrayBuffer
    const saltBuffer = base64ToArrayBuffer(salt);

    // Derive the master key from the password
    const masterKey = await deriveKey(masterPassword, saltBuffer);

    // Decrypt the vault key
    const rawVaultKey = await decrypt(encryptedVaultKey, masterKey);

    // Import the vault key for use
    return importKey(rawVaultKey);
  };

  // Secure data cleanup
  const secureCleanup = () => {
    // Clear any sensitive data from memory
    if (typeof window.gc === 'function') {
      window.gc();
    }
  };

  // Export the cryptoService functions
  const cryptoService = {
    createUserKeys,
    decryptVaultKey,
    encrypt,
    decrypt,
    generatePassword,
    exportKey,
    importKey,
    secureCleanup
  };

  export default cryptoService;