import React, { useState, useEffect, useRef } from 'react';
import { Shield, Clock, AlertTriangle, Check, Lock, Zap } from 'lucide-react';

const EnhancedStrengthMeter = ({ 
  password, 
  score, 
  entropy, 
  timeToBreak, 
  darkMode,
  showAnimation = true,
  compact = false
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [animatedTime, setAnimatedTime] = useState('');
  const [animatedEntropy, setAnimatedEntropy] = useState(0);
  const [charDistribution, setCharDistribution] = useState({
    lowercase: 0,
    uppercase: 0,
    numbers: 0,
    symbols: 0
  });
  
  const timeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500'
  ];
  
  // Time to crack descriptions
  const crackDescriptions = [
    { time: "Instantly", machine: "Any computer" },
    { time: "Seconds", machine: "A standard laptop" },
    { time: "Minutes", machine: "A desktop computer" },
    { time: "Hours", machine: "A high-end desktop" },
    { time: "Days", machine: "A powerful workstation" },
    { time: "Weeks", machine: "A server farm" },
    { time: "Months", machine: "A small organization" },
    { time: "Years", machine: "A large corporation" },
    { time: "Decades", machine: "A government agency" },
    { time: "Centuries", machine: "Supercomputers" },
    { time: "Eons", machine: "Beyond current technology" }
  ];
  
  const getCrackDescription = () => {
    if (!timeToBreak) return crackDescriptions[0];
    
    for (const desc of crackDescriptions) {
      if (timeToBreak.includes(desc.time)) {
        return desc;
      }
    }
    
    return crackDescriptions[0];
  };
  
  // Calculate character distribution
  useEffect(() => {
    if (!password) {
      setCharDistribution({ lowercase: 0, uppercase: 0, numbers: 0, symbols: 0 });
      return;
    }
    
    const distribution = {
      lowercase: 0,
      uppercase: 0,
      numbers: 0,
      symbols: 0
    };
    
    for (let i = 0; i < password.length; i++) {
      const char = password[i];
      if (/[a-z]/.test(char)) distribution.lowercase++;
      else if (/[A-Z]/.test(char)) distribution.uppercase++;
      else if (/[0-9]/.test(char)) distribution.numbers++;
      else distribution.symbols++;
    }
    
    // Convert to percentages
    const total = password.length;
    setCharDistribution({
      lowercase: (distribution.lowercase / total) * 100,
      uppercase: (distribution.uppercase / total) * 100,
      numbers: (distribution.numbers / total) * 100,
      symbols: (distribution.symbols / total) * 100
    });
  }, [password]);
  
  // Animate the entropy counter
  useEffect(() => {
    if (!showAnimation) {
      setAnimatedEntropy(entropy);
      return;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    let start = null;
    const duration = 1000; // 1 second
    const startValue = animatedEntropy;
    const endValue = entropy;
    
    const animateEntropy = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = startValue + (endValue - startValue) * progress;
      
      setAnimatedEntropy(parseFloat(currentValue.toFixed(1)));
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateEntropy);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animateEntropy);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [entropy, showAnimation]);
  
  // Animate time to break
  useEffect(() => {
    if (!timeToBreak || !showAnimation) {
      setAnimatedTime(timeToBreak || '');
      return;
    }
    
    const characters = timeToBreak.split('');
    let currentIndex = 0;
    
    // Clear previous animation if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setAnimatedTime('');
    
    const animateNextChar = () => {
      if (currentIndex < characters.length) {
        setAnimatedTime(prev => prev + characters[currentIndex]);
        currentIndex++;
        timeoutRef.current = setTimeout(animateNextChar, 40);
      } else {
        // Show comparison 500ms after animation completes
        timeoutRef.current = setTimeout(() => {
          setShowComparison(true);
        }, 500);
      }
    };
    
    // Start animation after a slight delay
    timeoutRef.current = setTimeout(animateNextChar, 300);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeToBreak, showAnimation]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  if (!password) {
    return (
      <div className={`text-center p-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Enter a password to see its strength
      </div>
    );
  }
  
  const crackDescription = getCrackDescription();
  
  // Use compact layout when requested
  if (compact) {
    return (
      <div className="flex items-center justify-between">
        <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <Shield size={16} className={`mr-1 ${
            score >= 3 ? (darkMode ? 'text-green-400' : 'text-green-600') :
            score >= 2 ? (darkMode ? 'text-yellow-400' : 'text-yellow-600') :
            (darkMode ? 'text-red-400' : 'text-red-600')
          }`} />
          <span className="text-sm">{strengthLabels[score]}</span>
        </div>
        
        <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <Clock size={14} className="mr-1" />
          <span className="text-sm">{timeToBreak}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-4 rounded-lg border ${
      darkMode ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
    } shadow-sm`}>
      {/* Strength Indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Shield size={20} className={`mr-2 ${
              score >= 3 ? (darkMode ? 'text-green-400' : 'text-green-600') :
              score >= 2 ? (darkMode ? 'text-yellow-400' : 'text-yellow-600') :
              (darkMode ? 'text-red-400' : 'text-red-600')
            }`} />
            <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Password Strength
            </h3>
          </div>
          
          <div className={`px-3 py-1 rounded-full strength-badge ${
            score === 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
            score === 1 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
            score === 2 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
            score === 3 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            {strengthLabels[score]}
          </div>
        </div>
        
        {/* Animated progress bar */}
        <div className={`h-2 w-full ${darkMode ? 'bg-dark-700' : 'bg-gray-200'} rounded-full overflow-hidden strength-level-indicator`}>
          <div
            className={`h-full ${strengthColors[score]} animate-progress`}
            style={{ width: `${Math.min(100, (score + 1) * 20)}%` }}
          />
        </div>
      </div>
      
      {/* Two column layout for metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Time to Crack */}
        <div className={`p-3 rounded-lg border ${
          darkMode ? 'bg-dark-700/50 border-dark-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center mb-1">
            <Clock size={16} className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Time to Crack
            </span>
          </div>
          
          <div className={`font-bold text-base animate-count-up ${
            timeToBreak.includes('cent') || timeToBreak.includes('year') ?
              (darkMode ? 'text-green-400' : 'text-green-600') :
            timeToBreak.includes('month') || timeToBreak.includes('week') ?
              (darkMode ? 'text-blue-400' : 'text-blue-600') :
            timeToBreak.includes('day') ?
              (darkMode ? 'text-yellow-400' : 'text-yellow-600') :
              (darkMode ? 'text-red-400' : 'text-red-600')
          }`}>
            {animatedTime}
          </div>
          
          {/* Machine comparison - animated appearance */}
          <div className={`crack-comparison text-xs ${showComparison ? 'show-comparison' : ''}`}>
            <Zap size={12} className={`mr-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {crackDescription.machine}
            </span>
          </div>
        </div>
        
        {/* Entropy */}
        <div className={`p-3 rounded-lg border ${
          darkMode ? 'bg-dark-700/50 border-dark-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center mb-1">
            <Lock size={16} className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Entropy
            </span>
          </div>
          
          <div className={`font-bold text-base ${
            animatedEntropy > 80 ? 
              (darkMode ? 'text-green-400' : 'text-green-600') :
            animatedEntropy > 60 ? 
              (darkMode ? 'text-blue-400' : 'text-blue-600') :
            animatedEntropy > 40 ? 
              (darkMode ? 'text-yellow-400' : 'text-yellow-600') :
              (darkMode ? 'text-red-400' : 'text-red-600')
          }`}>
            {animatedEntropy} bits
            <span className={`ml-2 text-xs font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ({animatedEntropy < 40 ? 'Low' : 
                animatedEntropy < 60 ? 'Medium' : 
                animatedEntropy < 80 ? 'High' : 'Very High'})
            </span>
          </div>
          
          {/* Character distribution bar */}
          <div className="char-distribution mt-2">
            {charDistribution.lowercase > 0 && (
              <div 
                className="char-segment bg-blue-500" 
                style={{ width: `${charDistribution.lowercase}%` }}
                title={`Lowercase: ${Math.round(charDistribution.lowercase)}%`}
              >
                {charDistribution.lowercase > 15 && (
                  <span className="char-segment-label">a-z</span>
                )}
              </div>
            )}
            
            {charDistribution.uppercase > 0 && (
              <div 
                className="char-segment bg-green-500" 
                style={{ width: `${charDistribution.uppercase}%` }}
                title={`Uppercase: ${Math.round(charDistribution.uppercase)}%`}
              >
                {charDistribution.uppercase > 15 && (
                  <span className="char-segment-label">A-Z</span>
                )}
              </div>
            )}
            
            {charDistribution.numbers > 0 && (
              <div 
                className="char-segment bg-yellow-500" 
                style={{ width: `${charDistribution.numbers}%` }}
                title={`Numbers: ${Math.round(charDistribution.numbers)}%`}
              >
                {charDistribution.numbers > 15 && (
                  <span className="char-segment-label">0-9</span>
                )}
              </div>
            )}
            
            {charDistribution.symbols > 0 && (
              <div 
                className="char-segment bg-purple-500" 
                style={{ width: `${charDistribution.symbols}%` }}
                title={`Symbols: ${Math.round(charDistribution.symbols)}%`}
              >
                {charDistribution.symbols > 15 && (
                  <span className="char-segment-label">#$&</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Password composition reminder */}
      <div className={`mt-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="flex items-start">
          <Check size={14} className={`mt-0.5 mr-1 ${
            password.length >= 12 ? (darkMode ? 'text-green-400' : 'text-green-500') : 
            (darkMode ? 'text-gray-500' : 'text-gray-400')
          }`} />
          <span>12+ characters for stronger security</span>
        </div>
        
        <div className="flex items-start">
          <Check size={14} className={`mt-0.5 mr-1 ${
            /[A-Z]/.test(password) && /[a-z]/.test(password) ? 
              (darkMode ? 'text-green-400' : 'text-green-500') : 
              (darkMode ? 'text-gray-500' : 'text-gray-400')
          }`} />
          <span>Mix of uppercase and lowercase letters</span>
        </div>
        
        <div className="flex items-start">
          <Check size={14} className={`mt-0.5 mr-1 ${
            /\d/.test(password) ? (darkMode ? 'text-green-400' : 'text-green-500') : 
            (darkMode ? 'text-gray-500' : 'text-gray-400')
          }`} />
          <span>Include numbers</span>
        </div>
        
        <div className="flex items-start">
          <Check size={14} className={`mt-0.5 mr-1 ${
            /[^A-Za-z0-9]/.test(password) ? 
              (darkMode ? 'text-green-400' : 'text-green-500') : 
              (darkMode ? 'text-gray-500' : 'text-gray-400')
          }`} />
          <span>Include symbols for maximum strength</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStrengthMeter;
