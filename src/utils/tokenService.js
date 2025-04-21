// src/utils/tokenService.js

const SECURE_TOKENS_KEY = 'lockora_secure_tokens';

/**
 * Internal: read the raw tokens array from localStorage
 * @returns {Array<{token:string, purpose:string, expires:number|string}>}
 */
function loadTokens() {
  const raw = localStorage.getItem(SECURE_TOKENS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    console.error('Invalid JSON in secure tokens key');
    return [];
  }
}

/**
 * Internal: persist the array back into localStorage
 * @param {Array} tokensArray
 */
function persistTokens(tokensArray) {
  localStorage.setItem(SECURE_TOKENS_KEY, JSON.stringify(tokensArray));
}

/**
 * Public: return only tokens whose `.expires` timestamp is still in the future
 */
export function getValidTokens() {
  const all = loadTokens();
  const now = Date.now();
  return all.filter(item => {
    const exp = typeof item.expires === 'number'
      ? item.expires
      : new Date(item.expires).getTime();
    return !isNaN(exp) && exp > now;
  });
}

/**
 * Public: overwrite stored tokens with exactly this array
 */
export function saveTokens(tokensArray) {
  persistTokens(tokensArray);
}

/**
 * Public: remove one token string and save the rest
 */
export function removeToken(tokenString) {
  const all = loadTokens();
  const filtered = all.filter(item => item.token !== tokenString);
  persistTokens(filtered);
}

