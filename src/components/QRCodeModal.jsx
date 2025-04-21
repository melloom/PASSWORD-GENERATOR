import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, QrCode, ArrowLeft, Copy, Check, Download } from 'lucide-react';
import QRCode from 'qrcode.react';

const QRCodeModal = ({ isOpen, onClose, password, darkMode, previousModal, onBackToShare }) => {
  const [qrSize, setQrSize] = useState(240);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const modalRef = useRef(null);
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 380) setQrSize(180);
      else if (width < 640) setQrSize(220);
      else setQrSize(260);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Robust copy handler for all browsers, always fallback on iOS
  const handleCopy = () => {
    setCopyError(false);
    setIsCopying(true);
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (navigator.clipboard && window.isSecureContext && !isiOS) {
      navigator.clipboard.writeText(password)
        .then(() => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
            setIsCopying(false);
          }, 1200);
        })
        .catch(() => {
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  };

  // Fallback copy using textarea
  const fallbackCopy = () => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = password;
      textarea.style.position = 'fixed';
      textarea.style.opacity = 0;
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setIsCopying(false);
        }, 1200);
      } else {
        setCopyError(true);
        setIsCopying(false);
      }
    } catch {
      setCopyError(true);
      setIsCopying(false);
    }
  };

  // Robust QR code download handler for all browsers
  const handleDownload = () => {
    setDownloadError(false);
    try {
      // Try to get the canvas from the QRCode component
      const canvas = qrCanvasRef.current?.querySelector('canvas');
      if (!canvas) throw new Error('No canvas found');
      const scale = 2;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = qrSize * scale;
      tempCanvas.height = qrSize * scale;
      const ctx = tempCanvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.drawImage(canvas, 0, 0);
      const pngUrl = tempCanvas.toDataURL('image/png');
      // Try to trigger download
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = 'password-qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setDownloadError(true);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-md rounded-2xl ${darkMode ? 'bg-dark-900 border border-dark-700' : 'bg-white border border-gray-100'} shadow-2xl animate-fadeIn outline-none`}
        onClick={e => e.stopPropagation()}
        tabIndex={0}
        style={{
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 8px',
          position: 'relative'
        }}
      >
        {/* Absolute X button - always visible, top right */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition"
          aria-label="Close"
          style={{
            color: '#222',
            zIndex: 1002,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            border: '1px solid #eee'
          }}
        >
          <X size={24} />
        </button>
        {/* Modal header: centered title and icon, always visible */}
        <div
          className={`flex items-center justify-center px-6 py-4 border-b sticky top-0 z-10 ${
            darkMode ? 'border-dark-700 bg-dark-900' : 'border-gray-100 bg-white'
          }`}
          style={{
            minHeight: 56,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 0.2,
          }}
        >
          <QrCode size={28} className={`mr-3 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
          <span
            className={`font-bold text-xl sm:text-2xl ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
            style={{ lineHeight: 1.2 }}
          >
            QR Code
          </span>
        </div>
        {/* QR Code container */}
        <div className="flex flex-col items-center justify-center px-6 py-6">
          <div className="mb-3 text-center text-base font-medium text-gray-500 dark:text-gray-400">
            Scan this QR code to get the password
          </div>
          <div
            ref={qrCanvasRef}
            className={`flex items-center justify-center rounded-xl shadow-lg mx-auto mb-6`}
            style={{
              width: qrSize + 32,
              height: qrSize + 32,
              background: darkMode ? '#23272f' : '#fff',
              border: darkMode ? '1.5px solid #333' : '1.5px solid #e5e7eb',
              padding: 16,
              boxSizing: 'content-box'
            }}
          >
            <QRCode
              id="qr-code"
              value={password}
              size={qrSize}
              level="M"
              bgColor={darkMode ? "#23272f" : "#fff"}
              fgColor={darkMode ? "#fff" : "#23272f"}
              includeMargin={false}
            />
          </div>
          {/* Password text below QR */}
          <div className="w-full">
            <div className={`p-3 rounded-lg text-center font-mono text-base tracking-tight break-all whitespace-pre-wrap mb-4 border ${darkMode ? 'bg-dark-800 text-gray-200 border-dark-700' : 'bg-gray-50 text-gray-800 border-gray-200'}`}>
              {password}
            </div>
            {/* Copy and download buttons */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleCopy}
                  disabled={isCopying}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                    darkMode
                      ? 'bg-dark-700 hover:bg-dark-600 text-gray-100'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {copied ? <Check size={16} className="mr-1.5" /> : <Copy size={16} className="mr-1.5" />}
                  {copied ? 'Copied!' : isCopying ? 'Copying...' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                    darkMode
                      ? 'bg-primary-600 hover:bg-primary-500 text-white'
                      : 'bg-primary-500 hover:bg-primary-400 text-white'
                  }`}
                >
                  <Download size={16} className="mr-1.5" />
                  Download QR
                </button>
              </div>
              {copyError && (
                <div className="text-xs text-red-500 mt-1">Copy failed. Please copy manually.</div>
              )}
              {downloadError && (
                <div className="text-xs text-red-500 mt-1">
                  Download failed. Press and hold the QR code to save it manually.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QRCodeModal;
