import React, { useState } from 'react';
import { X, Download, Share2, QrCode, Info } from 'lucide-react';
import QRCode from 'qrcode.react';

const QRCodeModal = ({ isOpen, onClose, password, darkMode }) => {
  const [qrSize, setQrSize] = useState(200);

  if (!isOpen) return null;

  // Function to download QR code as PNG
  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');

      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'password-qrcode.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Function to share QR code if Web Share API is available
  const shareQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas && navigator.share) {
      canvas.toBlob(async (blob) => {
        try {
          const file = new File([blob], 'password-qrcode.png', { type: 'image/png' });
          await navigator.share({
            title: 'Password QR Code',
            text: 'Scan this QR code to view the password',
            files: [file]
          });
        } catch (error) {
          console.error('Error sharing:', error);
          // Fallback to download if sharing fails
          downloadQRCode();
        }
      });
    } else {
      // Fallback to download if sharing is not available
      downloadQRCode();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`w-full max-w-md rounded-xl shadow-2xl ${darkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-300'} max-h-[90vh] flex flex-col animate-slideIn`}>
        <div className={`p-4 border-b ${darkMode ? 'border-dark-700' : 'border-gray-200'} flex justify-between items-center`}>
          <h3 className="font-medium text-lg flex items-center">
            <QrCode size={18} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} />
            Password QR Code
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-dark-600 bg-dark-700' : 'hover:bg-gray-200 bg-gray-100'} transition-colors`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col items-center">
          <div className={`p-3 mb-4 rounded-lg border ${darkMode ? 'border-dark-600 bg-dark-700/50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex justify-center items-center">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-white' : 'bg-white'}`}>
                <QRCode
                  id="qr-code-canvas"
                  value={password}
                  size={qrSize}
                  level="H"
                  includeMargin={true}
                  renderAs="canvas"
                />
              </div>
            </div>
          </div>

          <div className="w-full mb-4">
            <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              QR Code Size
            </label>
            <input
              type="range"
              min="150"
              max="300"
              value={qrSize}
              onChange={(e) => setQrSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs mt-1">
              <span>Smaller</span>
              <span>Larger</span>
            </div>
          </div>

          <div className={`w-full p-3 rounded-lg flex items-start ${
            darkMode ? 'bg-dark-700/60 border border-dark-600' : 'bg-blue-50 border border-blue-100'
          } mb-4`}>
            <Info size={16} className={`${darkMode ? 'text-primary-400' : 'text-primary-500'} mt-0.5 mr-2 flex-shrink-0`} />
            <div className="text-xs">
              <p><strong>How to use:</strong> Scan this QR code with your mobile device to quickly transfer the password without typing it.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={downloadQRCode}
              className={`py-2 px-4 rounded-lg ${
                darkMode
                  ? 'bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
              } transition-all flex items-center justify-center`}
            >
              <Download size={16} className="mr-2" />
              Download
            </button>
            <button
              onClick={shareQRCode}
              className={`py-2 px-4 rounded-lg ${
                darkMode
                  ? 'bg-primary-600 hover:bg-primary-500 text-white'
                  : 'bg-primary-500 hover:bg-primary-400 text-white'
              } transition-all flex items-center justify-center`}
            >
              <Share2 size={16} className="mr-2" />
              Share
            </button>
          </div>
        </div>

        <div className={`p-4 border-t ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
          <div className="text-center text-xs text-gray-500">
            For enhanced security, QR codes are generated locally and not stored on any server.
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
