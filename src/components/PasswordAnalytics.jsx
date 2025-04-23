import React, { useMemo } from 'react';
import { BarChart4, TrendingUp, Clock, Key, Lock, ShieldAlert } from 'lucide-react';
import { calculateEntropy, calculateStrength } from '../utils/passwordUtils';

const PasswordAnalytics = ({ history = [], darkMode }) => {
  // Calculate analytics data from history
  const analytics = useMemo(() => {
    if (!history || history.length === 0) {
      return {
        averageStrength: 0,
        averageLength: 0,
        averageEntropy: 0,
        typeDistribution: {},
        characterTypes: {
          uppercase: 0,
          lowercase: 0,
          numbers: 0,
          symbols: 0
        },
        lengthDistribution: {}
      };
    }

    // Calculate metrics
    const totalPasswords = history.length;
    let totalStrength = 0;
    let totalLength = 0;
    let totalEntropy = 0;
    const types = {};
    const charTypes = { uppercase: 0, lowercase: 0, numbers: 0, symbols: 0 };
    const lengths = {};

    history.forEach(item => {
      const password = item.password || '';
      
      // Calculate strength and entropy
      const strength = calculateStrength(password);
      const entropy = calculateEntropy(password);
      
      totalStrength += strength;
      totalLength += password.length;
      totalEntropy += entropy;
      
      // Count password types
      const type = item.type || 'unknown';
      types[type] = (types[type] || 0) + 1;
      
      // Track length distribution
      const length = password.length;
      lengths[length] = (lengths[length] || 0) + 1;
      
      // Count character types
      if (/[A-Z]/.test(password)) charTypes.uppercase++;
      if (/[a-z]/.test(password)) charTypes.lowercase++;
      if (/[0-9]/.test(password)) charTypes.numbers++;
      if (/[^A-Za-z0-9]/.test(password)) charTypes.symbols++;
    });

    return {
      averageStrength: totalStrength / totalPasswords,
      averageLength: Math.round(totalLength / totalPasswords * 10) / 10,
      averageEntropy: Math.round(totalEntropy / totalPasswords * 10) / 10,
      typeDistribution: types,
      characterTypes: {
        uppercase: Math.round((charTypes.uppercase / totalPasswords) * 100),
        lowercase: Math.round((charTypes.lowercase / totalPasswords) * 100),
        numbers: Math.round((charTypes.numbers / totalPasswords) * 100),
        symbols: Math.round((charTypes.symbols / totalPasswords) * 100)
      },
      lengthDistribution: lengths
    };
  }, [history]);

  // Strength label
  const getStrengthLabel = (score) => {
    const labels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    return labels[Math.min(Math.floor(score), 4)];
  };

  // Get bar color based on percentage
  const getBarColor = (percentage, darkMode) => {
    if (percentage >= 80) return darkMode ? 'bg-success-600' : 'bg-success-500';
    if (percentage >= 60) return darkMode ? 'bg-primary-600' : 'bg-primary-500';
    if (percentage >= 40) return darkMode ? 'bg-warning-600' : 'bg-warning-500';
    if (percentage >= 20) return darkMode ? 'bg-orange-600' : 'bg-orange-500';
    return darkMode ? 'bg-danger-600' : 'bg-danger-500';
  };

  if (!history || history.length === 0) {
    return (
      <div className={`p-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <BarChart4 size={32} className="mx-auto mb-2 opacity-50" />
        <p>No password data available for analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4`}>
        <MetricCard 
          icon={<TrendingUp size={18} />} 
          title="Average Strength" 
          value={getStrengthLabel(analytics.averageStrength)}
          subtext={`${Math.round(analytics.averageStrength * 25)}% score`}
          darkMode={darkMode}
        />
        
        <MetricCard 
          icon={<Key size={18} />} 
          title="Average Length" 
          value={`${analytics.averageLength} characters`}
          subtext={analytics.averageLength >= 12 ? "Good length" : "Consider longer passwords"}
          darkMode={darkMode}
        />
        
        <MetricCard 
          icon={<ShieldAlert size={18} />} 
          title="Average Entropy" 
          value={`${analytics.averageEntropy} bits`}
          subtext={analytics.averageEntropy >= 60 ? "Strong entropy" : "Entropy could be improved"}
          darkMode={darkMode} 
        />
      </div>

      {/* Character Types */}
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-dark-700/50' : 'bg-gray-50'}`}>
        <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Character Types Used
        </h4>
        <div className="space-y-2">
          <ProgressBar 
            label="Uppercase (A-Z)" 
            percentage={analytics.characterTypes.uppercase}
            darkMode={darkMode}
          />
          <ProgressBar 
            label="Lowercase (a-z)" 
            percentage={analytics.characterTypes.lowercase}
            darkMode={darkMode}
          />
          <ProgressBar 
            label="Numbers (0-9)" 
            percentage={analytics.characterTypes.numbers}
            darkMode={darkMode}
          />
          <ProgressBar 
            label="Symbols (!@#$)" 
            percentage={analytics.characterTypes.symbols}
            darkMode={darkMode}
          />
        </div>
        <p className={`mt-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Percentages show how many of your passwords use each character type
        </p>
      </div>

      {/* Password Type Distribution */}
      {Object.keys(analytics.typeDistribution).length > 0 && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-dark-700/50' : 'bg-gray-50'}`}>
          <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Password Types
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(analytics.typeDistribution).map(([type, count]) => (
              <div 
                key={type}
                className={`p-3 rounded-lg text-center ${
                  darkMode ? 'bg-dark-600' : 'bg-white border border-gray-200'
                }`}
              >
                <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
                <div className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Recommendations */}
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-dark-700/50' : 'bg-blue-50/80'}`}>
        <h4 className={`text-sm font-medium mb-2 flex items-center ${
          darkMode ? 'text-gray-200' : 'text-blue-700'
        }`}>
          <Lock size={16} className="mr-2" />
          Security Recommendations
        </h4>
        <ul className={`list-disc pl-5 text-sm space-y-1 ${
          darkMode ? 'text-gray-300' : 'text-blue-800'
        }`}>
          {analytics.averageLength < 12 && (
            <li>Consider using longer passwords (12+ characters)</li>
          )}
          {analytics.characterTypes.uppercase < 80 && (
            <li>Include uppercase letters in more of your passwords</li>
          )}
          {analytics.characterTypes.numbers < 80 && (
            <li>Add numbers to more of your passwords</li>
          )}
          {analytics.characterTypes.symbols < 50 && (
            <li>Use special characters more frequently</li>
          )}
          {analytics.averageEntropy < 60 && (
            <li>Try more complex passwords to increase entropy</li>
          )}
          <li>Avoid reusing passwords across different sites</li>
        </ul>
      </div>
    </div>
  );
};

// Metric card component
const MetricCard = ({ icon, title, value, subtext, darkMode }) => (
  <div className={`p-4 rounded-lg ${
    darkMode ? 'bg-dark-700/50 text-gray-200' : 'bg-white border border-gray-200 text-gray-800'
  }`}>
    <div className="flex items-center mb-2">
      <div className={`p-2 rounded-full ${
        darkMode ? 'bg-dark-600' : 'bg-blue-50'
      } mr-2`}>
        {React.cloneElement(icon, { 
          className: darkMode ? 'text-primary-400' : 'text-primary-500'
        })}
      </div>
      <div className="text-sm font-medium">{title}</div>
    </div>
    <div className="text-xl font-bold">{value}</div>
    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      {subtext}
    </div>
  </div>
);

// Progress bar component
const ProgressBar = ({ label, percentage, darkMode }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </span>
      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {percentage}%
      </span>
    </div>
    <div className={`h-2 rounded-full ${darkMode ? 'bg-dark-600' : 'bg-gray-200'}`}>
      <div 
        className={`h-2 rounded-full ${getBarColor(percentage, darkMode)}`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

export default PasswordAnalytics;
