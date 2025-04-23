import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Share2, Copy, Check, QrCode, Download, Link, ShieldCheck, Smartphone, ExternalLink, X, Mail, MessageSquare, Send, FileText, ArrowLeft, RefreshCw } from 'lucide-react';
import { generateSecureToken } from '../utils/securityUtils';

const ShareButton = ({ password, darkMode, onShowQR, className }) => {
  const [showModal, setShowModal] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [canShare, setCanShare] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [secureLink, setSecureLink] = useState('');
  const [isCreatingSecureLink, setIsCreatingSecureLink] = useState(false);
  const [secureTokenCreated, setSecureTokenCreated] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [inSecureLinkMode, setInSecureLinkMode] = useState(false);
  
  // Add state to window to allow communication with other components
  useEffect(() => {
    if (window) {
      window.showShareModal = () => setShowModal(true);
    }
  }, []);

  // Check device type and Web Share API availability
  useEffect(() => {
    const checkDeviceAndShareAPI = () => {
      // Check if device is mobile
      const mobile = window.matchMedia('(max-width: 768px)').matches || 
                    window.matchMedia('(pointer: coarse)').matches ||
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      
      // Check if Web Share API is available
      setCanShare(!!navigator.share);
    };
    
    checkDeviceAndShareAPI();
    window.addEventListener('resize', checkDeviceAndShareAPI);
    
    return () => window.removeEventListener('resize', checkDeviceAndShareAPI);
  }, []);

  // For debugging - log when modal visibility changes
  useEffect(() => {
    console.log("Modal visibility:", showModal);
  }, [showModal]);

  // Helper to reset modal state
  const resetModalState = () => {
    // Only reset the UI state, not the password itself
    setEncryptionKey('');
    setSecureLink('');
    setSecureTokenCreated(false);
    setIsCreatingSecureLink(false);
    setCopiedText('');
    setInSecureLinkMode(false);
  };

  const handleShare = () => {
    if (!password || password.trim() === '') {
      // Show error notification
      const notification = document.createElement('div');
      notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white bg-red-500 shadow-lg z-[9999] animate-fadeIn`;
      notification.textContent = 'No password to share! Please generate one first.';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('animate-fadeOut');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 3000);
      
      return;
    }
    
    resetModalState();
    setShowModal(true);
    console.log("Showing share modal directly");
  };

  // Also reset modal state when closing
  const handleCloseModal = () => {
    setShowModal(false);
    
    // Only reset secure link state, NOT the password
    setSecureLink('');
    setSecureTokenCreated(false);
    setIsCreatingSecureLink(false);
    setCopiedText('');
    setInSecureLinkMode(false);
    // Don't reset other states that could affect the password
  };

  // Encrypt password for sharing
  const encryptPasswordForSharing = (pwd) => {
    try {
      // Generate a stronger key with better entropy
      const key = generateSecureToken(32); // Increased from 16 to 32
      
      // Use window.CryptoJS if available with stronger parameters
      if (window.CryptoJS && window.CryptoJS.AES) {
        // Use a salt and stronger iteration count
        const salt = window.CryptoJS.lib.WordArray.random(128/8);
        const iterations = 1000;
        
        // Derive a stronger key using PBKDF2
        const derivedKey = window.CryptoJS.PBKDF2(key, salt, {
          keySize: 256/32,
          iterations: iterations
        });
        
        // Encrypt with AES using derived key
        const encrypted = window.CryptoJS.AES.encrypt(pwd, derivedKey.toString(), {
          iv: window.CryptoJS.lib.WordArray.random(128/8)
        }).toString();
        
        // Return both the encrypted content and the original key (for user distribution)
        return {
          encryptedText: encrypted,
          key,
          salt: salt.toString(),
          iterations,
          encrypted: true
        };
      } else {
        // Simple fallback encryption with warning
        console.warn("CryptoJS not available - using basic encryption");
        const simpleEncrypted = btoa(encodeURIComponent(pwd));
        return { 
          encryptedText: simpleEncrypted,
          key,
          encrypted: false,
          warning: 'Using basic encryption - less secure'
        };
      }
    } catch (error) {
      console.error("Encryption error:", error);
      return {
        encryptedText: pwd,
        key: 'none',
        encrypted: false,
        warning: 'Encryption failed - sharing unencrypted'
      };
    }
  };

  const handleCopy = async (text, type) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      setCopiedText(type);
      setTimeout(() => setCopiedText(''), 2000);
    }
  };

  const generateSimpleToken = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomValues[i] % chars.length);
    }
    return result;
  };

  const createSecureLink = async () => {
    if (!password || password.trim() === '') {
      // Show error notification
      const notification = document.createElement('div');
      notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white bg-red-500 shadow-lg z-[9999] animate-fadeIn`;
      notification.textContent = 'Cannot create link: No password available.';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('animate-fadeOut');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 3000);
      
      return;
    }
    
    setIsCreatingSecureLink(true);
    try {
      // Generate a more secure token and expiration
      const key = generateSecureToken(32); // Longer key
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 24); // 24 hour expiration
      
      // Use stronger encryption
      let encodedPassword = password;
      
      if (window.CryptoJS && window.CryptoJS.AES) {
        const iv = window.CryptoJS.lib.WordArray.random(16);
        const encrypted = window.CryptoJS.AES.encrypt(password, key, { iv: iv });
        encodedPassword = encrypted.toString();
      } else {
        // Fallback with warning
        encodedPassword = btoa(encodeURIComponent(password));
        console.warn("Using basic encryption for secure link - CryptoJS not available");
      }
      
      // Add expiration data and a random ID to the payload
      const payload = {
        data: encodedPassword,
        exp: expirationTime.getTime(),
        id: generateSecureToken(8),
        v: 1 // version for future compatibility
      };
      
      // Encode the full payload
      const payloadStr = JSON.stringify(payload);
      const encodedPayload = btoa(encodeURIComponent(payloadStr));
      
      // Create link with the payload
      const link = `${window.location.origin}/view#data=${encodedPayload}`;
      
      setEncryptionKey(key);
      setSecureLink(link);
      setSecureTokenCreated(true);
      setInSecureLinkMode(true);
      
    } catch (error) {
      console.error("Error creating secure link:", error);
      // Show error notification
    } finally {
      setIsCreatingSecureLink(false);
    }
  };

  const handleDirectCopy = () => {
    handleCopy(password, 'copy_direct');
  };

  // Fix the email sharing function
  const handleEmailShare = () => {
    if (!confirmSecurityWarning('email')) return;
    
    try {
      // Simplify: Just create the encoded content once
      const subject = encodeURIComponent("Your Password");
      const body = encodeURIComponent(generateShareContent(password));
      
      // Direct method: Use window.location.href for the most reliable behavior
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      
      // No need for complex anchor element approach that may get blocked
      console.log("Email client triggered");
      
      // Optional: Show a smaller notification that we're trying to open email
      const notification = document.createElement('div');
      notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white ${
        darkMode ? 'bg-success-600' : 'bg-success-500'
      } shadow-lg z-50 animate-fadeIn`;
      notification.textContent = 'Opening email client...';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 2000);
      
      // Only close the modal, don't reset anything else
      setShowModal(false);
    } catch (error) {
      console.error("Email sharing error:", error);
      
      // Simple alert as last resort
      alert("Could not open email client. Please try another sharing method.");
    }
  };

  // Fix SMS sharing to use window.location.href 
  const handleSMSShare = () => {
    if (!confirmSecurityWarning('sms')) return;
    
    try {
      const body = encodeURIComponent(generateShareContent(password));
      window.location.href = `sms:?&body=${body}`;
      // Only close modal, don't reset password
      setShowModal(false);
    } catch (error) {
      console.error("SMS sharing error:", error);
    }
  };
  
  // Fix WhatsApp sharing to use window.location.href or open in new tab
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareContent(password));
    // For WhatsApp, open in new tab as it's typically a web service
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
    // Close modal for consistency
    setShowModal(false);
  };

  // Update the website sharing functionality to be more visible and reliable
  const handleWebsiteShare = () => {
    try {
      // First copy the password to clipboard
      navigator.clipboard.writeText(password)
        .then(() => {
          // Show copy feedback
          setCopiedText('website');
          setTimeout(() => setCopiedText(''), 2000);
          
          // Then open the website in a new tab
          window.open('https://lockora.com/share', '_blank', 'noopener,noreferrer');
          
          // Show notification
          const notification = document.createElement('div');
          notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white ${
            darkMode ? 'bg-success-600' : 'bg-success-500'
          } shadow-lg z-50 animate-fadeIn`;
          notification.textContent = 'Password copied! Opening website...';
          document.body.appendChild(notification);
          
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 2000);
        })
        .catch(err => {
          console.error("Error copying password:", err);
          // Still open the website even if copy fails
          window.open('https://lockora.com/share', '_blank', 'noopener,noreferrer');
        });
    } catch (error) {
      console.error("Error sharing via website:", error);
    }
  };

  // Generate text file for download - simplified without encryption
  const handleTextFileDownload = () => {
    if (!confirmSecurityWarning('text')) return;
    
    const fileContent = `YOUR PASSWORD:
${password}

Generated with Lockora Password Generator`;
    
    const element = document.createElement('a');
    const file = new Blob([fileContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'password.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Enhanced native sharing with better cross-platform support
  const handleNativeShare = async () => {
    if (!password) return;
    
    try {
      // Enhanced detection for Web Share API
      if (!navigator.share) {
        console.log("Web Share API not supported, showing modal instead");
        setShowModal(true);
        return;
      }

      // Prepare share data - simple format for maximum compatibility
      const shareData = {
        title: 'Secure Password',
        text: `Here's a secure password: ${password}`,
      };

      // Add URL for better Safari compatibility
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (isSafari && window.location.origin) {
        shareData.url = window.location.origin;
      }

      // Execute share with improved error handling
      try {
        await navigator.share(shareData);
        console.log("Shared successfully");
        
        // Show feedback to user
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white ${
          darkMode ? 'bg-success-600' : 'bg-success-500'
        } shadow-lg z-50 animate-fadeIn`;
        notification.textContent = '✓ Shared successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 2000);
      } catch (err) {
        // User probably canceled share or platform had issues
        if (err.name !== 'AbortError') {
          console.error("Share failed:", err);
          setShowModal(true); // Fall back to modal
        }
      }
    } catch (error) {
      console.error("Share error:", error);
      setShowModal(true); // Fall back to modal
    }
  };

  // New function to navigate to the shared URL
  const handleNavigateToLink = () => {
    if (secureLink) {
      window.open(secureLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Update the generateShareContent function to create a simpler format
  const generateShareContent = (password) => {
    return `Your Password:
${password}

Generated with Lockora`;
  };

  // Add functions for social media sharing
  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Check out this password generator: ${window.location.origin}\n\nGenerated with Lockora`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
    // Only close modal, don't reset password
    setShowModal(false);
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`, '_blank', 'noopener,noreferrer');
    // Only close modal, don't reset password
    setShowModal(false);
  };

  const handleLinkedInShare = () => {
    const title = encodeURIComponent("Lockora Password Generator");
    const summary = encodeURIComponent("Generate secure passwords with Lockora");
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.origin)}&title=${title}&summary=${summary}`, '_blank', 'noopener,noreferrer');
    // Only close modal, don't reset password
    setShowModal(false);
  };

  const handleRedditShare = () => {
    window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(window.location.origin)}&title=${encodeURIComponent("Lockora Password Generator")}`, '_blank', 'noopener,noreferrer');
    // Only close modal, don't reset password
    setShowModal(false);
  };

  // Add more social media sharing handlers
  const handleInstagramShare = () => {
    // Instagram doesn't have a direct web sharing API
    // Copy the URL to clipboard and show instructions
    navigator.clipboard.writeText(window.location.origin)
      .then(() => {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white ${
          darkMode ? 'bg-success-600' : 'bg-success-500'
        } shadow-lg z-50 animate-fadeIn`;
        notification.textContent = 'URL copied! Open Instagram and paste in your story or DM';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      });
    setShowModal(false);
  };

  const handlePinterestShare = () => {
    const url = encodeURIComponent(window.location.origin);
    const description = encodeURIComponent("Generate secure passwords with Lockora");
    const media = encodeURIComponent(`${window.location.origin}/logo.png`); // Assuming there's a logo image
    window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank', 'noopener,noreferrer');
    setShowModal(false);
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(`Check out this password generator: ${window.location.origin}\n\nGenerated with Lockora`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${text}`, '_blank', 'noopener,noreferrer');
    setShowModal(false);
  };

  const handleTumblrShare = () => {
    const url = encodeURIComponent(window.location.origin);
    const title = encodeURIComponent("Lockora Password Generator");
    const caption = encodeURIComponent("Generate secure passwords easily!");
    window.open(`https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&title=${title}&caption=${caption}`, '_blank', 'noopener,noreferrer');
    setShowModal(false);
  };

  // Add a security warning component for insecure sharing methods
  /* 
  const SecurityWarning = ({ method, darkMode }) => (
    // Component definition remains but won't be used
  ); 
  */

  // Add confirmation for insecure sharing methods
  const confirmSecurityWarning = (method) => {
    const methods = {
      email: "Email is not encrypted end-to-end and could be intercepted.",
      sms: "SMS messages are not encrypted and could be intercepted.",
      clipboard: "Clipboard contents may be accessible to other applications.",
      text: "Text files are stored unencrypted on your device."
    };
    
    const message = `Security Warning: ${methods[method] || "This sharing method may not be secure."}\n\nContinue anyway?`;
    
    // Only warn in production, not development
    if (process.env.NODE_ENV === 'production') {
      return window.confirm(message);
    }
    
    return true; // Skip confirmation in development
  };

  // --- Portal-based modal rendering ---
  const renderShareOptions = () => {
    if (!showModal) return null;

    const modalContent = (
      <div 
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 share-modal-backdrop overflow-hidden"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(5px)',
          willChange: 'opacity',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleCloseModal();
        }}
      >
        {/* Secure link generation content when in secure mode */}
        {inSecureLinkMode ? (
          <div 
            className={`w-full max-w-md rounded-xl shadow-2xl p-6 ${
              darkMode ? 'bg-dark-800' : 'bg-white'
            } animate-slideIn max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className={`flex justify-between items-center mb-4 sticky top-0 z-50 
              ${darkMode ? 'bg-dark-800/95' : 'bg-white/95'} backdrop-blur-md shadow-sm -mx-6 px-6 py-4 border-b border-gray-700`}
            >
              <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <ShieldCheck size={20} className="mr-2 text-primary-500" />
                Secure Password Link
              </h3>
              <button
                onClick={handleCloseModal}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-200'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-dark-700' : 'bg-blue-50'
            } text-sm mb-4`}>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                Your secure password link and decryption key are ready. Share them separately for better security.
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Link section */}
              <div>
                <label className={`block text-sm mb-1 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Secure Password Link:
                </label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={secureLink}
                    className={`w-full p-2 rounded-l-lg font-mono text-sm ${
                      darkMode ? 'bg-dark-900 text-gray-200 border-dark-600' : 'bg-gray-50 text-gray-800 border-gray-300'
                    } border focus:outline-none`}
                  />
                  <div className="flex">
                    <button
                      onClick={() => handleCopy(secureLink, 'copy_link')}
                      className={`px-3 rounded-none border-r ${
                        darkMode
                          ? copiedText === 'copy_link' ? 'bg-green-600 text-white' : 'bg-dark-600 text-gray-300 hover:bg-dark-500 border-dark-700'
                          : copiedText === 'copy_link' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300'
                      }`}
                      aria-label="Copy secure link"
                      title="Copy link"
                    >
                      {copiedText === 'copy_link' ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                    
                    {/* New "Take Me There" button */}
                    <button
                      onClick={handleNavigateToLink}
                      className={`px-3 rounded-r-lg flex items-center ${
                        darkMode
                          ? 'bg-primary-600 hover:bg-primary-500 text-white'
                          : 'bg-primary-500 hover:bg-primary-400 text-white'
                      }`}
                      aria-label="Open secure link"
                      title="Take me there"
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Key section */}
              <div>
                <label className={`block text-sm mb-1 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Decryption Key:
                </label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={encryptionKey}
                    className={`w-full p-2 rounded-l-lg font-mono text-sm ${
                      darkMode ? 'bg-dark-900 text-gray-200 border-dark-600' : 'bg-gray-50 text-gray-800 border-gray-300'
                    } border focus:outline-none`}
                  />
                  <button
                    onClick={() => handleCopy(encryptionKey, 'copy_key')}
                    className={`px-3 rounded-r-lg ${
                      darkMode
                        ? copiedText === 'copy_key' ? 'bg-green-600 text-white' : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
                        : copiedText === 'copy_key' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {copiedText === 'copy_key' ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col space-y-2 pt-2">
                <button
                  onClick={() => {
                    // Clear secure link mode and go back to share options
                    setInSecureLinkMode(false);
                  }}
                  className={`w-full py-2 px-3 rounded-lg flex items-center justify-center ${
                    darkMode
                      ? 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Back to Share Options
                </button>
                
                <button
                  onClick={() => {
                    // Create a new secure link (replacing the current one)
                    createSecureLink();
                  }}
                  className={`w-full py-2 px-3 rounded-lg flex items-center justify-center ${
                    darkMode
                      ? 'bg-primary-600 hover:bg-primary-500 text-white'
                      : 'bg-primary-500 hover:bg-primary-400 text-white'
                  }`}
                  disabled={isCreatingSecureLink}
                >
                  {isCreatingSecureLink ? (
                    <RefreshCw size={18} className="animate-spin mr-2" />
                  ) : (
                    <ShieldCheck size={18} className="mr-2" />
                  )}
                  {isCreatingSecureLink ? 'Creating...' : 'Create Another Secure Link'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Normal share options when not in secure link mode
          <div 
            className={`w-full max-w-md rounded-xl shadow-2xl p-6 ${
              darkMode ? 'bg-dark-800' : 'bg-white'
            } animate-slideIn max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enhanced header with better z-index and transparency */}
            <div 
              className={`flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 z-50 
              ${darkMode ? 'bg-dark-800/95' : 'bg-white/95'} backdrop-blur-md shadow-sm -mx-6 px-6 mb-2`}
            >
              <h3 className="text-xl font-semibold flex items-center">
                <Share2 size={22} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
                Share Password
              </h3>
              
              <button 
                onClick={handleCloseModal}
                className={`p-2 rounded-full ${
                  darkMode ? 'hover:bg-dark-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500`}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5">
              {/* Password display with styling improvements */}
              <div className={`mb-6 p-4 rounded-lg relative z-10 ${
                darkMode 
                  ? 'bg-dark-700/60 border border-dark-600' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                
                <div className="flex rounded-lg overflow-hidden shadow-sm">
                  <input
                    type="text"
                    readOnly
                    value={password}
                    className={`flex-1 p-3 font-mono text-sm ${
                      darkMode 
                        ? 'bg-dark-600 text-white border-r border-dark-500' 
                        : 'bg-white text-gray-800 border-r border-gray-300'
                    } focus:outline-none`}
                  />
                  <button
                    onClick={() => handleCopy(password, 'password')}
                    className={`px-4 flex items-center justify-center ${
                      darkMode 
                        ? copiedText === 'password' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                        : copiedText === 'password'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                    } transition-colors`}
                    title="Copy password"
                  >
                    {copiedText === 'password' ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Improved share options grid with mobile-friendly layout */}
              <div className="mb-6">
                <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Share Options
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      onShowQR('share');
                      setShowModal(false);
                    }}
                    className={`py-3 px-3 rounded-lg flex flex-col items-center justify-center ${
                      darkMode
                        ? 'bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
                    } transition-all h-24`}
                  >
                    <QrCode size={24} className="mb-2" />
                    <span className="text-sm font-medium">QR Code</span>
                  </button>
                  
                  {/* Email share option */}
                  <button
                    onClick={handleEmailShare}
                    className={`py-3 px-3 rounded-lg flex flex-col items-center justify-center ${
                      darkMode
                        ? 'bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
                    } transition-all h-24`}
                  >
                    <Mail size={24} className="mb-2" />
                    <span className="text-sm font-medium">Email</span>
                  </button>
                  
                  {/* SMS share option */}
                  <button
                    onClick={handleSMSShare}
                    className={`py-3 px-3 rounded-lg flex flex-col items-center justify-center ${
                      darkMode
                        ? 'bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
                    } transition-all h-24`}
                  >
                    <MessageSquare size={24} className="mb-2" />
                    <span className="text-sm font-medium">SMS</span>
                  </button>
                  
                  {/* WhatsApp share option */}
                  <button
                    onClick={handleWhatsAppShare}
                    className={`py-3 px-3 rounded-lg flex flex-col items-center justify-center ${
                      darkMode
                        ? 'bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
                    } transition-all h-24`}
                  >
                    <Send size={24} className="mb-2" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </button>
                  
                  {/* Text file download option */}
                  <button
                    onClick={handleTextFileDownload}
                    className={`py-3 px-3 rounded-lg flex flex-col items-center justify-center ${
                      darkMode
                        ? 'bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
                    } transition-all h-24`}
                  >
                    <FileText size={24} className="mb-2" />
                    <span className="text-sm font-medium">Text File</span>
                  </button>
                  
                  {/* Native Web Share API option (only shown if available) */}
                  {canShare && (
                    <button
                      onClick={handleNativeShare}
                      className={`py-3 px-3 rounded-lg flex flex-col items-center justify-center ${
                        darkMode
                          ? 'bg-gradient-to-b from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white border border-primary-700/50'
                          : 'bg-gradient-to-b from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white border border-primary-600/50'
                      } transition-all h-24 shadow-md hover:shadow-lg active:scale-95`}
                      aria-label="Share with system apps"
                    >
                      <Smartphone size={24} className="mb-2" />
                      <span className="text-sm font-medium">All Apps</span>
                    </button>
                  )}

                  {/* Replace single Website button with Social Media section */}
                  <div className="col-span-2 sm:col-span-3 mt-4 border-t pt-4 border-gray-700">
                    <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Share on Social Media
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleTwitterShare}
                        className={`py-2 px-2 rounded-lg flex flex-col items-center justify-center ${
                          darkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-800'
                            : 'bg-blue-500 hover:bg-blue-600 text-white border border-blue-600'
                        } transition-all h-16`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mb-1">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                        <span className="text-xs font-medium">Twitter/X</span>
                      </button>
                      
                      <button
                        onClick={handleFacebookShare}
                        className={`py-2 px-2 rounded-lg flex flex-col items-center justify-center ${
                          darkMode
                            ? 'bg-blue-800 hover:bg-blue-900 text-white border border-blue-900'
                            : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-800'
                        } transition-all h-16`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mb-1">
                          <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                        </svg>
                        <span className="text-xs font-medium">Facebook</span>
                      </button>
                      
                      <button
                        onClick={handleLinkedInShare}
                        className={`py-2 px-2 rounded-lg flex flex-col items-center justify-center ${
                          darkMode
                            ? 'bg-blue-700 hover:bg-blue-800 text-white border border-blue-900'
                            : 'bg-blue-700 hover:bg-blue-800 text-white border border-blue-800'
                        } transition-all h-16`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mb-1">
                          <path d="M6.5 8.25H10V18H6.5V8.25ZM8.25 6.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM11 8.25h3.5V10h.25a3.5 3.5 0 0 1 3-1.5c3.25 0 4 1.75 4 4.75V18H18v-4.25c0-1.25-.25-2.75-2-2.75-1.5 0-2 1.5-2 2.25V18h-3V8.25Z"/>
                        </svg>
                        <span className="text-xs font-medium">LinkedIn</span>
                      </button>
                      
                      <button
                        onClick={handleRedditShare}
                        className={`py-2 px-2 rounded-lg flex flex-col items-center justify-center ${
                          darkMode
                            ? 'bg-orange-600 hover:bg-orange-700 text-white border border-orange-800'
                            : 'bg-orange-500 hover:bg-orange-600 text-white border border-orange-700'
                        } transition-all h-16`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mb-1">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-.98-13.73c-.273 0-.5.224-.5.5s.227.5.5.5c.273 0 .5-.224.5-.5s-.227-.5-.5-.5zm4.234 4.482c-.271-.02-.54.06-.75.23-.19.15-.32.38-.36.64-.22 1.52-1.86 2.69-3.94 2.69-2.08 0-3.72-1.17-3.94-2.7-.03-.24-.16-.5-.36-.64-.2-.17-.47-.25-.75-.23-.5.06-.87.51-.81 1.01.32 2.35 2.97 4.14 5.86 4.14s5.54-1.79 5.86-4.14c.06-.5-.31-.95-.81-1.01zm-7.477-1.984c.273 0 .5-.224.5-.5s-.227-.5-.5-.5c-.273 0-.5.224-.5.5s.227.5.5.5z"/>
                        </svg>
                        <span className="text-xs font-medium">Reddit</span>
                      </button>

                      {/* New Instagram button */}
                      <button
                        onClick={handleInstagramShare}
                        className={`py-2 px-2 rounded-lg flex flex-col items-center justify-center ${
                          darkMode
                            ? 'bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white border border-purple-800'
                            : 'bg-gradient-to-br from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white border border-purple-500'
                        } transition-all h-16`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mb-1">
                          <path d="M12 6.865A5.135 5.135 0 1 0 17.135 12 5.135 5.135 0 0 0 12 6.865Zm0 8.469A3.334 3.334 0 1 1 15.334 12 3.333 3.333 0 0 1 12 15.334Z"/>
                          <path d="M16.134 0H7.866A7.866 7.866 0 0 0 0 7.866v8.268A7.866 7.866 0 0 0 7.866 24h8.268A7.866 7.866 0 0 0 24 16.134V7.866A7.866 7.866 0 0 0 16.134 0ZM22 16.134A5.869 5.869 0 0 1 16.134 22H7.866A5.869 5.869 0 0 1 2 16.134V7.866A5.869 5.869 0 0 1 7.866 2h8.268A5.869 5.869 0 0 1 22 7.866Z"/>
                          <circle cx="18.5" cy="5.5" r="1.5"/>
                        </svg>
                        <span className="text-xs font-medium">Instagram</span>
                      </button>

                      {/* Pinterest button */}
                      <button
                        onClick={handlePinterestShare}
                        className={`py-2 px-2 rounded-lg flex flex-col items-center justify-center ${
                          darkMode
                            ? 'bg-red-700 hover:bg-red-800 text-white border border-red-900'
                            : 'bg-red-600 hover:bg-red-700 text-white border border-red-800'
                        } transition-all h-16`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mb-1">
                          <path d="M12 0a12 12 0 0 0-4.83 23c-.03-.78-.04-1.97.02-2.82.6.1 1.16.13 1.7.08l.97-.24c.59-.15 1.13-.47 1.6-.92.47-.45.81-1 .01-1.6l.16-.77c.07-.33.13-.65.17-.98.05.12.11.23.18.34.34.5.77.89 1.27 1.15.5.26 1.06.39 1.63.37.56-.02 1.11-.19 1.61-.47.5-.29.94-.68 1.29-1.15.36-.47.63-1.01.82-1.57.19-.57.28-1.16.28-1.76 0-1.25-.31-2.36-.93-3.35-.62-.98-1.52-1.75-2.7-2.31-1.18-.56-2.49-.84-3.95-.84-1.22 0-2.31.2-3.25.59-.95.39-1.76.94-2.43 1.65-.67.71-1.14 1.5-1.43 2.37-.28.87-.37 1.81-.26 2.82.06.55.23 1.04.51 1.47.28.43.57.69.89.8.22.07.43.02.61-.16.18-.18.31-.44.41-.78.01-.05.06-.21.14-.48.08-.27.13-.47.15-.58.08-.33.02-.61-.18-.83-.41-.45-.61-1.17-.61-2.18 0-.98.25-1.9.76-2.76.51-.86 1.24-1.55 2.2-2.08.96-.53 2.09-.79 3.38-.79.97 0 1.83.14 2.59.42.75.28 1.39.66 1.91 1.14.51.48.9 1.03 1.16 1.65.26.62.39 1.25.39 1.91 0 .86-.09 1.68-.28 2.46-.19.78-.46 1.47-.82 2.07-.36.6-.79 1.09-1.29 1.45-.5.36-1.05.58-1.66.64-.38.03-.78-.03-1.17-.19-.39-.16-.68-.42-.87-.77-.05-.1-.09-.2-.12-.31-.03-.11-.05-.23-.05-.35v-.27l.06-1.45c.03-.66.06-1.24.1-1.73l.14-1.42c.06-.62.09-1.02.09-1.19 0-.33-.07-.63-.22-.89-.15-.26-.35-.45-.62-.57-.27-.12-.55-.15-.86-.1-.3.05-.58.19-.82.4-.53.49-.82 1.12-.86 1.9-.02.32.01.63.08.94.07.31.15.53.24.68.09.15.13.22.13.22l-1.5 6.38c-.15.66-.24 1.36-.26 2.09-.03.73.02 1.39.12 1.97.04.12.06.24.11.35.04.11.09.21.15.3C4.36 22.48 2 17.58 2 12 2 6.48 6.48 2 12 2s10 4.48 10 10c0 5.52-4.48 10-10 10z"/>
                        </svg>
                        <span className="text-xs font-medium">Pinterest</span>
                      </button>

                      {/* Telegram button */}
                      <button
                        onClick={handleTelegramShare}
                        className={`py-2 px-2 rounded-lg flex flex-col items-center justify-center ${
                          darkMode
                            ? 'bg-blue-500 hover:bg-blue-600 text-white border border-blue-700'
                            : 'bg-blue-400 hover:bg-blue-500 text-white border border-blue-600'
                        } transition-all h-16`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mb-1">
                          <path d="M22.05 2.717c.971.405 1.443 1.617.792 3.241-.407 1.009-1.07 4.81-1.795 8.63-.725 3.82-1.483 7.67-1.775 8.641-.405 1.356-1.451 2.172-2.572 2.172-.971 0-1.737-.648-2.437-1.492-.646-.77-3.388-2.877-4.529-3.753-.45-.344-.725-.85-.725-1.374 0-.445.227-.891.673-1.293.446-.4 3.560-3.104 5.297-4.671.487-.446.203-1.133-.526-1.133a2.46 2.46 0 0 0-.97.242c-1.9 1.09-5.144 2.919-6.48 3.685-1.334.766-2.059.97-2.895.97-1.09 0-2.14-.526-2.842-1.09C.316 15.356.032 14.468.032 13.62c0-1.293.647-2.18 2.058-2.584 1.01-.285 5.255-1.697 9.175-3.036 3.921-1.34 7.842-2.72 8.893-3.097.162-.081.324-.162.567-.162.73-.04 1.294.081 1.335.08l-.01-.081v-.022Z"/>
                        </svg>
                        <span className="text-xs font-medium">Telegram</span>
                      </button>

                      {/* Tumblr button */}
                      <button
                        onClick={handleTumblrShare}
                        className={`py-2 px-2 rounded-lg flex flex-col items-center justify-center ${
                          darkMode
                            ? 'bg-indigo-800 hover:bg-indigo-900 text-white border border-indigo-900'
                            : 'bg-indigo-700 hover:bg-indigo-800 text-white border border-indigo-800'
                        } transition-all h-16`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mb-1">
                          <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.178l.011.002z"/>
                        </svg>
                        <span className="text-xs font-medium">Tumblr</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Secure sharing section - redesigned */}
              <div className={`mt-6 p-4 rounded-lg ${
                darkMode 
                  ? 'bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600' 
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100'
              }`}>
                <div className="flex items-center mb-3">
                  <ShieldCheck size={20} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
                  <h4 className={`text-base font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Secure end-to-end sharing
                  </h4>
                </div>
                
                {!secureTokenCreated ? (
                  <>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Your password is shared securely using end-to-end protection.
                    </p>
                    
                  </>
                ) : (
                  <div className={`rounded-lg`}>
                    <div className={`mb-3 ${
                      darkMode ? 'text-success-400' : 'text-success-600'
                    } text-sm font-medium flex items-center`}>
                      <Check size={16} className="mr-1.5" />
                      Secure Link Created
                    </div>
                    
                    <div className="flex rounded-lg overflow-hidden shadow-sm mb-3">
                      <input
                        type="text"
                        readOnly
                        value={secureLink}
                        className={`flex-1 p-3 text-xs ${
                          darkMode 
                            ? 'bg-dark-600 text-white border-r border-dark-500' 
                            : 'bg-white text-gray-800 border-r border-gray-300'
                        } focus:outline-none font-mono`}
                      />
                      <button
                        onClick={() => handleCopy(secureLink, 'secure-link')}
                        className={`px-4 flex items-center justify-center ${
                          darkMode 
                            ? copiedText === 'secure-link' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-dark-600 hover:bg-dark-500 text-gray-200'
                            : copiedText === 'secure-link'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                        } transition-colors`}
                        title="Copy secure link"
                      >
                        {copiedText === 'secure-link' ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    
                    <div className={`flex items-center p-2 rounded-md ${
                      darkMode ? 'bg-dark-600 text-amber-400' : 'bg-amber-50 text-amber-800'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs">This link expires in 24 hours and can only be viewed once.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
  };

  return (
    <>
      <button
        onClick={handleShare}
        className={className || `rounded-md p-2 ${darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-200'}`}
        title="Share Password"
        aria-label="Share Password"
      >
        <Share2 size={20} />
      </button>
      {renderShareOptions()}
      
      {/* Add this style element for better modal responsiveness */}
      <style jsx global>{`
        /* Fix modal for small screens */
        @media (max-height: 700px) {
          .share-modal-backdrop > div {
            max-height: 85vh !important;
            padding: 0.75rem !important;
          }
          .share-modal-backdrop h3 {
            font-size: 1rem !important;
          }
        }
        
        /* Ensure modal scrolls on tiny screens */
        @media (max-height: 500px) {
          .share-modal-backdrop > div {
            max-height: 95vh !important;
          }
        }
        
        /* Prevent body scrolling when modal is open */
        body:has(.share-modal-backdrop) {
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default ShareButton;