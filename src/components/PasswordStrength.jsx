import React from 'react';
import { Shield, AlertTriangle, Check, AlertCircle } from 'lucide-react';

const PasswordStrength = ({ score, entropy, darkMode }) => {
  const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const strengthColors = [
    'text-danger-500',
    'text-warning-500',
    'text-yellow-500',
    'text-primary-500',
    'text-success-500'
  ];

  const getEntropyDescription = () => {
    if (entropy < 40) return { text: 'Very vulnerable', icon: <AlertTriangle size={14} className="text-danger-400" /> };
    if (entropy < 60) return { text: 'Somewhat secure', icon: <AlertCircle size={14} className="text-warning-400" /> };
    if (entropy < 80) return { text: 'Reasonably secure', icon: <Shield size={14} className="text-primary-400" /> };
    return { text: 'Very secure', icon: <Check size={14} className="text-success-400" /> };
  };

  const entropyInfo = getEntropyDescription();

  return (
    <div className={`rounded-xl p-4 mb-4 transition-all duration-300 ${
      darkMode
        ? 'bg-dark-700/50 border border-dark-600'
        : 'bg-gray-50 border border-gray-100'
    }`}>
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-center">
          <span className={`font-medium text-base ${strengthColors[score]}`}>
            {strengthLabels[score]}
          </span>
          <span className={`text-sm px-2 py-1 rounded-full flex items-center space-x-1 ${
            darkMode
              ? entropy > 80 ? 'bg-success-900/30 text-success-300 border border-success-800/50' :
                entropy > 60 ? 'bg-primary-900/30 text-primary-300 border border-primary-800/50' :
                entropy > 40 ? 'bg-warning-900/30 text-warning-300 border border-warning-800/50' :
                'bg-danger-900/30 text-danger-300 border border-danger-800/50'
              : entropy > 80 ? 'bg-success-100 text-success-700' :
                entropy > 60 ? 'bg-primary-100 text-primary-700' :
                entropy > 40 ? 'bg-warning-100 text-warning-700' :
                'bg-danger-100 text-danger-700'
          }`}>
            {entropyInfo.icon}
            <span>{entropyInfo.text}</span>
          </span>
        </div>

        <div className="flex space-x-1.5" role="progressbar" aria-valuenow={score+1} aria-valuemin="0" aria-valuemax="5" aria-label={`Password strength: ${strengthLabels[score]}`}>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                level <= score
                  ? level === 0 ? 'bg-gradient-to-r from-danger-600 to-danger-500' :
                    level === 1 ? 'bg-gradient-to-r from-warning-600 to-warning-500' :
                    level === 2 ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' :
                    level === 3 ? 'bg-gradient-to-r from-primary-600 to-primary-500' :
                    'bg-gradient-to-r from-success-600 to-success-500'
                  : darkMode ? 'bg-dark-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Entropy: <span className={
              entropy > 100 ? 'text-success-400 font-medium' :
              entropy > 80 ? 'text-success-500 font-medium' :
              entropy > 60 ? 'text-primary-500 font-medium' :
              entropy > 40 ? 'text-warning-500 font-medium' :
              'text-danger-500 font-medium'
            }>{entropy.toFixed(1)} bits</span>
          </div>

          {entropy > 100 && (
            <span className="text-success-500 text-xs px-2 py-0.5 rounded-full bg-success-500/10">
              Excellent Security
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordStrength;
