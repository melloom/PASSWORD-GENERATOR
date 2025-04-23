import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translations
const resources = {
  en: {
    translation: {
      "app": {
        "name": "Lockora Password Generator",
        "tagline": "Generate secure passwords with ease"
      },
      "common": {
        "password": "Password",
        "copy": "Copy",
        "copied": "Copied!",
        "generate": "Generate",
        "save": "Save",
        "cancel": "Cancel",
        "close": "Close",
        "back": "Back",
        "next": "Next",
        "loading": "Loading...",
        "error": "Error",
        "success": "Success",
        "characters": "characters",
        "use": "Use"
      },
      "passwordGen": {
        "yourPassword": "Your generated password",
        "length": "Length",
        "uppercase": "Uppercase (A-Z)",
        "lowercase": "Lowercase (a-z)",
        "numbers": "Numbers (0-9)",
        "symbols": "Symbols (!@#$)",
        "excludeSimilar": "Exclude similar characters (i, l, 1, L, o, 0, O)",
        "avoidAmbiguous": "Avoid ambiguous characters",
        "customExclude": "Custom exclusions",
        "showSettings": "Show Password Settings",
        "hideSettings": "Hide Settings"
      },
      "passwordStrength": {
        "passwordStrength": "Password Strength",
        "entropy": "Entropy",
        "timeToCrack": "Time to crack",
        "charactersUsed": "Characters used",
        "strengthLevel": {
          "0": "Very Weak",
          "1": "Weak",
          "2": "Medium",
          "3": "Strong",
          "4": "Very Strong"
        },
        "suggestions": "Suggestions"
      },
      "passwordHistory": {
        "title": "Password History",
        "empty": "No password history yet",
        "clearAll": "Clear History",
        "secureShred": "Secure Shred",
        "timestamp": "Generated",
        "analytics": {
          "title": "Password Analytics",
          "insights": "Insights based on your password history",
          "notEnough": "Not enough password history to generate analytics",
          "generate": "Generate at least 2 passwords to see trends and statistics"
        }
      },
      "secureShare": {
        "title": "Share Password",
        "secureLink": "Secure Link Created",
        "secureLinkInfo": "This secure link expires in 24 hours and can only be viewed once.",
        "copyLink": "Copy Link",
        "showQR": "Show QR Code"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    
    // Detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
