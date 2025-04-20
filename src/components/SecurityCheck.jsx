import React from 'react';
import { CheckCircle, XCircle, Shield, AlertTriangle, Info, Lock } from 'lucide-react';

const SecurityCheck = ({ analysis, darkMode }) => {
  if (!analysis || !analysis.checks || analysis.checks.length === 0) {
    return (
      <div className={`p-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        No security analysis available
      </div>
    );
  }

  // Helper function to get appropriate icon for severity level
  const getSeverityIcon = (severity, passed) => {
    if (passed) return <CheckCircle size={16} className={`mr-2 ${darkMode ? 'text-success-400' : 'text-success-500'}`} />;

    switch (severity) {
      case 'high':
        return <AlertTriangle size={16} className={`mr-2 ${darkMode ? 'text-danger-400' : 'text-danger-500'}`} />;
      case 'medium':
        return <Info size={16} className={`mr-2 ${darkMode ? 'text-warning-400' : 'text-warning-500'}`} />;
      default:
        return <Info size={16} className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
    }
  };

  // Helper function to get appropriate colors for time to break
  const getTimeClass = (timeToBreak) => {
    if (timeToBreak.includes('Centur') || timeToBreak.includes('year')) {
      return darkMode
        ? 'bg-success-900/30 text-success-300 border border-success-800/50'
        : 'bg-success-50 text-success-700 border border-success-100';
    } else if (timeToBreak.includes('day') || timeToBreak.includes('month')) {
      return darkMode
        ? 'bg-primary-900/30 text-primary-300 border border-primary-800/50'
        : 'bg-primary-50 text-primary-700 border border-primary-100';
    } else if (timeToBreak.includes('hour')) {
      return darkMode
        ? 'bg-warning-900/30 text-warning-300 border border-warning-800/50'
        : 'bg-warning-50 text-warning-700 border border-warning-100';
    } else {
      return darkMode
        ? 'bg-danger-900/30 text-danger-300 border border-danger-800/50'
        : 'bg-danger-50 text-danger-700 border border-danger-100';
    }
  };

  return (
    <div>
      {/* Verdict and summary */}
      <div className="mb-4">
        <h3 className={`font-medium text-base mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center`}>
          <Lock size={16} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} />
          Security Analysis
        </h3>

        <div className={`p-3 rounded-lg ${
          analysis.score >= 3
            ? (darkMode ? 'bg-success-900/20 border border-success-800/30' : 'bg-success-50 border border-success-100')
            : analysis.score >= 2
            ? (darkMode ? 'bg-warning-900/20 border border-warning-800/30' : 'bg-warning-50 border border-warning-100')
            : (darkMode ? 'bg-danger-900/20 border border-danger-800/30' : 'bg-danger-50 border border-danger-100')
        }`}>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {analysis.verdict}
          </p>
        </div>
      </div>

      {/* Time to crack */}
      <div className="mb-4 text-center">
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs ${getTimeClass(analysis.timeToBreak)}`}>
          <Shield size={12} className="mr-1" />
          Estimated time to crack: <span className="font-bold ml-1">{analysis.timeToBreak}</span>
        </div>
      </div>

      {/* Security checks */}
      <div className="space-y-2">
        <h4 className={`text-xs uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Security Checks
        </h4>

        {analysis.checks.map((check, index) => (
          <div
            key={index}
            className={`flex items-center py-2 px-3 rounded-md ${
              check.severity === 'high' && !check.passed
                ? darkMode ? 'bg-danger-900/30 border border-danger-800/50' : 'bg-danger-50 border border-danger-100'
                : check.severity === 'medium' && !check.passed
                ? darkMode ? 'bg-warning-900/30 border border-warning-800/50' : 'bg-warning-50 border border-warning-100'
                : darkMode ? 'bg-dark-700/50 border border-dark-600' : 'bg-gray-50 border border-gray-200'
            }`}
          >
            {check.passed ? (
              <CheckCircle
                size={16}
                className={`mr-2 ${darkMode ? 'text-success-400' : 'text-success-500'} flex-shrink-0`}
                aria-hidden="true"
              />
            ) : (
              <XCircle
                size={16}
                className={`mr-2 flex-shrink-0 ${
                  check.severity === 'high'
                    ? darkMode ? 'text-danger-400' : 'text-danger-500'
                    : check.severity === 'medium'
                    ? darkMode ? 'text-warning-400' : 'text-warning-500'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
                aria-hidden="true"
              />
            )}
            <div className="flex-grow">
              <div className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {check.name}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {check.message}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Entropy info */}
      <div className="mt-4">
        <div className={`flex items-center justify-between text-xs px-3 py-2 rounded-md ${
          darkMode ? 'bg-dark-700/30 border border-dark-600' : 'bg-gray-50 border border-gray-200'
        }`}>
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Entropy:
          </span>
          <span className={
            analysis.entropy > 80 ? 'text-success-500 font-medium' :
            analysis.entropy > 60 ? 'text-primary-500 font-medium' :
            analysis.entropy > 40 ? 'text-warning-500 font-medium' :
            'text-danger-500 font-medium'
          }>
            {analysis.entropy.toFixed(1)} bits
          </span>
        </div>
        <div className={`mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
          <Info size={12} className="inline mr-1" />
          Higher entropy means more randomness and better security.
        </div>
      </div>
    </div>
  );
};

export default SecurityCheck;
