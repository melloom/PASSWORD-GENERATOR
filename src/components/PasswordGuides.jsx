import React, { useState, useRef, useEffect } from 'react';
import {
  X, Shield, Check, Info, AlertTriangle, Lock, Key, RefreshCcw, FileText, BookOpen, ChevronDown, Award, Zap, Target, Tool, Globe, Users, MessageCircle, ExternalLink, Github, FileJson, FileCode
} from 'lucide-react';

const externalResources = [
  {
    label: "CISA: Creating and Managing Strong Passwords",
    url: "https://www.cisa.gov/news-events/news/creating-and-managing-strong-passwords",
    icon: <Shield size={16} />,
    desc: "US Cybersecurity Agency's official password guide."
  },
  {
    label: "NIST: Multi-Factor Authentication Guide",
    url: "https://www.nist.gov/itl/applied-cybersecurity/tig/back-basics-multi-factor-authentication",
    icon: <Lock size={16} />,
    desc: "Modern best practices for passwords and 2FA."
  },
  {
    label: "OWASP Top 10",
    url: "https://owasp.org/www-project-top-ten/",
    icon: <AlertTriangle size={16} />,
    desc: "Most critical web security risks."
  },
  {
    label: "EFF: Password Advice",
    url: "https://ssd.eff.org/en/module/creating-strong-passwords",
    icon: <BookOpen size={16} />,
    desc: "Electronic Frontier Foundation's password tips."
  },
  {
    label: "XKCD: Password Strength Comic",
    url: "https://xkcd.com/936/",
    icon: <Zap size={16} />,
    desc: "Famous comic on passphrases."
  },
  {
    label: "Have I Been Pwned?",
    url: "https://haveibeenpwned.com/",
    icon: <Info size={16} />,
    desc: "Check if your passwords/emails have been leaked."
  },
  {
    label: "Bitwarden Password Manager",
    url: "https://bitwarden.com/",
    icon: <FileJson size={16} />,
    desc: "Open-source password manager."
  },
  {
    label: "1Password",
    url: "https://1password.com/",
    icon: <FileJson size={16} />,
    desc: "Popular commercial password manager."
  },
  {
    label: "Lockora Docs",
    url: "https://github.com/melloom/password-generator#readme",
    icon: <FileCode size={16} />,
    desc: "Official documentation for this app."
  }
];

