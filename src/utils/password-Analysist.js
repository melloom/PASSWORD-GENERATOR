// password-Analysist.js

// This function will check if a password has been leaked
async function analyzePassword(password) {
  try {
    // Step 1: Generate a SHA-1 hash of the password
    const hashBuffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Step 2: Take the first 5 characters of the hash for the API request
    // This is called k-anonymity - we only send a portion of the hash
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);

    // Step 3: Send the prefix to the API (Have I Been Pwned)
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);

    if (!response.ok) {
    throw new Error('Failed to check password against database');
    }

    // Step 4: Check if our hash suffix is in the response
    const data = await response.text();
    const lines = data.split('\n');

    // Step 5: Parse each line and check if it matches our hash suffix
    for (const line of lines) {
    const [hashSuffix, count] = line.split(':');
    if (hashSuffix.toLowerCase() === suffix) {
      return {
      leaked: true,
      count: parseInt(count.trim()),
      message: `This password has been found in ${count.trim()} data breaches!`
      };
    }
    }

    // If we get here, the password hasn't been found in any leaks
    return {
    leaked: false,
    count: 0,
    message: 'Good news! This password hasn't been found in any known data breaches.'
    };

  } catch (error) {
    console.error('Error analyzing password:', error);
    return {
    error: true,
    message: 'There was an error checking your password. Please try again later.'
    };
  }
  }

  // This function handles the UI part
  function setupPasswordAnalysist() {
  const checkForm = document.getElementById('password-check-form');
  const passwordInput = document.getElementById('password-to-check');
  const resultDiv = document.getElementById('check-result');
  const checkButton = document.getElementById('check-password-btn');

  checkForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Show loading state
    checkButton.disabled = true;
    checkButton.textContent = 'Checking...';
    resultDiv.innerHTML = '<div class="loading">Checking password security...</div>';

    // Get the password value
    const password = passwordInput.value;

    if (!password) {
    resultDiv.innerHTML = '<div class="error">Please enter a password to check</div>';
    checkButton.disabled = false;
    checkButton.textContent = 'Check Password';
    return;
    }

    try {
    // Check the password
    const result = await analyzePassword(password);

    // Display the result
    if (result.error) {
      resultDiv.innerHTML = `<div class="error">${result.message}</div>`;
    } else if (result.leaked) {
      resultDiv.innerHTML = `
      <div class="warning">
        <h3>⚠️ Password Compromised!</h3>
        <p>${result.message}</p>
        <p>This password is not safe to use. Please choose a different one.</p>
      </div>
      `;
    } else {
      resultDiv.innerHTML = `
      <div class="success">
        <h3>✅ Password Secure</h3>
        <p>${result.message}</p>
        <p>Remember to use unique passwords for each website!</p>
      </div>
      `;
    }
    } catch (error) {
    resultDiv.innerHTML = `<div class="error">Something went wrong. Please try again.</div>`;
    }

    // Reset button state
    checkButton.disabled = false;
    checkButton.textContent = 'Check Password';
  });

  // Clear result when input changes
  passwordInput.addEventListener('input', () => {
    resultDiv.innerHTML = '';
  });
  }

  // Add this to your main app to initialize the password analysist
  document.addEventListener('DOMContentLoaded', () => {
  setupPasswordAnalysist();
  });