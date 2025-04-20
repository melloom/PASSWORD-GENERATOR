# Password Generator

A modern, secure, and responsive password generator. Generate strong, random, or memorable passwords with advanced options and instant strength feedback. All password generation is performed locally in your browser for maximum privacy.

## 🚀 Features

* Strong random and memorable password generation
* Password strength meter and entropy display
* Advanced options: exclude similar/ambiguous/custom characters
* Password history and reuse
* Password checker/analyzer
* Dark & light mode
* Mobile friendly and PWA support

## 🔮 Future Development

### 🧠 Smart Features

* AI-Powered Suggestions: Offer smart, memorable yet strong passwords using AI (e.g., "CoconutTiger42!")
* Password Use-Case Presets: Options like Banking, Gaming, Social Media — auto-adjusts strength + style
* Live Password Viewer: A panel that updates the generated password in real time while settings change
* Auto Strength Analyzer: Instant feedback while typing, no click needed

### 🛠️ Customization & Advanced Settings

* Character Pool Customizer: Let users pick specific symbols, numbers, uppercase, lowercase, etc.
* Avoid Similar Characters Toggle: Removes confusing stuff like l, 1, O, 0, etc.
* Blacklist Words/Patterns: Block certain words, phrases, or user-defined inputs
* Password Length Presets: Quick buttons for 8, 12, 16, 32 characters
* Advanced Options Toggle: Collapsible advanced settings to keep UI clean

### 💡 User Experience (UX) Boosts

* One-Click "Try Another" Button: Instantly resets password checks or generates a new password
* Dark Mode Toggle
* Fun Themes: Hacker green, Minimalist, Retro Terminal, Cyberpunk, etc.
* Typing Animation Toggle: Let the user turn it off/on
* Smooth Scroll Navigation: Clicking certain actions (like suggestion) auto-scrolls you to the right section
* Responsive Mobile UI: Feels just as good on phone as desktop

### 🔐 Security Enhancements

* "Have I Been Pwned" API Integration: Tells you if your password has ever been leaked online
* Strength Meter with Feedback Tips: Color-based bar with suggestions on how to improve the password
* Password Expiration Countdown: Good for temporary passwords

### 🔄 Convenience Tools

* Generate on Page Load
* Auto-Regenerate Option (Timer): Every X seconds a new one appears
* Lock Settings + Refresh Output: Lock your setup and just click for fresh passwords
* Session Memory: App remembers your last used settings using local storage
* Copy + Toast Alert ("Copied!")
* Download as .txt or PDF
* Save Favorite Passwords (Locally)

### 🔄 Suggested Password Section

* When clicking a password in "Check Strength," auto-scroll to Suggested Passwords
* Add "Generate More Like This" button under suggestions

### 🔗 Sharing & Export

* QR Code Generator: For sharing passwords securely
* Share Link (temporary): Passwords available at a short-lived URL
* Encrypted Vault (optional): Super light, optional password saving for repeat users

## 🌐 Production

**This is a production build. Visit the live app here:**

👉 [Lockora Password Generator](https://lockora.netlify.app/)

## 🛠️ Local Development

If you want to run locally:

1. Clone the repository:

```bash
git clone https://github.com/melloom/PASSWORD-GENERATOR.git
cd password-generator
npm install
```

2. Start the development server:

```bash
npm start
```

3. Open http://localhost:3000 in your browser.

### Platform-Specific Instructions

#### Windows Instructions

If you're using Windows, here are some additional tips:

1. Install Git for Windows from [git-scm.com](https://git-scm.com/download/win)

2. You can use either Command Prompt, PowerShell, or Git Bash (recommended):
   - Command Prompt: Use `dir` instead of `ls` to list files
   - PowerShell: Works similar to bash but has different syntax for some commands
   - Git Bash: Provides a bash-like terminal experience on Windows

3. Windows path example:
```bash
git clone https://github.com/melloom/PASSWORD-GENERATOR.git
cd PASSWORD-GENERATOR
```

4. If you encounter EACCES or permission errors, try running Command Prompt or PowerShell as Administrator

5. If npm commands fail, ensure Node.js is properly installed and added to your PATH:
   - Download from [nodejs.org](https://nodejs.org/)
   - During installation, check the option to automatically install necessary tools

6. For rapid development, you can use Visual Studio Code with the following extensions:
   - ESLint
   - Prettier
   - React Developer Tools

#### macOS/iOS Instructions

If you're using macOS, follow these steps:

1. Install Homebrew (if not already installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Install Git and Node.js using Homebrew:
```bash
brew install git node
```

3. Clone the repository and install dependencies:
```bash
git clone https://github.com/melloom/PASSWORD-GENERATOR.git
cd PASSWORD-GENERATOR
npm install
```

4. Start the development server:
```bash
npm start
```

5. For iOS testing and development:
   - For viewing the PWA on iOS devices, open Safari and navigate to your local development server by using your computer's local IP address (e.g., http://192.168.1.x:3000)
   - Enable developer mode in Safari settings on your iOS device
   - You can add the app to your home screen by tapping the share button and selecting "Add to Home Screen"

6. Recommended macOS development tools:
   - Visual Studio Code with React extensions
   - Xcode for iOS simulator testing
   - Safari Technology Preview for advanced web debugging

## 📦 Build for Production

To create a production build:

```bash
npm run build
```

This creates optimized files in the `build` folder ready for deployment.

## 🚀 Deployment

The project is configured for easy deployment to Netlify:

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Deploy!

## 🧰 Technologies Used

- React.js - Frontend framework
- CSS Modules - For component-scoped styling
- LocalStorage API - For saving password history
- Web Crypto API - For secure random number generation
- Progressive Web App (PWA) - For offline capability

## 📂 Project Structure

```
password-generator/
├── public/                # Static files and PWA assets
│   ├── _redirects         # Netlify redirect rules
│   ├── index.html         # HTML entry point
│   └── manifest.json      # PWA manifest
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── CharacterOptions.jsx
│   │   ├── CopyButton.jsx
│   │   ├── ExportModal.jsx
│   │   ├── PasswordGenerator.jsx
│   │   ├── PasswordHistory.jsx
│   │   ├── PasswordStrength.jsx
│   │   └── SecurityCheck.jsx
│   ├── styles/            # CSS files
│   ├── utils/             # Utility functions
│   │   └── passwordUtils.js
│   ├── App.jsx            # Main App component
│   └── index.js           # JavaScript entry point
└── package.json           # Project dependencies and scripts
```

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔒 Privacy

This password generator operates entirely in your browser. No passwords are ever sent to a server or stored outside your device's local storage. Your privacy is guaranteed by design.

## 🙏 Acknowledgements

- [zxcvbn](https://github.com/dropbox/zxcvbn) - For password strength estimation algorithm
- [React Icons](https://react-icons.github.io/react-icons/) - For the beautiful icons
- [Netlify](https://www.netlify.com/) - For hosting the production application

---

Made with ❤️ by [melloom](https://github.com/melloom)
