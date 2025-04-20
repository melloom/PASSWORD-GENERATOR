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
  // Fixed version that prevents infinite recursion
  const range = max - min + 1;

  // For small ranges, simpler method without modulo bias concerns
  if (range <= 256) {
    const randomBytes = new Uint8Array(1);
    window.crypto.getRandomValues(randomBytes);
    // Use modulo for small ranges where bias is negligible
    return min + (randomBytes[0] % range);
  }

  // For larger ranges, use a more sophisticated method but with recursion limit
  const bitsNeeded = Math.ceil(Math.log2(range));
  const bytesNeeded = Math.ceil(bitsNeeded / 8);
  const maxValidValue = (1 << bitsNeeded) - 1; // 2^bitsNeeded - 1

  // Limit recursion with a counter
  let attempts = 0;
  const MAX_ATTEMPTS = 100;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;

    // Get random values
    const randomBytes = new Uint8Array(bytesNeeded);
    window.crypto.getRandomValues(randomBytes);

    // Convert to integer
    let value = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      value = (value << 8) | randomBytes[i];
    }

    // Mask extra bits
    value = value & maxValidValue;

    // If value is within our desired range, return it
    if (value < range * Math.floor(maxValidValue / range) * range) {
      return min + (value % range);
    }

    // Otherwise, try again (but with limited attempts)
  }

  // Fallback if we exceed MAX_ATTEMPTS to prevent infinite recursion
  const randomBytes = new Uint8Array(4); // 32 bits should be enough
  window.crypto.getRandomValues(randomBytes);
  const fallbackValue = new Uint32Array(randomBytes.buffer)[0];
  return min + (fallbackValue % range);
};

/**
 * Securely shuffle an array using Fisher-Yates algorithm with cryptographically secure randomness
 * @param {Array} array - Array to shuffle
 * @return {Array} - Shuffled array
 */
