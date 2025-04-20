import React from 'react';
import { X, Github, Coffee, Code } from 'lucide-react';

const CreatorInfo = ({ isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full max-w-md rounded-xl ${darkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-300'} shadow-2xl animate-slideIn max-h-[90vh] flex flex-col`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-medium flex items-center">
            <Code size={20} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} />
            About the Creator
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200/20"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex-grow">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
              MP
            </div>
            <h3 className="text-xl font-bold">Melvin Peralta</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              Software Engineer & Web Developer
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <h4 className={`text-sm uppercase tracking-wider font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                About
              </h4>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm mb-3`}>
                Hi there! I'm a passionate developer focused on creating secure, user-friendly web applications.
                This password generator was built using React and TailwindCSS with a focus on security, privacy,
                and accessibility.
              </p>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                I believe good security tools should be accessible to everyone, so this tool is completely free
                and doesn't collect any data. All operations happen directly in your browser.
              </p>
            </div>

            <div>
              <h4 className={`text-sm uppercase tracking-wider font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                Connect
              </h4>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com/melloom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center px-3 py-2 rounded-lg ${darkMode ? 'bg-dark-700 hover:bg-dark-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} transition-colors`}
                >
                  <Github size={16} className="mr-2" />
                  GitHub
                </a>
                <a
                  href="https://ko-fi.com/example"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center px-3 py-2 rounded-lg ${darkMode ? 'bg-dark-700 hover:bg-dark-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} transition-colors`}
                >
                  <Coffee size={16} className="mr-2" />
                  Buy me a coffee
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 border-t ${darkMode ? 'border-dark-700' : 'border-gray-200'} flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              darkMode
                ? 'bg-primary-600 hover:bg-primary-500 text-white'
                : 'bg-primary-500 hover:bg-primary-400 text-white'
            } transition-all`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorInfo;
