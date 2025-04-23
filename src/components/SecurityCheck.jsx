import React from 'react';
import { Shield, AlertTriangle, Check, Info, Clock, EyeOff, Zap } from 'lucide-react';

const SecurityCheck = ({ analysis, darkMode }) => {
  // Prevent mapping over undefined values
  if (!analysis || typeof analysis !== 'object') {
    return (
      <div className={`p-4 rounded-lg border-2 ${darkMode ? 'border-dark-600' : 'border-gray-300'}`}>
        <div className="flex items-center justify-center">
          <AlertTriangle className={`mr-2 ${darkMode ? 'text-warning-400' : 'text-warning-600'}`} size={18} />
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No security analysis available</span>
        </div>
      </div>
    );
  }

  // Get color based on difficulty level
  const getCrackDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'unbreakable':
        return darkMode ? 'text-emerald-400' : 'text-emerald-600';
      case 'very-strong':
        return darkMode ? 'text-success-400' : 'text-success-600';
      case 'strong':
        return darkMode ? 'text-primary-400' : 'text-primary-600';
      case 'medium':
        return darkMode ? 'text-blue-400' : 'text-blue-600';
      case 'weak':
        return darkMode ? 'text-warning-400' : 'text-warning-600';
      case 'very-weak':
        return darkMode ? 'text-orange-400' : 'text-orange-600';
      case 'extremely-weak':
        return darkMode ? 'text-danger-400' : 'text-danger-600';
      default:
        return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  // Enhanced score background
  const getScoreBackground = (score) => {
    switch (score) {
      case 4:
        return darkMode ? 'bg-success-900/50 border-success-700' : 'bg-success-100 border-success-300';
      case 3:
        return darkMode ? 'bg-primary-900/50 border-primary-700' : 'bg-primary-100 border-primary-300';
      case 2:
        return darkMode ? 'bg-blue-900/50 border-blue-700' : 'bg-blue-100 border-blue-300';
      case 1:
        return darkMode ? 'bg-warning-900/50 border-warning-700' : 'bg-warning-100 border-warning-300';
      case 0:
        return darkMode ? 'bg-danger-900/50 border-danger-700' : 'bg-danger-100 border-danger-300';
      default:
        return darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-100 border-gray-300';
    }
  };

  // Safely destructure with default values
  const { 
    score = 0, 
    entropy = 0, 
    timeToBreak = 'Unknown', 
    suggestions = [],
    weaknesses = [] 
  } = analysis;

  // Strength labels and associated colors
  const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const strengthColor = score <= 1 ? 'danger' : score === 2 ? 'warning' : score === 3 ? 'primary' : 'success';

  // Helper function to determine if a time is considered secure
  const isTimeSecure = (time) => {
    if (time.includes("Year") && !time.includes("Instantly")) {
      const yearMatch = time.match(/\d+/);
      if (yearMatch) {
        const years = parseInt(yearMatch[0].replace(/,/g, ''));
        return years >= 100;
      }
    }
    return time.includes("Century") || time.includes("Millenni") || time.includes("10^");
  };
  
  // Format breach count for display
  const formatBreachCount = (count) => {
    if (!count) return "0";
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count/1000).toFixed(1)}k`;
    return `${(count/1000000).toFixed(1)}M`;
  };

  return (
    <div className="space-y-4">
      {/* Password Summary */}
      <div className={`p-4 rounded-lg border ${getScoreBackground(analysis.score)}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Security Analysis</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            analysis.score === 4 ? (darkMode ? 'bg-success-800/50 text-success-200' : 'bg-success-500 text-white') :
            analysis.score === 3 ? (darkMode ? 'bg-primary-800/50 text-primary-200' : 'bg-primary-500 text-white') :
            analysis.score === 2 ? (darkMode ? 'bg-blue-800/50 text-blue-200' : 'bg-blue-500 text-white') :
            analysis.score === 1 ? (darkMode ? 'bg-warning-800/50 text-warning-200' : 'bg-warning-500 text-white') :
            (darkMode ? 'bg-danger-800/50 text-danger-200' : 'bg-danger-500 text-white')
          }`}>
            {analysis.score === 4 ? 'Excellent' :
             analysis.score === 3 ? 'Strong' :
             analysis.score === 2 ? 'Medium' :
             analysis.score === 1 ? 'Weak' : 'Very Weak'}
          </span>
        </div>

        {/* Add breach warning if found */}
        {analysis.breach && analysis.breach.found && (
          <div className={`mt-2 mb-3 p-2 rounded-md ${
            darkMode ? 'bg-danger-900/50 border border-danger-800' : 'bg-danger-50 border border-danger-200'
          } animate-pulse`}>
            <div className="flex items-center">
              <AlertTriangle size={16} className={`mr-2 ${darkMode ? 'text-danger-400' : 'text-danger-500'}`} />
              <div className={`text-sm font-medium ${darkMode ? 'text-danger-400' : 'text-danger-700'}`}>
                This password was found in data breaches!
              </div>
            </div>
            <div className="mt-1 text-xs grid grid-cols-2 gap-2">
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                First seen: <span className="font-mono">{analysis.breach.firstSeen}</span>
              </div>
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Exposed accounts: <span className="font-medium">{formatBreachCount(analysis.breach.count)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
          <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Entropy: <span className="font-semibold">{analysis.entropy.toFixed(1)} bits</span></span>
          </div>
          
          <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Crack time: <span className={`font-semibold ${getCrackDifficultyColor(analysis.crackDifficulty)}`}>{analysis.timeToBreak}</span></span>
          </div>
        </div>

        {/* Enhanced Time to Crack Display */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Password Crack Times Across Attack Scenarios
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-dark-600/50' : 'bg-gray-100'
            }`}>
              <div className="text-xs uppercase tracking-wider mb-1.5 opacity-70">
                Online Attack
              </div>
              <div className={`text-sm font-semibold ${
                isTimeSecure(analysis.detailedTimes.online) 
                  ? darkMode ? 'text-success-400' : 'text-success-600' 
                  : darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {analysis.detailedTimes.online}
              </div>
              <div className="text-xs mt-1 opacity-70">Rate-limited online service</div>
            </div>

            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-dark-600/50' : 'bg-gray-100'
            }`}>
              <div className="text-xs uppercase tracking-wider mb-1.5 opacity-70">
                Desktop PC
              </div>
              <div className={`text-sm font-semibold ${
                isTimeSecure(analysis.detailedTimes.offlineStandard) 
                  ? darkMode ? 'text-success-400' : 'text-success-600' 
                  : darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {analysis.detailedTimes.offlineStandard}
              </div>
              <div className="text-xs mt-1 opacity-70">Standard desktop computer</div>
            </div>
            
            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-dark-600/50 border border-primary-800/50' : 'bg-primary-50 border border-primary-100'
            }`}>
              <div className={`text-xs uppercase tracking-wider mb-1.5 ${
                darkMode ? 'text-primary-400' : 'text-primary-600'
              }`}>
                Fast Hardware (Default)
              </div>
              <div className={`text-sm font-semibold ${
                isTimeSecure(analysis.timeToBreak) 
                  ? darkMode ? 'text-success-400' : 'text-success-600' 
                  : darkMode ? 'text-primary-400' : 'text-primary-600'
              }`}>
                {analysis.timeToBreak}
              </div>
              <div className="text-xs mt-1 opacity-70">Dedicated cracking hardware</div>
            </div>
            
            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-dark-600/50' : 'bg-gray-100'
            }`}>
              <div className="text-xs uppercase tracking-wider mb-1.5 opacity-70">
                GPU Cluster
              </div>
              <div className={`text-sm font-semibold ${
                isTimeSecure(analysis.detailedTimes.offlineCluster) 
                  ? darkMode ? 'text-success-400' : 'text-success-600' 
                  : darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {analysis.detailedTimes.offlineCluster}
              </div>
              <div className="text-xs mt-1 opacity-70">High-performance computing cluster</div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center">
            <div className={`h-1.5 w-1.5 rounded-full mr-2 ${
              isTimeSecure(analysis.timeToBreak) ? 'bg-success-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-xs opacity-70">
              Passwords taking 100+ years to crack are considered future-proof against conventional computers
            </span>
          </div>
        </div>
      </div>

      {/* Weaknesses */}
      {analysis.weaknesses && analysis.weaknesses.length > 0 && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-dark-700 border border-dark-600' : 'bg-gray-50 border border-gray-200'}`}>
          <h3 className={`font-medium mb-2 flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Vulnerabilities
          </h3>
          <ul className={`list-disc pl-6 space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {analysis.weaknesses.map((weakness, index) => (
              <li key={index}>{weakness}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'}`}>
          <h3 className={`font-medium mb-2 flex items-center ${darkMode ? 'text-blue-100' : 'text-blue-800'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Improvement Suggestions
          </h3>
          <ul className={`list-disc pl-6 space-y-1 text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Technical Information */}
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-dark-700 border border-dark-600' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className={`text-sm font-medium flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Technical Information
          </h4>
          <span className={`text-xs font-mono px-2 py-0.5 rounded ${
            darkMode ? 'bg-dark-600 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}>
            {analysis.entropy.toFixed(2)} bits
          </span>
        </div>
        
        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Entropy measures the randomness and unpredictability of a password. Higher is better.
        </p>
        
        <div className="mt-3 text-xs">
          <div className={`flex justify-between py-1 ${darkMode ? 'border-dark-600' : 'border-gray-200'} border-b`}>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>NVIDIA RTX 4090 (hashcat)</span>
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              {analysis.detailedTimes.offlineNvidia}
            </span>
          </div>
          
          <div className={`flex justify-between py-1 ${darkMode ? 'border-dark-600' : 'border-gray-200'} border-b`}>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Quantum Computer (Theoretical)</span>
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              {analysis.detailedTimes.quantum}
            </span>
          </div>
          
          <div className="flex justify-between py-1">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Attack Complexity</span>
            <span className={`font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              2<sup>{Math.round(analysis.entropy)}</sup> attempts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCheck;