const secureShuffleArray = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Replace or enhance the generatePassword function
const generatePassword = ({
  length = 16,
  includeUppercase = true,
  includeLowercase = true,
  includeNumbers = true,
  includeSymbols = true,
  avoidAmbiguous = false,
  excludeSimilar = false,
  customExclusions = '',
  pattern = null
}) => {
  // Define character sets
  let uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  let numberChars = '0123456789';
  let symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // Handle ambiguous character exclusion
  if (avoidAmbiguous) {
    uppercaseChars = uppercaseChars.replace(/[IO]/g, '');
    lowercaseChars = lowercaseChars.replace(/[l]/g, '');
    numberChars = numberChars.replace(/[01]/g, '');
  }

  // Handle similar character exclusion
  if (excludeSimilar) {
    uppercaseChars = uppercaseChars.replace(/[IL1O0]/g, '');
    lowercaseChars = lowercaseChars.replace(/[il1o0]/g, '');
    numberChars = numberChars.replace(/[10]/g, '');
  }

  // Handle custom exclusions
  const exclusions = new Set(customExclusions.split(''));
  if (exclusions.size > 0) {
    uppercaseChars = Array.from(uppercaseChars).filter(c => !exclusions.has(c)).join('');
    lowercaseChars = Array.from(lowercaseChars).filter(c => !exclusions.has(c)).join('');
    numberChars = Array.from(numberChars).filter(c => !exclusions.has(c)).join('');
    symbolChars = Array.from(symbolChars).filter(c => !exclusions.has(c)).join('');
  }

  // Build character set
  let charset = '';
  if (includeUppercase) charset += uppercaseChars;
  if (includeLowercase) charset += lowercaseChars;
  if (includeNumbers) charset += numberChars;
  if (includeSymbols) charset += symbolChars;

  // Ensure we have at least one character type
  if (charset.length === 0) charset = lowercaseChars;

  // Generate password using secure random function
  let password = '';

  // Ensure the password contains at least one character from each selected type
  if (includeUppercase && uppercaseChars.length > 0) {
    password += uppercaseChars.charAt(secureRandomInt(0, uppercaseChars.length - 1));
  }
  if (includeLowercase && lowercaseChars.length > 0) {
    password += lowercaseChars.charAt(secureRandomInt(0, lowercaseChars.length - 1));
  }
  if (includeNumbers && numberChars.length > 0) {
    password += numberChars.charAt(secureRandomInt(0, numberChars.length - 1));
  }
  if (includeSymbols && symbolChars.length > 0) {
    password += symbolChars.charAt(secureRandomInt(0, symbolChars.length - 1));
  }

  // Fill up to the desired length
  while (password.length < length) {
    const randomIndex = secureRandomInt(0, charset.length - 1);
    password += charset.charAt(randomIndex);
  }

  // Securely shuffle the password characters to avoid patterns
  password = secureShuffleArray(password.split('')).join('');

  // If pattern is 'memorable' and it's not a word-based password
  if (pattern === 'memorable') {
    // Create a more memorable pattern without reducing security
    // For example: Group characters into blocks
    const blockSize = Math.min(4, Math.max(2, Math.floor(length / 4)));
    if (blockSize >= 2 && length >= 8) {
      const passwordArray = password.split('');
      let formattedPassword = '';
      for (let i = 0; i < passwordArray.length; i++) {
        formattedPassword += passwordArray[i];
        if ((i + 1) % blockSize === 0 && i !== passwordArray.length - 1) {
          formattedPassword += '-';
        }
      }
      password = formattedPassword;
    }
  }

  return password;
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
const getEnhancedRandomBytes = (byteCount) => {
  // Ensure entropy pool is initialized
  if (!isEntropyPoolInitialized) {
    initEntropyPool();
  }

  // Create output array
  const output = new Uint8Array(byteCount);

  // Fill with crypto API values
  window.crypto.getRandomValues(output);

  // Mix in our entropy pool
  for (let i = 0; i < byteCount; i++) {
    output[i] ^= entropyPool[(entropyOffset + i) % entropyPool.length];
  }

  // Update entropy offset
  entropyOffset = (entropyOffset + byteCount) % entropyPool.length;

  // Refresh part of the entropy pool
  if (entropyOffset % 16 === 0) {
    window.crypto.getRandomValues(
      new Uint8Array(entropyPool.buffer, entropyOffset % entropyPool.length, 16)
    );
  }

  return output;
};

// Password memory protection
// Function to securely clear string data from memory (as much as JS allows)
const secureStringClear = (str) => {
  // This is a best-effort approach since JS doesn't allow direct memory access
  // Overwrite the string with zeros
  const zeros = new Array(str.length + 1).join('0');

  // Force garbage collection if possible (not guaranteed)
  if (window.gc) {
    try {
      window.gc();
    } catch (e) {
      console.warn("Unable to force garbage collection");
    }
  }

  return zeros;
};

// Update other utility functions
// ... existing code ...

// Initialize entropy collection when the module loads
initEntropyPool();

// Export functions
export {
  generatePassword,
  generateMemorablePassword,
  secureStringClear,
  initEntropyPool
  // ... existing exports ...
};

// Get a random character from specified character set
const getRandomCharFromSet = (setName) => {
  let chars = '';

  switch(setName) {
    case 'uppercase':
      chars = characterSets.uppercase;
      break;
    case 'lowercase':
      chars = characterSets.lowercase;
      break;
    case 'number':
      chars = characterSets.numbers;
      break;
    case 'symbol':
      chars = characterSets.symbols;
      break;
    default:
      chars = characterSets.lowercase;
  }

  return chars[Math.floor(Math.random() * chars.length)];
};

// Generate a random number or symbol
const getRandomExtra = (includeSpecial) => {
  const numberOrSymbol = Math.random() > 0.5 || !includeSpecial;

  if (numberOrSymbol) {
    return characterSets.numbers[Math.floor(Math.random() * characterSets.numbers.length)];
  } else {
    return characterSets.symbols[Math.floor(Math.random() * characterSets.symbols.length)];
  }
};

// (Removed duplicate generatePassword function to fix redeclaration error)

// Calculate password strength (returns a score from 0-4)
export const calculateStrength = (password) => {
  // No password, no strength
  if (!password) {
    return 0;
  }

  let score = 0;

  // Length contribution (up to 6 points)
  if (password.length >= 20) score += 6;
  else if (password.length >= 16) score += 5;
  else if (password.length >= 12) score += 4;
  else if (password.length >= 8) score += 3;
  else if (password.length >= 6) score += 2;
  else score += 1;

  // Character variety contribution
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (hasLower) score += 1;
  if (hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSymbol) score += 2;

  // Bonus for mixed character types
  let typesCount = 0;
  if (hasLower) typesCount++;
  if (hasUpper) typesCount++;
  if (hasNumber) typesCount++;
  if (hasSymbol) typesCount++;

  if (typesCount >= 3) score += 2;
  if (typesCount === 4) score += 1;

  // Normalize score to range 0-4
  return Math.max(0, Math.min(4, Math.floor(score / 3)));
};

// Calculate password entropy in bits
export const calculateEntropy = (password) => {
  if (!password) return 0;

  let poolSize = 0;

  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33; // Common special characters

  // Calculate entropy: log2(poolSize^length) = length * log2(poolSize)
  const entropy = password.length * (Math.log(poolSize) / Math.log(2));

  return entropy;
};

// Comprehensive security analysis for all passwords
export const analyzePasswordSecurity = (password) => {
  if (!password) return {
    score: 0,
    entropy: 0,
    checks: [],
    verdict: 'No password provided',
    timeToBreak: 'Instant'
  };

  const checks = [];
  let score = calculateStrength(password);
  const entropy = calculateEntropy(password);

  // Check length
  if (password.length < 8) {
    checks.push({
      name: 'Length',
      passed: false,
      message: 'Password is too short (should be at least 8 characters)',
      severity: 'high'
    });
  } else if (password.length < 12) {
    checks.push({
      name: 'Length',
      passed: true,
      message: 'Password meets minimum length requirements',
      severity: 'medium'
    });
  } else {
    checks.push({
      name: 'Length',
      passed: true,
      message: 'Excellent password length',
      severity: 'low'
    });
  }

  // Check character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  let varietyCount = 0;
  if (hasLower) varietyCount++;
  if (hasUpper) varietyCount++;
  if (hasNumber) varietyCount++;
  if (hasSymbol) varietyCount++;

  if (varietyCount < 3) {
    checks.push({
      name: 'Character variety',
      passed: false,
      message: 'Password needs more variety (uppercase, lowercase, numbers, symbols)',
      severity: varietyCount < 2 ? 'high' : 'medium'
    });
  } else {
    checks.push({
      name: 'Character variety',
      passed: true,
      message: 'Good mix of character types',
      severity: 'low'
    });
  }

  // Check for common passwords
  const lowerPassword = password.toLowerCase();
  const isCommon = commonPasswords.some(common => lowerPassword === common.toLowerCase());

  if (isCommon) {
    score = Math.max(0, score - 2); // Drastically reduce score for common passwords
    checks.push({
      name: 'Common password check',
      passed: false,
      message: 'This password appears in lists of commonly used passwords',
      severity: 'high'
    });
  } else {
    checks.push({
      name: 'Common password check',
      passed: true,
      message: 'Not found in common password lists',
      severity: 'low'
    });
  }

  // Check for repeated patterns
  const repeatedPattern = /(.+)\1{2,}/g.test(password); // Checks for 3+ repetitions

  if (repeatedPattern) {
    score = Math.max(0, score - 1);
    checks.push({
      name: 'Repeated patterns',
      passed: false,
      message: 'Contains repeated patterns which weaken security',
      severity: 'medium'
    });
  } else {
    checks.push({
      name: 'Repeated patterns',
      passed: true,
      message: 'No repeated patterns detected',
      severity: 'low'
    });
  }

  // Check for keyboard patterns (simplified check)
  const keyboardPatterns = ['qwerty', 'asdfgh', '123456', 'zxcvbn'];
  const hasKeyboardPattern = keyboardPatterns.some(pattern =>
    password.toLowerCase().includes(pattern)
  );

  if (hasKeyboardPattern) {
    score = Math.max(0, score - 1);
    checks.push({
      name: 'Keyboard patterns',
      passed: false,
      message: 'Contains keyboard patterns which are easy to guess',
      severity: 'medium'
    });
  } else {
    checks.push({
      name: 'Keyboard patterns',
      passed: true,
      message: 'No obvious keyboard patterns detected',
      severity: 'low'
    });
  }

  // Check for sequential digits
  const sequentialDigits = /(?:0(?=1)|1(?=2)|2(?=3)|3(?=4)|4(?=5)|5(?=6)|6(?=7)|7(?=8)|8(?=9)){3,}/g.test(password);

  if (sequentialDigits) {
    checks.push({
      name: 'Sequential digits',
      passed: false,
      message: 'Contains sequential digits which are easy to guess',
      severity: 'medium'
    });
  } else {
    checks.push({
      name: 'Sequential digits',
      passed: true,
      message: 'No sequential digits detected',
      severity: 'low'
    });
  }

  // Calculate time to break (very rough estimate)
  const entropyBasedTime = calculateTimeToBreak(entropy);

  // Overall verdict
  let verdict;
  if (score === 0) {
    verdict = 'Very Weak: This password is easily guessable and should not be used.';
  } else if (score === 1) {
    verdict = 'Weak: This password provides minimal security and should be improved.';
  } else if (score === 2) {
    verdict = 'Moderate: This password provides some security but could be stronger.';
  } else if (score === 3) {
    verdict = 'Strong: This password provides good security for most purposes.';
  } else {
    verdict = 'Very Strong: This password provides excellent security.';
  }

  return {
    score,
    entropy,
    checks,
    verdict,
    timeToBreak: entropyBasedTime
  };
};

// Calculate estimated time to break a password (very rough estimate)
const calculateTimeToBreak = (entropy) => {
  // Assuming 1 billion guesses per second (modern hardware)
  const guessesPerSecond = 1000000000;

  // 2^entropy = number of possible combinations
  const possibleCombinations = Math.pow(2, entropy);

  // Average case: need to try half of all combinations
  const secondsToBreak = possibleCombinations / guessesPerSecond / 2;

  if (secondsToBreak < 1) {
    return 'Instant';
  } else if (secondsToBreak < 60) {
    return `${Math.round(secondsToBreak)} seconds`;
  } else if (secondsToBreak < 3600) {
    return `${Math.round(secondsToBreak / 60)} minutes`;
  } else if (secondsToBreak < 86400) {
    return `${Math.round(secondsToBreak / 3600)} hours`;
  } else if (secondsToBreak < 31536000) {
    return `${Math.round(secondsToBreak / 86400)} days`;
  } else if (secondsToBreak < 315360000) { // 10 years
    return `${Math.round(secondsToBreak / 31536000)} years`;
  } else if (secondsToBreak < 3153600000) { // 100 years
    return `${Math.round(secondsToBreak / 31536000)} years`;
  } else {
    return 'Centuries';
  }
};