const guideSections = [
  {
    id: 'fundamentals',
    title: "Password Strength Fundamentals",
    icon: <Shield size={20} className="mr-2" />,
    description: "Learn the core principles that make passwords strong and resistant to cracking.",
    content: [
      {
        id: 'length',
        subtitle: "Length Matters",
        text: "Longer passwords are exponentially stronger. Aim for at least 12 characters, but 16+ is ideal for important accounts.",
        tips: [
          "Every character you add multiplies the difficulty to crack your password.",
          "A 16-character password can be billions of times stronger than an 8-character one.",
          "Many sites now allow up to 64 or even 128 characters—use it!"
        ],
        importance: "high"
      },
      {
        id: 'variety',
        subtitle: "Character Variety",
        text: "Use a mix of uppercase, lowercase, numbers, and symbols for maximum complexity.",
        tips: [
          "Using all four character types significantly increases password strength.",
          "Even a single number or symbol makes your password much harder to crack.",
          "Avoid only using letters or only numbers."
        ],
        importance: "high"
      },
      {
        id: 'entropy',
        subtitle: "Entropy: The Science of Unpredictability",
        text: "Entropy measures how unpredictable your password is. Higher entropy means more security.",
        tips: [
          "Randomly generated passwords have the highest entropy.",
          "Passphrases made from unrelated words also provide high entropy.",
          "Avoid patterns or predictable substitutions (like 'P@ssw0rd')."
        ],
        importance: "medium"
      }
    ]
  },
  {
    id: 'memorable',
    title: "Creating Memorable Strong Passwords",
    icon: <Key size={20} className="mr-2" />,
    description: "Techniques for creating passwords that are both secure and easy to remember.",
    content: [
      {
        id: 'passphrase',
        subtitle: "Passphrase Method",
        text: "Combine multiple random words with numbers and symbols. Example: correct-horse-battery-staple.",
        examples: ["correct-horse-battery-staple", "Pizza!Elephant5Keyboard", "sunshine-rocket!42"],
        tips: [
          "The more random and unrelated the words, the better.",
          "Add symbols or numbers between words.",
          "Use a password manager to generate and store passphrases."
        ],
        importance: "medium"
      },
      {
        id: 'sentence',
        subtitle: "Sentence Method",
        text: "Create an acronym from a meaningful sentence. Example: 'I love eating pizza with extra cheese!' → IlepwEc!",
        examples: ["I love eating pizza with extra cheese! → IlepwEc!"],
        tips: [
          "Include punctuation from your original sentence.",
          "Mix in capitals and substitute numbers for letters.",
          "Make it personal but not guessable."
        ],
        importance: "medium"
      },
      {
        id: 'diceware',
        subtitle: "Diceware & Wordlists",
        text: "Use a wordlist (like Diceware) to randomly select words for your passphrase.",
        tips: [
          "Roll dice or use a random generator to pick words.",
          "The more words, the stronger the passphrase.",
          "Never use a published example passphrase."
        ],
        importance: "medium"
      }
    ]
  },
  {
    id: 'best-practices',
    title: "Password Security Best Practices",
    icon: <Lock size={20} className="mr-2" />,
    description: "Essential habits to maintain strong security across all your accounts.",
    content: [
      {
        id: 'unique',
        subtitle: "One Password Per Account",
        text: "Never reuse passwords across different accounts.",
        tips: [
          "If one service is compromised, your other accounts remain safe.",
          "Use a password manager to help manage multiple passwords.",
          "Set up unique passwords for email, banking, and social media."
        ],
        importance: "critical"
      },
      {
        id: 'updates',
        subtitle: "Regular Updates",
        text: "Change critical passwords every 3-6 months.",
        tips: [
          "Set calendar reminders for password changes.",
          "Prioritize financial and email accounts.",
          "Update passwords after any known breach."
        ],
        importance: "high"
      },
      {
        id: '2fa',
        subtitle: "Two-Factor Authentication",
        text: "Enable 2FA whenever possible for an extra layer of security.",
        tips: [
          "Even if someone gets your password, they still need your second factor.",
          "Use an authenticator app rather than SMS when possible.",
          "Backup your 2FA codes securely."
        ],
        importance: "critical"
      },
      {
        id: 'monitor',
        subtitle: "Monitor for Breaches",
        text: "Check your emails and passwords on sites like Have I Been Pwned.",
        tips: [
          "Subscribe to breach notifications.",
          "Change passwords immediately if you are affected.",
          "Use unique passwords to limit breach impact."
        ],
        importance: "high"
      }
    ]
  },
  {
    id: 'pitfalls',
    title: "Common Password Pitfalls",
    icon: <AlertTriangle size={20} className="mr-2" />,
    description: "Mistakes to avoid when creating passwords that could compromise security.",
    content: [
      {
        id: 'personal',
        subtitle: "Avoid Personal Information",
        text: "Don't use names, birthdays, or other personal details in passwords.",
        examples: ["Your pet's name", "Your birth year", "Your address"],
        tips: [
          "Attackers can easily find personal info from social media.",
          "Avoid using any info that can be guessed or found online."
        ],
        importance: "high"
      },
      {
        id: 'dictionary',
        subtitle: "Skip Dictionary Words",
        text: "Simple substitutions (a→4, e→3) are easily cracked by modern tools.",
        examples: ["p4ssw0rd", "s3cur1ty"],
        tips: [
          "Password crackers use huge dictionaries and common substitutions.",
          "Randomness is more important than clever substitutions."
        ],
        importance: "high"
      },
      {
        id: 'patterns',
        subtitle: "Stay Away From Patterns",
        text: "Keyboard patterns or repeated characters are easy to crack.",
        examples: ["qwerty123", "12345678", "aaaabbbb"],
        tips: [
          "Avoid sequences, repeated characters, or keyboard walks.",
          "Use a password manager to generate random passwords."
        ],
        importance: "high"
      }
    ]
  },
  {
    id: 'storage',
    title: "Password Storage Security",
    icon: <FileText size={20} className="mr-2" />,
    description: "Safe ways to store and manage your passwords to prevent unauthorized access.",
    content: [
      {
        id: 'managers',
        subtitle: "Password Managers",
        text: "Use a reputable password manager to securely store and generate passwords.",
        tips: [
          "Only remember one master password.",
          "Many offer secure sharing and breach monitoring.",
          "Choose open-source or well-reviewed managers."
        ],
        importance: "high"
      },
      {
        id: 'physical',
        subtitle: "Physical Security",
        text: "If you must write down passwords, store them securely away from your devices.",
        tips: [
          "Never label them as 'passwords'.",
          "Consider using a physical safe for backup codes.",
          "Don't store passwords in plain text files on your computer."
        ],
        importance: "medium"
      },
      {
        id: 'emergency',
        subtitle: "Emergency Access",
        text: "Create a plan for trusted contacts to access critical accounts in emergencies.",
        tips: [
          "Consider a digital will for your passwords.",
          "Some password managers offer emergency access features.",
          "Keep backup codes in a secure location."
        ],
        importance: "medium"
      }
    ]
  }
];

