// src/components/Login.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        username,
        masterPassword: password
      });

      const { success, requiresMfa, userId, sessionId, vaultKey, message } = response.data;

      if (success) {
        if (requiresMfa) {
          // MFA required, show MFA input
          setUserId(userId);
          setSessionId(sessionId);
          setShowMfa(true);
        } else {
          // Login successful
          // Store session and vault key in secure storage
          localStorage.setItem('sessionId', sessionId);
          sessionStorage.setItem('vaultKey', vaultKey);
          sessionStorage.setItem('userId', userId);

          // Clear sensitive form data
          setPassword('');

          // Redirect to vault page
          navigate('/vault');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/users/mfa/verify`, {
        userId,
        sessionId,
        token: mfaToken
      });

      const { success, vaultKey } = response.data;

      if (success) {
        // MFA verification successful
        // Store session and vault key in secure storage
        localStorage.setItem('sessionId', sessionId);
        sessionStorage.setItem('vaultKey', vaultKey);
        sessionStorage.setItem('userId', userId);

        // Clear sensitive form data
        setPassword('');
        setMfaToken('');

        // Redirect to vault page
        navigate('/vault');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'MFA verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Military-Grade Password Vault</h1>
          <p className="text-gray-400 mt-2">Secure access to your passwords</p>
        </div>

        {!showMfa ? (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2" htmlFor="password">
                Master Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              Login
            </button>

            <div className="mt-4 text-center">
              <a href="/register" className="text-blue-400 hover:text-blue-300 text-sm">
                Create an account
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMfaVerification}>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2" htmlFor="mfaToken">
                Authentication Code
              </label>
              <input
                id="mfaToken"
                type="text"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value)}
                placeholder="Enter your 6-digit code"
                required
              />
              <p className="text-gray-400 text-sm mt-2">
                Enter the verification code from your authenticator app.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              Verify
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 text-sm"
                onClick={() => {
                  setShowMfa(false);
                  setMfaToken('');
                  setError('');
                }}
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;