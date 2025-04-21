import React, { useState, useEffect } from 'react';
import { Shield, Copy, Check, Clock, AlertTriangle, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as tokenService from '../utils/tokenService';

const SecurePasswordView = () => {
  const [password, setPassword] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [darkMode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    // Extract secure token from URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const secureData = hashParams.get('secure');

    if (!secureData) {
      setError('Invalid or missing secure link');
      setLoading(false);
      return;
    }

    try {
      // Decode and decrypt the data
      const decodedData = decodeURIComponent(atob(secureData));
      const [encryptedPwd, securityKey, expiryTimestamp] = decodedData.split('|');

      // Check if link has expired
      const expiryTime = parseInt(expiryTimestamp, 10);
      if (isNaN(expiryTime) || Date.now() > expiryTime) {
        setExpired(true);
        setError('This secure link has expired');
        setLoading(false);
        return;
      }

      // Calculate time left for display
      const timeRemaining = expiryTime - Date.now();
      const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hoursLeft}h ${minutesLeft}m`);

      // Set up countdown timer
      const timer = setInterval(() => {
        const now = Date.now();
        if (now > expiryTime) {
          setExpired(true);
          setError('This secure link has expired');
          clearInterval(timer);
          return;
        }

        const remaining = expiryTime - now;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }, 60000); // Update every minute

      // Decrypt the password
      let decryptedPassword;
      try {
        // Use CryptoJS if available, otherwise use basic decoding
        if (window.CryptoJS && window.CryptoJS.AES) {
          decryptedPassword = window.CryptoJS.AES.decrypt(encryptedPwd, securityKey).toString(window.CryptoJS.enc.Utf8);
        } else {
          // Fallback basic decoding (for demonstration)
          decryptedPassword = atob(encryptedPwd).split(':')[0];
        }
      } catch (e) {
        console.error("Decryption error:", e);
        setError('Unable to decrypt the password data');
        setLoading(false);
        return;
      }

      // Check for additional metadata
      const metadataParam = hashParams.get('meta');
      if (metadataParam) {
        try {
          const meta = JSON.parse(atob(metadataParam));
          setMetadata(meta);
        } catch (e) {
          console.error("Metadata parse error:", e);
        }
      }

      setPassword(decryptedPassword);
      setLoading(false);

      // Add this after successful decryption
      if (!expired && password) {
        // Save token for later access
        const token = window.location.hash.substring(1);
        const tokenMetadata = {
          purpose: metadata?.purpose || 'Secure Password',
          expires: expiryTime
        };
        tokenService.saveToken(token, tokenMetadata);
      }

      return () => clearInterval(timer);
    } catch (e) {
      console.error("Error processing secure data:", e);
      setError('Unable to process the secure link data');
      setLoading(false);
    }
  }, []);

  const copyPassword = () => {
    navigator.clipboard.writeText(password)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-dark-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || expired) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-dark-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <div className={`max-w-md w-full p-6 rounded-xl shadow-lg ${darkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${expired ? 'bg-red-100' : 'bg-orange-100'}`}>
              <AlertTriangle size={32} className={expired ? 'text-red-600' : 'text-orange-600'} />
            </div>
          </div>

          <h1 className="text-xl font-bold text-center mb-2">
            {expired ? 'Link Expired' : 'Error'}
          </h1>

          <p className={`text-center mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </p>

          <div className="flex justify-center">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg flex items-center ${
                darkMode
                  ? 'bg-primary-600 hover:bg-primary-500 text-white'
                  : 'bg-primary-500 hover:bg-primary-400 text-white'
              }`}
            >
              <ExternalLink size={16} className="mr-2" />
              Go to Lockora Password Generator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-dark-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className={`max-w-md w-full p-6 rounded-xl shadow-lg ${darkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Shield className={`${darkMode ? 'text-primary-400' : 'text-primary-500'} mr-2`} size={24} />
            <h1 className="text-xl font-bold">Secure Password</h1>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${
              darkMode
                ? 'bg-dark-700 hover:bg-dark-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>

        {metadata && metadata.purpose && (
          <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-dark-700' : 'bg-blue-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
              <strong>This password is for:</strong> {metadata.purpose}
            </p>
          </div>
        )}

        <div className="relative mb-6">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            Secure Password:
          </label>

          <div className={`flex rounded-lg overflow-hidden ${
            darkMode ? 'bg-dark-700 border border-dark-600' : 'bg-gray-50 border border-gray-300'
          }`}>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`flex-grow py-3 px-4 font-mono text-lg ${
                darkMode ? 'bg-dark-700 text-white' : 'bg-gray-50 text-gray-900'
              }`}
              value={password}
              readOnly
            />

            <button
              onClick={() => setShowPassword(!showPassword)}
              className={`px-3 border-l ${
                darkMode
                  ? 'bg-dark-600 hover:bg-dark-500 text-gray-300 border-dark-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
              }`}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>

            <button
              onClick={copyPassword}
              className={`px-3 border-l ${
                darkMode
                  ? 'bg-dark-600 hover:bg-dark-500 text-gray-300 border-dark-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
              } ${copied ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white') : ''}`}
              title="Copy password"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>

          <div className={`mt-2 text-xs flex items-center ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
            <Clock size={14} className="mr-1" />
            <span>This link expires in {timeLeft}</span>
          </div>
        </div>

        {metadata && metadata.sender && (
          <div className={`mb-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <p className="text-sm">Shared by: <span className="font-medium">{metadata.sender}</span></p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={copyPassword}
            className={`py-2 px-4 rounded-lg flex items-center justify-center ${
              darkMode
                ? 'bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
            }`}
          >
            <Copy size={16} className="mr-2" />
            Copy Password
          </button>

          <Link
            to="/"
            className={`py-2 px-4 rounded-lg flex items-center justify-center ${
              darkMode
                ? 'bg-primary-600 hover:bg-primary-500 text-white'
                : 'bg-primary-500 hover:bg-primary-400 text-white'
            }`}
          >
            <ExternalLink size={16} className="mr-2" />
            Go to Lockora
          </Link>
        </div>

        <div className={`mt-6 text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Security Notice: This link will automatically expire in 24 hours.
        </div>
      </div>
    </div>
  );
};

export default SecurePasswordView;
