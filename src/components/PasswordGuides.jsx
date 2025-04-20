import React from 'react';
import { X, Shield, Check, Info, AlertTriangle, Lock, Key, RefreshCcw, FileText, BookOpen } from 'lucide-react';

const PasswordGuides = ({ isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

  // Password guide content sections
  const guideSections = [
    {
      title: "Password Strength Fundamentals",
      icon: <Shield size={20} className="mr-2" />,
      content: [
        {
          subtitle: "Length Matters",
          text: "Longer passwords are exponentially stronger. Aim for at least 12 characters, preferably 16+.",
          tips: ["Every character you add multiplies the difficulty to crack your password", "A 16-character password can be billions of times stronger than an 8-character one"],
          importance: "high"
        },
        {
          subtitle: "Character Variety",
          text: "Use a mix of uppercase, lowercase, numbers, and symbols for maximum complexity.",
          tips: ["Using all four character types significantly increases password strength", "Even a single number or symbol makes your password much harder to crack"],
          importance: "high"
        }
      ]
    },
    {
      title: "Creating Memorable Strong Passwords",
      icon: <Key size={20} className="mr-2" />,
      content: [
        {
          subtitle: "Passphrase Method",
          text: "Combine multiple random words with numbers and symbols.",
          examples: ["correct-horse-battery-staple", "Pizza!Elephant5Keyboard"],
          tips: ["The more random and unrelated the words, the better", "Add symbols or numbers between words"],
          importance: "medium"
        },
        {
          subtitle: "Sentence Method",
          text: "Create an acronym from a meaningful sentence.",
          examples: ["I love eating pizza with extra cheese! → IlepwEc!"],
          tips: ["Include punctuation from your original sentence", "Mix in capitals and substitute numbers for letters"],
          importance: "medium"
        }
      ]
    },
    {
      title: "Password Security Best Practices",
      icon: <Lock size={20} className="mr-2" />,
      content: [
        {
          subtitle: "One Password Per Account",
          text: "Never reuse passwords across different accounts.",
          tips: ["If one service is compromised, your other accounts remain safe", "Consider using a password manager to help manage multiple passwords"],
          importance: "critical",
          icon: <AlertTriangle size={16} className="text-danger-500" />
        },
        {
          subtitle: "Regular Updates",
          text: "Change critical passwords every 3-6 months.",
          tips: ["Set calendar reminders for password changes", "Prioritize financial and email accounts"],
          importance: "high"
        },
        {
          subtitle: "Two-Factor Authentication",
          text: "Enable 2FA whenever possible for an extra layer of security.",
          tips: ["Even if someone gets your password, they still need your second factor", "Use an authenticator app rather than SMS when possible"],
          importance: "critical",
          icon: <Info size={16} className="text-primary-500" />
        }
      ]
    },
    {
      title: "Common Password Pitfalls",
      icon: <AlertTriangle size={20} className="mr-2" />,
      content: [
        {
          subtitle: "Avoid Personal Information",
          text: "Don't use names, birthdays, or other personal details in passwords.",
          examples: ["Your pet's name", "Your birth year", "Your address"],
          importance: "high"
        },
        {
          subtitle: "Skip Dictionary Words",
          text: "Simple substitutions (a→4, e→3) are easily cracked by modern tools.",
          examples: ["p4ssw0rd", "s3cur1ty"],
          importance: "high"
        },
        {
          subtitle: "Stay Away From Patterns",
          text: "Keyboard patterns or repeated characters are easy to crack.",
          examples: ["qwerty123", "12345678", "aaaabbbb"],
          importance: "high"
        }
      ]
    },
    {
      title: "Password Storage Security",
      icon: <FileText size={20} className="mr-2" />,
      content: [
        {
          subtitle: "Password Managers",
          text: "Use a reputable password manager to securely store and generate passwords.",
          tips: ["Only remember one master password", "Many offer secure sharing and breach monitoring"],
          importance: "high"
        },
        {
          subtitle: "Physical Security",
          text: "If you must write down passwords, store them securely away from your devices.",
          tips: ["Never label them as 'passwords'", "Consider using a physical safe for backup codes"],
          importance: "medium"
        },
        {
          subtitle: "Emergency Access",
          text: "Create a plan for trusted contacts to access critical accounts in emergencies.",
          tips: ["Consider a digital will for your passwords", "Some password managers offer emergency access features"],
          importance: "medium"
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full max-w-4xl rounded-xl ${darkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-300'} shadow-2xl animate-slideIn max-h-[90vh] flex flex-col`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-medium flex items-center">
            <BookOpen size={20} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} />
            Password Security Guides
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200/20">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex-grow">
          <div className="text-sm mb-6">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-primary-900/30 border border-primary-800/50' : 'bg-primary-50 border border-primary-100'}`}>
              <p className={`flex items-start ${darkMode ? 'text-primary-300' : 'text-primary-700'}`}>
                <Info size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>These guides will help you create strong, secure passwords and maintain good security practices. Implementing these recommendations significantly improves your online security.</span>
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {guideSections.map((section, idx) => (
              <section key={idx} className={`${idx > 0 ? 'pt-6 border-t' : ''} ${darkMode ? 'border-dark-600' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium mb-4 flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {section.icon}
                  {section.title}
                </h3>

                <div className="space-y-5">
                  {section.content.map((item, contentIdx) => (
                    <div key={contentIdx} className={`p-4 rounded-lg ${darkMode ? 'bg-dark-700' : 'bg-gray-50'} border ${darkMode ? 'border-dark-600' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start">
                        <h4 className={`font-medium mb-1.5 ${darkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center`}>
                          {item.importance === 'critical' && <AlertTriangle size={16} className={`mr-1.5 ${darkMode ? 'text-danger-400' : 'text-danger-500'}`} />}
                          {item.subtitle}
                        </h4>
                        {item.importance === 'high' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-700'}`}>
                            Important
                          </span>
                        )}
                        {item.importance === 'critical' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-danger-900/30 text-danger-400' : 'bg-danger-100 text-danger-700'}`}>
                            Critical
                          </span>
                        )}
                      </div>

                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.text}</p>

                      {item.examples && (
                        <div className="mb-3">
                          <div className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Examples:</div>
                          <ul className={`list-disc pl-5 text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {item.examples.map((ex, exIdx) => (
                              <li key={exIdx} className="font-mono">{ex}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.tips && (
                        <div>
                          <div className={`text-xs uppercase font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tips:</div>
                          <ul className={`space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {item.tips.map((tip, tipIdx) => (
                              <li key={tipIdx} className="text-sm flex items-start">
                                <Check size={14} className={`mr-1.5 mt-0.5 ${darkMode ? 'text-success-400' : 'text-success-500'} flex-shrink-0`} />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Additional resources and links */}
          <div className={`mt-8 p-4 rounded-lg border ${darkMode ? 'bg-dark-700/50 border-dark-600' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Additional Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.cisa.gov/news-events/news/creating-and-managing-strong-passwords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm flex items-center ${darkMode ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'}`}
                >
                  <FileText size={14} className="mr-1.5" />
                  CISA Guidelines on Creating Strong Passwords
                </a>
              </li>
              <li>
                <a
                  href="https://www.nist.gov/itl/applied-cybersecurity/tig/back-basics-multi-factor-authentication"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm flex items-center ${darkMode ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'}`}
                >
                  <Lock size={14} className="mr-1.5" />
                  NIST Multi-Factor Authentication Guide
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className={`p-4 border-t ${darkMode ? 'border-dark-700' : 'border-gray-200'} flex justify-between items-center`}>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Last updated: {new Date().toLocaleDateString()}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                onClose();
                // Scroll to top and generate a new password
                window.scrollTo(0, 0);
                // This would need to call the handleGeneratePassword function - implement this in the parent component
              }}
              className={`px-4 py-2 rounded-lg flex items-center ${
                darkMode
                  ? 'bg-dark-700 hover:bg-dark-600 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } transition-all`}
            >
              <RefreshCcw size={16} className="mr-1.5" />
              Generate New Password
            </button>

            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? 'bg-primary-600 hover:bg-primary-500 text-white'
                  : 'bg-primary-500 hover:bg-primary-400 text-white'
              } transition-all`}
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGuides;
