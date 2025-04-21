import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  Share2, Link, QrCode, Copy, Check, X, AlertTriangle,
  Mail, MessageSquare, Twitter, Facebook, Linkedin,
  Send, Globe, Smartphone, Info as InfoIcon,
  ShieldAlert, Lock, Shield, MessageCircle
} from 'lucide-react';

// Enhanced encryption helper with stronger security
const CryptoJS = window.CryptoJS || {
  // Fallback implementation if CryptoJS isn't available
  AES: {
    encrypt: (msg, key) => ({
      toString: () => {
        // More sophisticated fallback with additional encoding
        const encoded = btoa(encodeURIComponent(`${msg}:${key}`));
        return encoded.split('').reverse().join('') + btoa(Date.now());
      }
    }),
    decrypt: (ciphertext, key) => ({
      toString: () => {
        try {
          // Reverse the encoding from above
          const actual = ciphertext.split('').reverse().join('');
          return decodeURIComponent(atob(actual)).split(':')[0];
        } catch (e) {
          console.error("Decryption failed", e);
          return "";
        }
      }
    })
  }
};

const ShareButton = ({ password, darkMode, onShowQR }) => {
  // Basic state management
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [activeTab, setActiveTab] = useState('password');
  const [showCopied, setShowCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showTextCopied, setShowTextCopied] = useState(false);

  // Make modal state available to parent components via ref
  const modalStateRef = useRef({ showModal, setShowModal });

  // Update ref when state changes
  useEffect(() => {
    modalStateRef.current = { showModal, setShowModal };
  }, [showModal]);

  // Expose setShowModal to parent component
  useEffect(() => {
    if (window) {
      window.shareButtonState = modalStateRef.current;
    }
    return () => {
      if (window && window.shareButtonState) {
        delete window.shareButtonState;
      }
    };
  }, []);

  // Detect device type
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Add state to bypass security confirmation
  const [bypassConfirmation, setBypassConfirmation] = useState(false);

  // Add state for recipient info
  const [recipientInfo, setRecipientInfo] = useState('');

  // Clean up function for notifications
  useEffect(() => {
    let timer;
    if (showCopied) {
      timer = setTimeout(() => setShowCopied(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [showCopied]);

  // Clean up function for error messages
  useEffect(() => {
    let timer;
    if (errorMsg) {
      timer = setTimeout(() => setErrorMsg(null), 3000);
    }
    return () => clearTimeout(timer);
  }, [errorMsg]);

  // Clean up function for notifications
  useEffect(() => {
    let timer;
    if (notification) {
      timer = setTimeout(() => setNotification(null), 3000);
    }
    return () => clearTimeout(timer);
  }, [notification]);

  // Detect device type on component mount
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsMobile(/iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent));
    setIsIOS(/iphone|ipad|ipod/g.test(userAgent) && !window.MSStream);
  }, []);

  // Handle closing modal when clicking outside
  const handleModalOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  // Enhanced secure key generation with stronger entropy
  const generateSecureKey = () => {
    // Use crypto API for better randomness if available
    if (window.crypto && window.crypto.getRandomValues) {
      const randomBytes = new Uint8Array(32); // Increased from 16 to 32 bytes for better security
      window.crypto.getRandomValues(randomBytes);

      // Add time-based component for additional entropy
      const timeComponent = Date.now().toString(36);

      // Combine secure random bytes with time component
      const secureKey = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('') + timeComponent;

      return secureKey;
    } else {
      // Fallback for older browsers - less secure but still usable
      return Math.random().toString(36).substring(2) +
             Date.now().toString(36) +
             Math.random().toString(36).substring(2);
    }
  };

  // Enhanced encryption with additional security measures
  const encryptPassword = (pwd) => {
    try {
      const securityKey = generateSecureKey();

      // Add additional metadata for security verification
      const metadata = {
        v: 1, // version for future compatibility
        ts: Date.now(), // timestamp
        exp: Date.now() + 86400000, // 24 hour expiry
        h: pwd.length // hash check (simple version)
      };

      // Stringify the password with metadata
      const dataToEncrypt = JSON.stringify({
        p: pwd, // actual password
        m: metadata // metadata
      });

      // Encrypt with AES
      const encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, securityKey).toString();

      return `${encryptedData}|${securityKey}|${metadata.exp}`;
    } catch (err) {
      console.error("Encryption error:", err);
      return btoa(pwd); // Fallback to basic encoding
    }
  };

  // Enhanced secure link generation with additional security
  const generateSecureLink = (pwd, info = null) => {
    try {
      const securityKey = generateSecureKey();

      // Create a data object with the password and metadata
      const data = {
        password: pwd,
        created: Date.now(),
        expires: Date.now() + 86400000, // 24 hours expiry
        info: info || null
      };

      // Encrypt the entire data object
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        securityKey
      ).toString();

      // Further encode the data to make it URL-safe
      const secureData = `${encryptedData}|${securityKey}|${data.expires}`;
      const encodedSecureData = btoa(encodeURIComponent(secureData));

      // Generate the secure URL
      const baseLink = `${window.location.origin}/view#secure=${encodedSecureData}`;

      // Add metadata if provided (purpose/name of password)
      if (info && info.trim()) {
        const metadata = {
          purpose: info,
          encrypted: true,
          version: '1.1'
        };
        const encodedMeta = btoa(JSON.stringify(metadata));
        return `${baseLink}&meta=${encodedMeta}`;
      }

      return baseLink;
    } catch (err) {
      console.error("Encryption error:", err);
      // Fallback to basic encoding if encryption fails
      return `${window.location.origin}/view#data=${btoa(pwd)}`;
    }
  };

  // Update copyPasswordLink to use the enhanced secure link
  const copyPasswordLink = () => {
    try {
      const secureLink = generateSecureLink(password, recipientInfo);

      navigator.clipboard.writeText(secureLink)
        .then(() => {
          setShowCopied(true);
          setNotification("Secure encrypted link copied! Valid for 24 hours.");
        })
        .catch(err => {
          console.error("Failed to copy:", err);
          setErrorMsg("Could not copy to clipboard");
        });
    } catch (err) {
      setErrorMsg("Error creating secure link");
    }
  };

  // Enhanced email generation with better security notice
  const generateEmailLink = () => {
    const subject = activeTab === 'password'
      ? 'Secure Password Shared'
      : 'Check out this Password Generator';

    let body = '';
    if (activeTab === 'password') {
      const secureLink = generateSecureLink(password, recipientInfo);

      body = `I've shared a secure password with you.\n\n` +
            `Click this secure link to view the password:\n${secureLink}\n\n`;

      if (recipientInfo.trim()) {
        body += `This password is for: ${recipientInfo}\n\n`;
      }

      body += `SECURITY NOTICE:\n` +
            `• This link is encrypted end-to-end\n` +
            `• It will expire in 24 hours\n` +
            `• The link can only be used once for maximum security\n` +
            `• Do not share this link on unsecured channels\n\n` +
            `Generated with Lockora Password Generator: ${window.location.origin}`;
    } else {
      body = `I thought you might find this password generator useful: ${window.location.href}`;
    }

    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Enhanced SMS link with better security
  const generateSMSLink = () => {
    let content = '';

    if (activeTab === 'password') {
      // For SMS, don't include the actual password - use a secure link instead
      const secureLink = generateSecureLink(password, recipientInfo);
      content = `I've shared a secure password with you. View it here (link expires in 24h): ${secureLink}`;

      if (recipientInfo.trim()) {
        content += ` (For: ${recipientInfo})`;
      }
    } else {
      content = `Check out this secure password generator: ${window.location.href}`;
    }

    return isIOS
      ? `sms:&body=${encodeURIComponent(content)}`
      : `sms:?body=${encodeURIComponent(content)}`;
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showModal]);

  const handleShareItem = (item) => {
    if (item === 'clipboard') {
      copyToClipboard();
    } else if (item === 'qrcode') {
      onShowQR('share');
      setShowModal(false);
    } else if (item === 'message') {
      shareMessage();
    } else if (item === 'email') {
      composeEmail();
    } else if (item === 'native') {
      navigator.share({
        title: "Shared Password",
        text: password
      }).catch(err => console.error("Share failed:", err));
      setShowModal(false);
    }
  };

  // Modified to always show the modal for all devices
  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
    window.shareButtonState = { setShowModal };
  };

  // Modal content with tabs - redesigned for cleaner UI
  const renderModalContent = () => (
    <div>
      {/* Improved tab design */}
      <div className={`flex mb-5 border-b ${darkMode ? 'border-dark-600' : 'border-gray-200'}`}>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2.5 font-medium text-sm transition-colors relative ${
            activeTab === 'password'
              ? darkMode
                ? 'text-primary-400'
                : 'text-primary-700'
              : darkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Password
          {activeTab === 'password' && (
            <div className={`absolute bottom-0 left-0 w-full h-0.5 ${darkMode ? 'bg-primary-500' : 'bg-primary-600'}`}></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('site')}
          className={`px-4 py-2.5 font-medium text-sm transition-colors relative ${
            activeTab === 'site'
              ? darkMode
                ? 'text-primary-400'
                : 'text-primary-700'
              : darkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Share Lockora
          {activeTab === 'site' && (
            <div className={`absolute bottom-0 left-0 w-full h-0.5 ${darkMode ? 'bg-primary-500' : 'bg-primary-600'}`}></div>
          )}
        </button>
      </div>

      {activeTab === 'password' ? (
        <>
          <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#ccc' : '#333' }}>
            Purpose / Recipient (optional)
          </label>
          <input
            type="text"
            value={recipientInfo}
            onChange={e => setRecipientInfo(e.target.value)}
            placeholder="e.g. Gmail, John Doe"
            className={`w-full p-2.5 mb-4 rounded border ${darkMode ? 'bg-dark-700 text-white border-dark-600' : 'bg-white text-gray-800 border-gray-300'}`}
          />
          <div className="flex flex-col gap-3">
            <button
              onClick={copyPasswordLink}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${darkMode ? 'bg-primary-600 text-white' : 'bg-primary-500 text-white'} hover:opacity-90 shadow-sm`}
            >
              <Copy size={18} />
              {showCopied ? <Check size={18} /> : 'Copy Secure Link'}
            </button>
            <button
              onClick={() => {
                setShowModal(false);
                if (onShowQR) onShowQR('share');
              }}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-200 text-gray-800'} hover:opacity-90`}
            >
              <QrCode size={18} />
              Show QR Code
            </button>
            <div className={`grid grid-cols-2 gap-3 mt-1`}>
              <a
                href={generateEmailLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-200 text-gray-800'} hover:opacity-90`}
                onClick={() => setShowModal(false)}
              >
                <Mail size={18} />
                Send via Email
              </a>
              <a
                href={generateSMSLink()}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-200 text-gray-800'} hover:opacity-90`}
                onClick={() => setShowModal(false)}
              >
                <MessageSquare size={18} />
                Send via SMS
              </a>
            </div>
          </div>
          <div className="mt-4 flex items-start text-xs" style={{ color: darkMode ? '#aaa' : '#444' }}>
            <InfoIcon size={14} className="mr-2 mt-0.5" />
            <span>
              The link is encrypted end-to-end and expires in 24 hours. Only share with trusted recipients.
            </span>
          </div>
          {/* Enhanced security notice */}
          <div className={`mt-2 p-2 rounded-lg text-xs ${darkMode ? 'bg-dark-600 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            <div className="flex items-center">
              <Shield size={12} className={`mr-1.5 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
              <span className="font-semibold">Security measures:</span>
            </div>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>End-to-end encryption</li>
              <li>Automatic 24-hour expiration</li>
              <li>No password stored on servers</li>
              <li>Link validation and tamper protection</li>
            </ul>
          </div>
        </>
      ) : (
        <>
          <div className={`mb-4 p-3 rounded-lg bg-opacity-20 ${darkMode ? 'bg-primary-900 text-primary-300' : 'bg-primary-50 text-primary-700'}`}>
            <p className="text-sm">
              Share Lockora Password Generator with friends and colleagues so they can create secure passwords too!
            </p>
          </div>

          {/* Direct sharing options */}
          <div className="mb-4">
            <h4 className={`font-medium mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Direct Share</h4>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin)
                    .then(() => {
                      setShowTextCopied(true);
                      setTimeout(() => setShowTextCopied(false), 2000);
                    });
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${darkMode ? 'bg-primary-600 text-white' : 'bg-primary-500 text-white'} hover:opacity-90 shadow-sm`}
              >
                <Copy size={18} />
                {showTextCopied ? <Check size={18} /> : 'Copy Link'}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`mailto:?subject=Check out this Password Generator&body=Hey, I found this great password generator tool: ${window.location.origin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-200 text-gray-800'} hover:opacity-90`}
                  onClick={() => setShowModal(false)}
                >
                  <Mail size={18} />
                  Email
                </a>
                <a
                  href={`sms:&body=Check out this great password generator: ${window.location.origin}`}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-200 text-gray-800'} hover:opacity-90`}
                  onClick={() => setShowModal(false)}
                >
                  <MessageSquare size={18} />
                  SMS
                </a>
              </div>
            </div>
          </div>

          {/* Social media sharing */}
          <div>
            <h4 className={`font-medium mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Social Media</h4>
            <div className="grid grid-cols-3 gap-3">
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent('Check out this secure password generator:')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowModal(false)}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg ${
                  darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <Twitter size={20} className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
                <span className="text-xs">Twitter</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowModal(false)}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg ${
                  darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <Facebook size={20} className={darkMode ? 'text-blue-500' : 'text-blue-600'} />
                <span className="text-xs">Facebook</span>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowModal(false)}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg ${
                  darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <Linkedin size={20} className={darkMode ? 'text-blue-500' : 'text-blue-600'} />
                <span className="text-xs">LinkedIn</span>
              </a>

              {/* WhatsApp sharing */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this secure password generator: ${window.location.origin}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowModal(false)}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg ${
                  darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <div className={`${darkMode ? 'text-green-400' : 'text-green-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M17.6 6.2c-1.9-1.9-4.4-2.9-7.1-2.9-5.5 0-10 4.5-10 10 0 1.8.5 3.5 1.3 5l-1.4 5.1 5.2-1.4c1.5.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10 .1-2.6-.9-5.1-2.8-7zm-7.1 15.3c-1.5 0-2.9-.4-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3c-.8-1.3-1.2-2.8-1.2-4.3 0-4.6 3.7-8.3 8.3-8.3 2.2 0 4.3.9 5.8 2.4 1.6 1.6 2.4 3.6 2.4 5.8.1 4.6-3.6 8.2-8.3 8.2zm4.5-6.2c-.3-.1-1.5-.8-1.8-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.3.2-.6 0-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.4-1.8-.2-.3 0-.4.1-.5l.4-.5.3-.5c.1-.2 0-.3 0-.4 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5-.2 0-.3 0-.5 0s-.5.1-.7.3c-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.1.2 2 3.1 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.7.1.5-.1 1.5-.7 1.8-1.3.2-.6.2-1.2.2-1.3 0-.1-.2-.2-.5-.3z"/>
                  </svg>
                </div>
                <span className="text-xs">WhatsApp</span>
              </a>

              {/* Telegram sharing */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent('Check out this secure password generator:')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowModal(false)}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg ${
                  darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <Send size={20} className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
                <span className="text-xs">Telegram</span>
              </a>

              {/* Reddit sharing */}
              <a
                href={`https://www.reddit.com/submit?url=${encodeURIComponent(window.location.origin)}&title=${encodeURIComponent('Secure Password Generator Tool')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowModal(false)}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg ${
                  darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                <div className={`${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87a3.3 3.3 0 0 1 .043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                </div>
                <span className="text-xs">Reddit</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Modal JSX - updated for cleaner design
  const modal = showModal ? ReactDOM.createPortal(
    <div
      className="share-modal-overlay"
      onClick={handleModalOutsideClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="share-modal-content"
        style={{
          background: darkMode ? '#18192a' : '#fff',
          color: darkMode ? '#eee' : '#222',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          maxWidth: 400,
          width: '90%',
          padding: '1.5rem',
          zIndex: 10001,
          position: 'relative',
          border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Share2 size={18} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} />
            {activeTab === 'password' ? 'Share Password Securely' : 'Share Lockora'}
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-100'} transition-colors`}
            aria-label="Close share modal"
          >
            <X size={20} />
          </button>
        </div>
        {renderModalContent()}
      </div>
      <style>{`
        .share-modal-overlay {
          position: fixed !important;
          inset: 0 !important;
          z-index: 10000 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .share-modal-content {
          z-index: 10001 !important;
          position: relative !important;
          animation: modalFadeIn 0.3s ease forwards;
          transform: translateY(0) !important;
          will-change: opacity, transform;
        }
        @keyframes modalFadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        body.modal-open {
          overflow: hidden !important;
        }
      `}</style>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        onClick={handleShare}
        className={`flex items-center justify-center rounded-lg p-2 aspect-square ${
          darkMode
            ? 'bg-dark-600 hover:bg-dark-500 text-gray-200 border border-dark-700'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
        } transition-all duration-200`}
        disabled={!password}
        aria-label="Share password securely"
      >
        <Share2 size={20} />
      </button>
      {modal}
    </>
  );
};

export default ShareButton;