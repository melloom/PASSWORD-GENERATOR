import React, { useRef, useEffect } from 'react';
import {
  X, Github, Coffee, Code, Globe, Heart, Star, Shield, Sparkles,
  CheckCircle, BookOpen, FileText, HelpCircle, Mail, ExternalLink,
  Twitter, Linkedin, Youtube, MessageCircle, Users, Zap, Info, AlertTriangle
} from 'lucide-react';

// Simplified socials array with only GitHub
const socials = [
  {
    label: "GitHub",
    url: "https://github.com/melloom",
    icon: <Github size={18} />,
    color: "bg-gray-900 text-white hover:bg-gray-800"
  }
];

const resources = [
  {
    label: "Official Docs",
    url: "https://github.com/melloom/password-generator#readme",
    icon: <BookOpen size={16} />,
    desc: "Project documentation and usage tips."
  },
  {
    label: "Password Security Guide",
    url: "https://www.cisa.gov/news-events/news/creating-and-managing-strong-passwords",
    icon: <Shield size={16} />,
    desc: "CISA's official password creation guide."
  },
  {
    label: "NIST Password Guidelines",
    url: "https://www.nist.gov/itl/applied-cybersecurity/tig/back-basics-multi-factor-authentication",
    icon: <FileText size={16} />,
    desc: "Modern best practices for passwords."
  },
  {
    label: "OWASP Top 10",
    url: "https://owasp.org/www-project-top-ten/",
    icon: <Zap size={16} />,
    desc: "Most critical web security risks."
  },
  {
    label: "Contact Melvin",
    url: "mailto:melvin@example.com",
    icon: <Mail size={16} />,
    desc: "Email the creator directly."
  },
  {
    label: "Report a Bug",
    url: "https://github.com/melloom/password-generator/issues",
    icon: <AlertTriangle size={16} />,
    desc: "Found a bug? Let me know!"
  },
  {
    label: "Suggest a Feature",
    url: "https://github.com/melloom/password-generator/discussions",
    icon: <MessageCircle size={16} />,
    desc: "Share your ideas for improvements."
  }
];

