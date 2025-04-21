// src/components/Register.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);

  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  // Check password strength as user types
  useEffect(() => {
    if (password.length > 0) {
      // Simple client-side strength check, server does more robust checking
      const strength = checkPasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const checkPasswordStrength = (password) => {
    // Simple client-side password strength checker
    let score = 0;
    const feedback = [];

    // Check length
    if (password.length < 8) {
      score -= 2;
      feedback.push("Password is too short");
    } else if (password.length >= 16) {
      score += 3;
    } else if (password.length >= 12) {
      score += 2;
    } else {
      score += 1;
    }

    // Check complexity
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Normalize score to 0-100
    const normalizedScore = Math.max(0, Math.min(100, (score + 2) * 12));

    // Determine strength level
    let strength;
    if (normalizedScore < 40) {
      strength = "Weak";
    } else if (normalizedScore < 70) {
      strength = "Moderate";
    } else if (normalizedScore < 90) {
      strength = "Strong";
    } else {
      strength = "Very Strong";
    }

    return {
      score: normalizedScore,
      strength,
      feedback
    };
  };

  const getStrengthColor = () => {
    if (!passwordStrength) return 'bg-gray-600';

    const { strength } = passwordStrength;
    switch (strength) {
      case 'Weak':
        return 'bg-red-500';
      case 'Moderate':
        return 'bg-yellow-500';
      case 'Strong':
        return 'bg-green-500';
      case 'Very Strong':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-600';
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 16) {
      setError('Password must be at least 16 characters long for military-grade security');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        username,
        masterPassword: password
      });

      if (response.data.success) {
        // Registration successful, redirect to login
        navigate('/login', {
          state: { message: 'Registration successful. Please log in with your credentials.' }
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Set up your secure password vault</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="confirmPassword">
              Confirm Master Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            Create Account
          </button>

          <div className="mt-4 text-center">
            <a href="/login" className="text-blue-400 hover:text-blue-300 text-sm">
              Already have an account? Login
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-xs">
              Important: Your master password is the key to your vault. We implement a zero-knowledge architecture, which means:
            </p>
            <ul className="text-gray-400 text-xs mt-2 list-disc pl-5 space-y-1">
              <li>We never store your master password</li>
              <li>We cannot recover your master password if you forget it</li>
              <li>All encryption/decryption happens on your device</li>
              <li>No one, not even us, can access your data without your master password</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;="username">
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

          <div className="mb-4">
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
              minLength={16}
            />
            {passwordStrength && (
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${getStrengthColor()}`}
                    style={{ width: `${passwordStrength.score}%` }}
                  ></div>
                </div>
                <p className={`text-sm mt-1 ${getStrengthColor().replace('bg-', 'text-')}`}>
                  {passwordStrength.strength}
                </p>
                <ul className="text-gray-400 text-xs mt-1">
                  {passwordStrength.feedback.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-gray-400 text-xs mt-1">
              For military-grade security, use at least 16 characters with a mix of uppercase, lowercase, numbers, and symbols.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor