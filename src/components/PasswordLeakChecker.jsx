import React, { useState } from 'react';
import { AlertTriangle, Check, ShieldOff, Shield, Search, RefreshCw, Eye, EyeOff, ExternalLink, Calendar, Database, ArrowRight, Info, Globe } from 'lucide-react';
import { checkPasswordAgainstMultipleSources, secureMemoryClear } from '../utils/secureMemory';

const PasswordLeakChecker = ({ darkMode }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const handleCheckPassword = async () => {
    if (!password.trim()) return;
    
    setIsChecking(true);
    setError(null);
    setResults(null);
    setShowDetails(false);
    
    try {
      // Use secure method to check password leaks
      const checkResults = await checkPasswordAgainstMultipleSources(password);
      setResults(checkResults);
      
      // Auto-expand details if breached
      if (checkResults.breached) {
        setShowDetails(true);
      }
    } catch (err) {
      console.error('Error checking password:', err);
      setError('Could not complete the password check. Please try again later.');
    } finally {
      setIsChecking(false);
      // Securely clear password after 30 seconds
      setTimeout(() => {
        secureMemoryClear(password);
        setPassword('');
      }, 30000);
    }
  };
  
  const handleClearResults = () => {
    secureMemoryClear(password);
    setPassword('');
    setResults(null);
    setError(null);
    setShowDetails(false);
  };
  
  const formatNumberWithCommas = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
  };
  
  return (
    <div className={`mt-8 pb-4 border-t pt-6 ${darkMode ? 'border-gray-700 text-gray-200' : 'border-gray-200'}`}>
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Database className="mr-2" size={20} />
        Multi-Source Password Breach Checker
      </h3>
      
      <div className={`p-4 rounded-lg mb-4 ${
        darkMode ? 'bg-dark-700 border border-dark-600' : 'bg-blue-50 border border-blue-200'
      }`}>
        <p className="text-sm mb-0">
          <AlertTriangle size={16} className="inline-block mr-2" />
          <strong>Privacy Notice:</strong> Your password is never transmitted to any server.
          We use secure k-anonymity techniques to check breach databases without 
          exposing your actual password.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-grow">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to check for leaks"
            className={`w-full p-4 pr-12 rounded-lg sm:rounded-r-none ${
              darkMode
                ? 'bg-dark-700 text-white border-dark-600 focus:border-primary-500'
                : 'bg-white text-gray-800 border-gray-300 focus:border-primary-500'
            } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
            onKeyDown={(e) => e.key === 'Enter' && handleCheckPassword()}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700`}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button
          onClick={handleCheckPassword}
          disabled={isChecking || !password.trim()}
          className={`px-6 py-4 rounded-lg sm:rounded-l-none ${
            darkMode
              ? 'bg-primary-600 hover:bg-primary-500 text-white disabled:bg-gray-700 disabled:text-gray-500'
              : 'bg-primary-500 hover:bg-primary-400 text-white disabled:bg-gray-300 disabled:text-gray-500'
          } flex items-center justify-center transition disabled:cursor-not-allowed`}
        >
          {isChecking ? <RefreshCw className="animate-spin" size={20} /> : <Search size={20} />}
          <span className="ml-2">{isChecking ? "Checking..." : "Check"}</span>
        </button>
      </div>
      
      {error && (
        <div className={`p-4 rounded-lg ${
          darkMode ? 'bg-danger-900/30 border border-danger-800 text-danger-200' : 'bg-danger-50 border border-danger-200 text-danger-800'
        } mb-4 flex items-center`}>
          <AlertTriangle className="mr-2 flex-shrink-0" size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {results && (
        <div className={`p-4 rounded-lg ${
          darkMode ? 'bg-dark-800 border border-dark-600' : 'bg-white border border-gray-300'
        } my-4 animate-fadeIn shadow-md`}>
          <div className="flex items-center mb-4">
            {results.breached ? (
              <div className={`p-3 rounded-full ${
                darkMode ? 'bg-danger-900/30' : 'bg-danger-100'
              } mr-4`}>
                <ShieldOff className={darkMode ? 'text-danger-300' : 'text-danger-500'} size={24} />
              </div>
            ) : (
              <div className={`p-3 rounded-full ${
                darkMode ? 'bg-success-900/30' : 'bg-success-100'
              } mr-4`}>
                <Check className={darkMode ? 'text-success-300' : 'text-success-500'} size={24} />
              </div>
            )}
            
            <div className="flex-grow">
              <h4 className="text-lg font-medium">
                {results.breached 
                  ? "Password exposed in data breaches!" 
                  : "Good news! Password not found in any breaches."}
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {results.breached ? 
                  `Found in ${results.breachedServicesCount} of ${results.totalServicesChecked} databases • Confidence: ${results.confidenceLevel}` :
                  `Verified across ${results.totalServicesChecked} breach databases`}
              </p>
            </div>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`ml-2 px-3 py-1 text-xs rounded-full ${
                darkMode 
                  ? 'bg-dark-700 hover:bg-dark-600 border border-dark-600' 
                  : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {showDetails && (
            <div className="mt-5 space-y-4">
              {/* Service-by-service breakdown */}
              <div>
                <h5 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Service-by-service results:
                </h5>
                <div className="space-y-3">
                  {results.results.map((result, index) => (
                    <div key={index} className={`p-3 rounded-lg ${
                      darkMode ? 'bg-dark-700' : 'bg-gray-50'
                    } flex flex-col sm:flex-row sm:items-center justify-between`}>
                      <div className="mb-2 sm:mb-0">
                        <div className="flex items-center">
                          <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {result.service}
                          </span>
                          <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${
                            darkMode 
                              ? 'bg-dark-600 text-gray-400' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {result.lastUpdated}
                          </span>
                          {result.error && (
                            <span className={`text-xs ml-2 ${darkMode ? 'text-warning-400' : 'text-warning-600'}`}>
                              (Service unavailable)
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {!result.error && (
                        result.breached ? (
                          <div className="text-sm font-medium text-danger-500 flex items-center">
                            <AlertTriangle size={16} className="mr-1" />
                            Found in {formatNumberWithCommas(result.count)} breaches
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-success-500 flex items-center">
                            <Check size={16} className="mr-1" />
                            Not found
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Breach details section */}
              {results.breached && (
                <div className={`p-4 rounded-lg ${
                  darkMode ? 'bg-dark-700 border border-dark-600' : 'bg-gray-50 border border-gray-200' 
                }`}>
                  <h5 className={`text-sm font-medium mb-3 flex items-center ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Info size={14} className="mr-2" />
                    Breach Details
                  </h5>
                  
                  <div className="space-y-3">
                    {results.firstBreachDate && (
                      <div className="flex items-center">
                        <Calendar size={14} className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className="text-sm">First seen in breach database: </span>
                        <span className={`ml-1 text-sm font-medium ${
                          darkMode ? 'text-warning-400' : 'text-warning-600'
                        }`}>
                          {results.firstBreachDate}
                        </span>
                      </div>
                    )}
                    
                    {results.breachSites && results.breachSites.length > 0 && (
                      <div className="flex items-start">
                        <Globe size={14} className={`mr-2 mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div>
                          <span className="text-sm">May have appeared in these breaches: </span>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {results.breachSites.map((site, idx) => (
                              <span 
                                key={idx} 
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  darkMode 
                                    ? 'bg-danger-900/30 text-danger-300 border border-danger-800/30' 
                                    : 'bg-danger-50 text-danger-700 border border-danger-200'
                                }`}
                              >
                                {site}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Risk level */}
              {results.breached && (
                <div className={`p-4 rounded-lg ${
                  darkMode ? 'bg-danger-900/20 border border-danger-800/30' : 'bg-danger-50 border border-danger-200'
                }`}>
                  <h5 className={`font-medium ${darkMode ? 'text-danger-300' : 'text-danger-700'} mb-2 flex items-center`}>
                    <AlertTriangle size={16} className="mr-2" />
                    Risk Level: High
                  </h5>
                  <p className={`text-sm ${darkMode ? 'text-danger-300' : 'text-danger-700'} mb-3`}>
                    This password has been exposed in data breaches and should be considered compromised.
                    Anyone using this password is at significant risk of credential stuffing attacks.
                  </p>
                  
                  <h6 className={`text-sm font-medium mb-1 ${darkMode ? 'text-danger-300' : 'text-danger-700'}`}>
                    Recommended Actions:
                  </h6>
                  <ul className={`list-disc pl-5 text-sm space-y-1 ${darkMode ? 'text-danger-300' : 'text-danger-700'}`}>
                    <li>Change this password immediately on all sites where you use it</li>
                    <li>Never reuse this password - each account should have a unique password</li>
                    <li>Consider using a password manager to create and store strong passwords</li>
                    <li>Enable two-factor authentication on all your important accounts</li>
                    <li>Monitor your accounts for suspicious activity</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClearResults}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } transition flex items-center`}
            >
              <RefreshCw size={16} className="mr-2" />
              Check another password
            </button>
          </div>
        </div>
      )}

      <div className={`mt-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <p className="mb-1">
          We check your password against multiple breach databases using secure prefix-checking technology.
          Only a partial hash of your password is sent over the network, never your actual password.
        </p>
        <div className="flex flex-wrap gap-1 items-center">
          <span>Services used:</span>
          <span className={`px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-dark-700' : 'bg-gray-100'}`}>Have I Been Pwned</span>
          <span className={`px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-dark-700' : 'bg-gray-100'}`}>Google Password Checkup</span>
          <span className={`px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-dark-700' : 'bg-gray-100'}`}>Firefox Monitor</span>
          <a 
            href="https://haveibeenpwned.com/API/v3" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`inline-flex items-center ml-1 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}
          >
            Learn more <ExternalLink size={12} className="ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PasswordLeakChecker;