const CreatorInfo = ({ isOpen, onClose, darkMode }) => {
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
        className={`relative w-full max-w-2xl rounded-xl ${darkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-300'} shadow-2xl animate-slideIn max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className={`relative ${darkMode ? 'bg-gradient-to-r from-primary-900/40 via-primary-800/30 to-primary-900/40' : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50'} rounded-t-xl p-4 border-b ${darkMode ? 'border-dark-600' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center relative z-10">
            <h2 className="text-xl font-bold flex items-center">
              <Code size={22} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
              About the Creator
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-dark-600/70' : 'hover:bg-gray-200/70'} transition-colors`}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-0 flex-grow">
          {/* Profile Card */}
          <div className={`${darkMode ? 'bg-dark-700/50' : 'bg-gray-50'} p-6 relative overflow-hidden`}>
            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
              {/* Avatar with glow effect */}
              <div className={`relative ${darkMode ? 'avatar-glow-dark' : 'avatar-glow-light'}`}>
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-500 via-primary-400 to-secondary-500 p-1">
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${darkMode ? 'bg-dark-800' : 'bg-white'}`}>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">MP</span>
                  </div>
                </div>
              </div>
              {/* Creator info */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Melvin Peralta</h3>
                <div className={`flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400">Web Developer</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary-500/10 text-secondary-400">Security Enthusiast</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-500/10 text-success-400">UX Designer</span>
                </div>
                <p className={`mt-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Passionate about creating secure, intuitive digital experiences with a focus on privacy, accessibility, and open-source collaboration.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                  {/* Only GitHub link */}
                  {socials.map(s => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center px-3 py-2 rounded-lg font-medium shadow-sm transition-all ${s.color}`}
                      title={s.label}
                    >
                      {s.icon}
                      <span className="ml-2">{s.label}</span>
                      <ExternalLink size={14} className="ml-1 opacity-60" />
                    </a>
                  ))}

                  {/* GitHub Sponsors Support Button */}
                  <a
                    href="https://github.com/sponsors/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center px-3 py-2 rounded-lg font-medium shadow-sm transition-all ${
                      darkMode
                        ? 'bg-pink-600 hover:bg-pink-700 text-white'
                        : 'bg-pink-500 hover:bg-pink-600 text-white'
                    }`}
                    title="Sponsor on GitHub"
                  >
                    <Heart size={18} className="mr-2" />
                    <span>Support Us</span>
                    <ExternalLink size={14} className="ml-1 opacity-60" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-6 space-y-6">
            {/* About section */}
            <div className={`p-5 rounded-xl ${darkMode ? 'bg-dark-700' : 'bg-white'} border ${darkMode ? 'border-dark-600' : 'border-gray-200'} shadow-sm`}>
              <h4 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                <Sparkles size={18} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} />
                About This Project
              </h4>
              <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Lockora is a modern, user-friendly password generator that prioritizes security and privacy. All operations happen exclusively in your browser—no data is ever sent to any server.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`flex items-center p-2 rounded-lg ${darkMode ? 'bg-dark-600' : 'bg-gray-50'}`}>
                  <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${darkMode ? 'bg-primary-900/50' : 'bg-primary-100'}`}>
                    <Shield size={16} className={darkMode ? 'text-primary-400' : 'text-primary-600'} />
                  </div>
                  <div>
                    <h5 className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Client-side Security</h5>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CSPRNG & zero server storage</p>
                  </div>
                </div>
                <div className={`flex items-center p-2 rounded-lg ${darkMode ? 'bg-dark-600' : 'bg-gray-50'}`}>
                  <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${darkMode ? 'bg-secondary-900/50' : 'bg-secondary-100'}`}>
                    <CheckCircle size={16} className={darkMode ? 'text-secondary-400' : 'text-secondary-600'} />
                  </div>
                  <div>
                    <h5 className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Privacy Focused</h5>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No tracking or analytics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive/Helpful Actions */}
            <div className={`p-5 rounded-xl ${darkMode ? 'bg-dark-700' : 'bg-white'} border ${darkMode ? 'border-dark-600' : 'border-gray-200'} shadow-sm`}>
              <h4 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                <HelpCircle size={18} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} />
                Helpful Actions & Resources
              </h4>
              <div className="space-y-3">
                {resources.map(r => (
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
                <button
                  className={`w-full mt-2 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all ${
                    darkMode
                      ? 'bg-primary-700 hover:bg-primary-600 text-white'
                      : 'bg-primary-500 hover:bg-primary-400 text-white'
                  }`}
                  onClick={() => window.open('https://github.com/melloom/password-generator', '_blank')}
                >
                  <Star size={18} className="mr-2" />
                  Star on GitHub
                </button>
                <button
                  className={`w-full mt-2 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all ${
                    darkMode
                      ? 'bg-secondary-700 hover:bg-secondary-600 text-white'
                      : 'bg-secondary-500 hover:bg-secondary-400 text-white'
                  }`}
                  onClick={() => window.open('https://github.com/melloom/password-generator/discussions', '_blank')}
                >
                  <MessageCircle size={18} className="mr-2" />
                  Join the Community Discussion
                </button>
              </div>
            </div>

            {/* Message from creator */}
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-dark-800/50 border-dark-600' : 'bg-blue-50 border-blue-100'} flex items-center`}>
              <div className={`rounded-full ${darkMode ? 'bg-primary-900/50' : 'bg-blue-100'} p-2 mr-3`}>
                <Heart size={16} className={darkMode ? 'text-primary-400' : 'text-primary-600'} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Thank you for using Lockora! If you have feedback, ideas, or want to contribute, reach out or open a pull request!
              </p>
            </div>
          </div>
        </div>

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

        {/* CSS for animations and effects */}
        <style jsx>{`
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 15px 0px rgba(59, 130, 246, 0.4); }
            50% { box-shadow: 0 0 25px 5px rgba(59, 130, 246, 0.6); }
          }
          @keyframes glowDark {
            0%, 100% { box-shadow: 0 0 15px 0px rgba(99, 102, 241, 0.4); }
            50% { box-shadow: 0 0 25px 5px rgba(99, 102, 241, 0.6); }
          }
          .avatar-glow-light {
            animation: glow 3s infinite;
          }
          .avatar-glow-dark {
            animation: glowDark 3s infinite;
          }
          @keyframes subtle-shift {
            0% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
            100% { transform: translateY(0); }
          }
          .social-button-light:hover,
          .social-button-dark:hover,
          .support-button-light:hover,
          .support-button-dark:hover {
            animation: subtle-shift 1s infinite;
          }
          .support-button-light {
            background: linear-gradient(135deg, #3b82f6, #6366f1);
          }
          .support-button-light:hover {
            background: linear-gradient(135deg, #2563eb, #4f46e5);
          }
          .support-button-dark {
            background: linear-gradient(135deg, #2563eb, #4338ca);
          }
          .support-button-dark:hover {
            background: linear-gradient(135deg, #1d4ed8, #3730a3);
          }
          .animate-slideIn {
            animation: slideIn 0.3s ease-out forwards;
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CreatorInfo;
