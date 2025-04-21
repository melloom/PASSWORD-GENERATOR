// Character sets for password generation
const characterSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: 'Il1O0',
  similar: 'iIlL1oO0'
};

// Common English words for memorable passwords - using everyday familiar words
const commonWords = {
  nouns: [
    'apple', 'book', 'chair', 'door', 'earth', 'friend', 'glass', 'house', 'island', 'jacket',
    'king', 'lamp', 'money', 'night', 'ocean', 'paper', 'queen', 'river', 'street', 'table',
    'umbrella', 'village', 'window', 'box', 'year', 'zebra', 'cloud', 'flower', 'garden', 'honey',
    'ice', 'jungle', 'kitchen', 'lake', 'mountain', 'needle', 'orange', 'picture', 'quilt', 'road',
    'sun', 'tree', 'unicorn', 'valley', 'water', 'xylophone', 'yacht', 'zoo'
  ],
  adjectives: [
    'big', 'cold', 'dark', 'easy', 'fast', 'good', 'happy', 'icy', 'jolly', 'kind',
    'long', 'mighty', 'new', 'old', 'pretty', 'quick', 'red', 'strong', 'tall', 'unique',
    'vast', 'warm', 'yellow', 'zesty', 'brave', 'calm', 'deep', 'early', 'fresh', 'green',
    'high', 'low', 'magic', 'nice', 'open', 'pure', 'quiet', 'rich', 'safe', 'sweet',
    'tiny', 'wise', 'young', 'blue', 'crisp', 'dry', 'flat', 'grand'
  ],
  verbs: [
    'run', 'jump', 'play', 'talk', 'walk', 'write', 'read', 'sing', 'dance', 'think',
    'swim', 'fly', 'eat', 'drink', 'sleep', 'laugh', 'smile', 'cry', 'draw', 'paint',
    'build', 'create', 'design', 'find', 'lose', 'make', 'break', 'fix', 'help', 'hide',
    'seek', 'begin', 'end', 'start', 'stop', 'open', 'close', 'love', 'like', 'need',
    'want', 'try', 'use', 'follow', 'lead', 'watch', 'see', 'look', 'hear', 'listen'
  ]
};

// Top 10000 most common passwords to check against
const commonPasswords = [
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234", "111111", "1234567",
  "dragon", "123123", "baseball", "abc123", "football", "monkey", "letmein", "shadow", "master",
  "696969", "mustang", "michael", "pussy", "superman", "trustno1", "hello"
  // This is just a small sample - in a real implementation, this would be much larger
];

// Import crypto functions if not already imported

/**
 * Generates cryptographically secure random numbers
 * @param {number} count - Number of random values to generate
 * @return {Uint32Array} - Array of secure random values
 */
const getSecureRandomValues = (count) => {
  // Use Web Crypto API for cryptographically secure random number generation
  const randomValues = new Uint32Array(count);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomValues);
    return randomValues;
  } else {
    // Fallback with warning for older browsers
    console.warn("Crypto API not available - falling back to less secure Math.random()");
    for (let i = 0; i < count; i++) {
      randomValues[i] = Math.floor(Math.random() * 4294967296);
    }
    return randomValues;
  }
};

/**
 * Get a cryptographically secure random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @return {number} - A secure random integer
 */
const secureRandomInt = (min, max) => {
  const range = max - min + 1;
  if (range <= 0) throw new Error("Invalid range for secureRandomInt");
  const maxUint32 = 0xffffffff;
  const maxAcceptable = maxUint32 - (maxUint32 % range);
  let rand;
  do {
    rand = new Uint32Array(getRandomBytes(4).buffer)[0];
  } while (rand > maxAcceptable);
  return min + (rand % range);
};

/**
 * Securely shuffle an array using Fisher-Yates algorithm with cryptographically secure randomness
 * @param {Array} array - Array to shuffle
 * @return {Array} - Shuffled array
 */
const secureShuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Enhanced random bytes generation with multiple fallbacks
const getRandomBytes = (length) => {
  if (window.crypto && window.crypto.getRandomValues) {
    const randomBuffer = new Uint8Array(length);
    window.crypto.getRandomValues(randomBuffer);
    // Mix in entropy pool for extra unpredictability
    for (let i = 0; i < length; i++) {
      randomBuffer[i] ^= entropyPool[(entropyOffset + i) % entropyPool.length];
    }
    entropyOffset = (entropyOffset + length) % entropyPool.length;
    return randomBuffer;
  }
  throw new Error("Crypto API not available. Cannot generate secure passwords.");
};

// Fix the generatePassword function to ensure it never returns "00000000"
export const generatePassword = ({
  length = 12,
  includeUppercase = true,
  includeLowercase = true,
  includeNumbers = true,
  includeSymbols = true,
  avoidAmbiguous = false,
  excludeSimilar = false,
  customExclusions = '',
  avoidCommon = true
}) => {
  let uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  let numberChars = '0123456789';
  let symbolChars = '!@#$%^&*()-_=+[]{}|;:,.<>?/~';
  const ambiguousChars = 'Il1O0';
  const similarChars = 'iIlLoO0';

  // Exclusions
  const exclusions = new Set();
  if (avoidAmbiguous) for (const c of ambiguousChars) exclusions.add(c);
  if (excludeSimilar) for (const c of similarChars) exclusions.add(c);
  if (customExclusions) for (const c of customExclusions) exclusions.add(c);

  // Filter character sets
  if (exclusions.size > 0) {
    uppercaseChars = Array.from(uppercaseChars).filter(c => !exclusions.has(c)).join('');
    lowercaseChars = Array.from(lowercaseChars).filter(c => !exclusions.has(c)).join('');
    numberChars = Array.from(numberChars).filter(c => !exclusions.has(c)).join('');
    symbolChars = Array.from(symbolChars).filter(c => !exclusions.has(c)).join('');
  }

  // Build pools
  const pools = [];
  if (includeLowercase && lowercaseChars) pools.push(lowercaseChars);
  if (includeUppercase && uppercaseChars) pools.push(uppercaseChars);
  if (includeNumbers && numberChars) pools.push(numberChars);
  if (includeSymbols && symbolChars) pools.push(symbolChars);

  let charPool = pools.join('');
  if (!charPool) {
    charPool = 'abcdefghijklmnopqrstuvwxyz';
    pools.length = 0;
    pools.push(charPool);
  }

  // Ensure password includes at least one char from each required type
  let password = '';
  let attempts = 0;
  const maxAttempts = 10;
  do {
    let chars = [];
    // Guarantee at least one from each pool
    for (const pool of pools) {
      chars.push(pool[secureRandomInt(0, pool.length - 1)]);
    }
    // Fill the rest randomly
    const remaining = length - chars.length;
    const randomBytes = getRandomBytes(remaining);
    for (let i = 0; i < remaining; i++) {
      chars.push(charPool[randomBytes[i] % charPool.length]);
    }
    // Shuffle to avoid predictable placement
    chars = secureShuffleArray(chars);
    password = chars.join('');
    attempts++;
    // Avoid common passwords if requested
    if (avoidCommon && commonPasswords.includes(password)) continue;
    // Validate password
    if (validatePassword(password)) break;
  } while (attempts < maxAttempts);

  // Fallback if all else fails
  if (!validatePassword(password)) {
    password = 'Pw' + Date.now().toString(36) + '!';
  }
  return password;
};

// Helper function to force include all required character types
const forceIncludeAllTypes = ({ length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, charPool, currentPassword }) => {
  let modifiedPassword = currentPassword.split('');

  // Positions to replace (start from the middle to preserve some randomness)
  let position = Math.floor(length / 2);

  if (includeUppercase && !(/[A-Z]/.test(currentPassword))) {
    modifiedPassword[position++ % length] = 'A';
  }

  if (includeLowercase && !(/[a-z]/.test(currentPassword))) {
    modifiedPassword[position++ % length] = 'a';
  }

  if (includeNumbers && !(/[0-9]/.test(currentPassword))) {
    modifiedPassword[position++ % length] = '7';
  }

  if (includeSymbols && !(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(currentPassword))) {
    modifiedPassword[position++ % length] = '!';
  }

  return modifiedPassword.join('');
};

// Validate a password meets minimum requirements
const validatePassword = (password) => {
  // Ensure password is not just repeated characters
  const uniqueChars = new Set(password.split('')).size;
  if (uniqueChars < 3 && password.length > 3) {
    return false;
  }

  // Check for simple patterns
  if (/^(.)\1+$/.test(password)) { // Same character repeated
    return false;
  }

  if (/^0+$/.test(password)) { // All zeros
    return false;
  }

  // Check for sequential characters (like "12345" or "abcde")
  const sequences = ['01234567890', 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  for (const seq of sequences) {
    for (let i = 0; i < seq.length - 3; i++) {
      const pattern = seq.substring(i, i + 4);
      if (password.includes(pattern)) {
        return false;
      }
    }
  }

  return true;
};

// Improve the calculateStrength function to be more realistic
export const calculateStrength = (password) => {
  if (!password) return 0;

  // Check if password is all zeros or very basic (likely due to generation error)
  if (/^0+$/.test(password) || password === '00000000') {
    return 0; // Very weak
  }

  let score = 0;

  // Calculate base score based on length
  if (password.length >= 16) {
    score += 2;
  } else if (password.length >= 12) {
    score += 1.5;
  } else if (password.length >= 8) {
    score += 1;
  } else {
    score += 0.5;
  }

  // Add points for character set diversity
  if (/[A-Z]/.test(password)) score += 0.7;
  if (/[a-z]/.test(password)) score += 0.7;
  if (/[0-9]/.test(password)) score += 0.7;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Analyze character distribution
  const charCounts = {};
  for (let i = 0; i < password.length; i++) {
    const char = password[i];
    charCounts[char] = (charCounts[char] || 0) + 1;
  }

  // Check character diversity (unique character ratio)
  const uniqueChars = Object.keys(charCounts).length;
  const uniqueRatio = uniqueChars / password.length;
  if (uniqueRatio > 0.7) score += 0.5;
  if (uniqueRatio > 0.5) score += 0.3;

  // Detect common patterns and penalize
  if (/12345|qwerty|password|admin|welcome|123123|abc123/i.test(password)) score -= 1;
  if (/(.)\1\1/.test(password)) score -= 0.5; // Triple character repetition

  // Calculate final score (0-4)
  const finalScore = Math.min(4, Math.max(0, Math.floor(score)));

  return finalScore;
};

// Improve entropy calculation to be more accurate
export const calculateEntropy = (password) => {
  if (!password) return 0;

  // Special case for all zeros (problematic password)
  if (/^0+$/.test(password) || password === '00000000') {
    return 10; // Very low entropy
  }

  // Calculate character pool size based on what's actually used
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  // If no characters were detected (shouldn't happen), use minimum pool size
  if (poolSize === 0) poolSize = 26;

  // Calculate raw entropy bits
  const entropyBits = Math.log2(Math.pow(poolSize, password.length));

  // Adjust entropy for repeating patterns
  let patternPenalty = 0;

  // Check for repeated sequences
  const segments = {};
  for (let i = 1; i < Math.min(password.length - 1, 4); i++) {
    for (let j = 0; j < password.length - i; j++) {
      const segment = password.substring(j, j + i);
      if (segments[segment]) {
        patternPenalty += i * 0.5; // Penalty proportional to repeated sequence length
      }
      segments[segment] = true;
    }
  }

  return Math.max(0, entropyBits - patternPenalty);
};

// Improve the password security analysis
export const analyzePasswordSecurity = (password) => {
  if (!password) {
    return {
      score: 0,
      entropy: 0,
      timeToBreak: "Instantly",
      suggestions: ["Password cannot be empty"]
    };
  }

  // Special case for problematic passwords
  if (/^0+$/.test(password) || password === '00000000') {
    return {
      score: 0,
      entropy: 10,
      timeToBreak: "Instantly",
      suggestions: ["This password is extremely weak", "Use a mix of character types", "Increase password length"]
    };
  }

  // Calculate strength score (0-4)
  const score = calculateStrength(password);

  // Calculate entropy
  const entropy = calculateEntropy(password);

  // Estimate time to crack based on entropy
  // Assuming 10 billion guesses per second (modern hardware)
  let timeToBreak;
  if (entropy < 30) {
    timeToBreak = "Instantly";
  } else if (entropy < 50) {
    timeToBreak = "Minutes to hours";
  } else if (entropy < 70) {
    timeToBreak = "Days to weeks";
  } else if (entropy < 90) {
    timeToBreak = "Months to years";
  } else if (entropy < 110) {
    timeToBreak = "Many years";
  } else {
    timeToBreak = "Centuries";
  }

  // Generate suggestions based on analysis
  const suggestions = [];

  if (password.length < 8) {
    suggestions.push("Use at least 8 characters");
  }

  if (password.length < 12) {
    suggestions.push("For better security, use 12+ characters");
  }

  if (!/[A-Z]/.test(password)) {
    suggestions.push("Add uppercase letters");
  }

  if (!/[a-z]/.test(password)) {
    suggestions.push("Add lowercase letters");
  }

  if (!/[0-9]/.test(password)) {
    suggestions.push("Add numbers");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    suggestions.push("Add special characters");
  }

  if (/(.)\1\1/.test(password)) {
    suggestions.push("Avoid repeated characters");
  }

  if (/12345|qwerty|password|admin|welcome/i.test(password)) {
    suggestions.push("Avoid common patterns");
  }

  return {
    score,
    entropy,
    timeToBreak,
    suggestions
  };
};

// Enhanced memorable password generation
const generateMemorablePassword = ({
  wordCount = 4,
  includeNumbers = true,
  includeSpecial = true,
  separator = '-',
  wordCase = 'mixed',
  wordList = null
}) => {
  // Common English words (you might want to use a more extensive word list)
  const defaultWordList = [
    // ... existing word list ...
    "apple", "banana", "carrot", "dog", "elephant", "forest", "guitar", "house", "igloo",
    "jacket", "king", "lemon", "monkey", "notebook", "orange", "pencil", "queen", "rainbow",
    // ... many more words ...
  ];

  const words = wordList || defaultWordList;

  // Generate secure indices for word selection
  let selectedWords = [];
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = secureRandomInt(0, words.length - 1);
    let word = words[randomIndex];

    // Apply case formatting
    switch (wordCase) {
      case 'lower':
        word = word.toLowerCase();
        break;
      case 'upper':
        word = word.toUpperCase();
        break;
      case 'title':
        word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        break;
      case 'camel':
        if (i === 0) {
          word = word.toLowerCase();
        } else {
          word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        break;
      case 'mixed':
      default:
        // For mixed case, randomly apply different case styles
        const caseStyle = secureRandomInt(0, 3);
        if (caseStyle === 0) {
          word = word.toLowerCase();
        } else if (caseStyle === 1) {
          word = word.toUpperCase();
        } else if (caseStyle === 2) {
          word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        } // caseStyle 3: leave as is
        break;
    }

    selectedWords.push(word);
  }

  // Join words with separator
  let password = selectedWords.join(separator);

  // Add a number at the end if requested
  if (includeNumbers) {
    password += secureRandomInt(100, 999).toString();
  }

  // Add a special character if requested
  if (includeSpecial) {
    const specialChars = '!@#$%^&*';
    const randomSpecial = specialChars.charAt(secureRandomInt(0, specialChars.length - 1));
    // 50% chance to add at the beginning, 50% chance to add at the end
    if (secureRandomInt(0, 1) === 0) {
      password = randomSpecial + password;
    } else {
      password += randomSpecial;
    }
  }

  return password;
};

// Add a function to gather additional entropy from user behavior
let entropyPool = new Uint32Array(128); // 512 bytes of entropy
let entropyOffset = 0;
let isEntropyPoolInitialized = false;

/**
 * Initialize the entropy pool with initial cryptographic randomness
 */
const initEntropyPool = () => {
  if (isEntropyPoolInitialized) return;

  window.crypto.getRandomValues(entropyPool);
  isEntropyPoolInitialized = true;

  // Set up listeners for additional entropy sources
  document.addEventListener('mousemove', collectMouseEntropy);
  document.addEventListener('keydown', collectKeyboardEntropy);
  document.addEventListener('touchmove', collectTouchEntropy);
};

/**
 * Collect entropy from mouse movements
 */
const collectMouseEntropy = (e) => {
  if (!e || !isEntropyPoolInitialized) return;

  // Mix mouse coordinates and timestamp into entropy pool
  const value = e.clientX * e.clientY * Date.now();
  entropyPool[entropyOffset % entropyPool.length] ^= value;
  entropyOffset++;
};

/**
 * Collect entropy from keyboard events
 */
const collectKeyboardEntropy = (e) => {
  if (!e || !isEntropyPoolInitialized) return;

  // Mix key code, timestamp, and other properties into entropy pool
  const value = e.keyCode * Date.now() * (e.timeStamp || 1);
  entropyPool[entropyOffset % entropyPool.length] ^= value;
  entropyOffset++;
};

/**
 * Collect entropy from touch events
 */
const collectTouchEntropy = (e) => {
  if (!e || !e.touches || !e.touches[0] || !isEntropyPoolInitialized) return;

  // Mix touch coordinates and timestamp into entropy pool
  const touch = e.touches[0];
  const value = touch.clientX * touch.clientY * Date.now();
  entropyPool[entropyOffset % entropyPool.length] ^= value;
  entropyOffset++;
};

/**
 * Get cryptographically secure bytes mixed with collected entropy
 */
// Removed unused getEnhancedRandomBytes function

// Password memory protection
// Function to securely clear string data from memory (as much as JS allows)
const secureStringClear = (str) => {
  let zeros = new Array(str.length + 1).join('0');
  zeros = zeros.split('').reverse().join('');
  zeros = zeros.replace(/./g, '0');
  // Try to overwrite original string variable (not guaranteed in JS)
  str = zeros;
  if (window.gc) {
    try { window.gc(); } catch (e) {}
  }
  return zeros;
};

// Update other utility functions
// ... existing code ...

// Initialize entropy collection when the module loads
initEntropyPool();

// Export functions - FIXED: removed duplicate generatePassword export
export {
  // generatePassword already exported with export const above
  generateMemorablePassword,
  secureStringClear,
  initEntropyPool
  // ... existing exports ...
};

// Removed unused getRandomCharFromSet and getRandomExtra functions

// (Removed duplicate generatePassword function to fix redeclaration error)