const PasswordGuides = ({ isOpen, onClose, darkMode }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
      modalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full max-w-4xl rounded-xl ${darkMode ? 'bg-dark-800 text-gray-200' : 'bg-white text-gray-800'} border ${darkMode ? 'border-dark-700' : 'border-gray-300'} shadow-2xl animate-slideIn max-h-[90vh] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            <BookOpen size={20} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} />
            Password Security Guides
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-200'} transition-colors`}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 flex-grow">
          {/* Info box */}
          <div className={`p-4 mb-6 rounded-lg ${darkMode ? 'bg-primary-900/30 border border-primary-800/50 text-primary-300' : 'bg-primary-50 border border-primary-100 text-primary-700'} flex items-start`}>
            <Info size={16} className="mr-3 mt-0.5 flex-shrink-0" />
            <span>
              These guides will help you create strong, secure passwords and maintain good security practices.
              <br />
              <strong>Implementing these recommendations significantly improves your online security.</strong>
            </span>
          </div>

          {/* Main content sections */}
          <div className="space-y-8">
            {guideSections.map((section, idx) => (
              <section key={section.id} className={`${idx > 0 ? 'pt-6 border-t' : ''} ${darkMode ? 'border-dark-600' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium mb-4 flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {section.icon}
                  {section.title}
                </h3>
                <p className={`mb-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{section.description}</p>
                <div className="space-y-5">
                  {section.content.map((item, contentIdx) => {
                    const expanded = !!expandedItems[`${section.id}-${item.id}`];
                    return (
                      <div key={item.id} className={`mb-3 rounded-lg overflow-hidden border ${darkMode ? 'border-dark-600 bg-dark-700' : 'border-gray-200 bg-white'} ${expanded ? 'shadow-md' : 'shadow-sm'} transition-all`}>
                        <div
                          className={`p-3 flex justify-between items-center cursor-pointer ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-50'} transition-colors`}
                          onClick={() => setExpandedItems(prev => ({
                            ...prev,
                            [`${section.id}-${item.id}`]: !expanded
                          }))}
                        >
                          <h4 className={`font-medium text-base flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {item.icon && <span className="mr-2">{item.icon}</span>}
                            {item.subtitle}
                          </h4>
                          <span className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={18} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                          </span>
                        </div>
                        {expanded && (
                          <div className={`p-3 border-t ${darkMode ? 'border-dark-600 bg-dark-700/50' : 'border-gray-100'}`}>
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
                                <ul className="space-y-1">
                                  {item.tips.map((tip, tipIdx) => (
                                    <li key={tipIdx} className="flex items-start">
                                      <Check size={14} className={`mr-1.5 mt-0.5 ${darkMode ? 'text-success-400' : 'text-success-500'} flex-shrink-0`} />
                                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Resources Section */}
          <div className="mt-10">
            <h4 className={`text-lg font-semibold flex items-center mb-3 ${darkMode ? 'text-primary-300' : 'text-primary-700'}`}>
              <Globe size={18} className="mr-2" />
              Helpful Resources & Tools
            </h4>
            <div className="space-y-2">
              {externalResources.map(r => (
                <a
                  key={r.label}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center p-3 rounded-lg border transition-all hover:shadow ${
                    darkMode
                      ? 'bg-dark-800 border-dark-700 hover:bg-dark-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{r.icon}</span>
                  <span className="font-medium">{r.label}</span>
                  <span className="ml-2 text-xs text-gray-400">{r.desc}</span>
                  <ExternalLink size={14} className="ml-auto opacity-60" />
                </a>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://github.com/melloom/password-generator"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${
                  darkMode
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Github size={18} className="mr-2" />
                Star on GitHub
                <ExternalLink size={14} className="ml-1 opacity-60" />
              </a>
              <a
                href="https://github.com/melloom/password-generator/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${
                  darkMode
                    ? 'bg-primary-700 text-white hover:bg-primary-600'
                    : 'bg-primary-500 text-white hover:bg-primary-400'
                }`}
              >
                <MessageCircle size={18} className="mr-2" />
                Join the Community
                <ExternalLink size={14} className="ml-1 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${darkMode ? 'border-dark-700' : 'border-gray-200'} flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
              darkMode
                ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-sm hover:shadow-md'
                : 'bg-primary-500 hover:bg-primary-400 text-white shadow-sm hover:shadow-md'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordGuides;