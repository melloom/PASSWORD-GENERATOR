import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Download, FileText, FileJson, FileCode, Info, Check, Save, Loader } from 'lucide-react';

const ExportModal = ({ isOpen, onClose, password, darkMode }) => {
  const [format, setFormat] = useState('txt');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState(1); // 1: Basic info, 2: Format selection
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const [showExportNotice, setShowExportNotice] = useState(false);

  useEffect(() => {
    // Reset the modal state when opening
    if (isOpen) {
      setStep(1);
      setExportSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Function to handle moving to format selection
  const handleNextStep = () => {
    setStep(2);
  };

  // Function to handle back to info step
  const handleBackStep = () => {
    setStep(1);
  };

  // Fix iOS export/share functionality and show indicator
  const handleExport = async () => {
    setIsExporting(true);
    setExportError(false);
    setShowExportNotice(false);
    let content = '';
    let fileExtension = '';
    let mimeType = '';

    switch (format) {
      case 'txt':
        content = generateTxtContent();
        fileExtension = 'txt';
        mimeType = 'text/plain';
        break;
      case 'json':
        content = generateJsonContent();
        fileExtension = 'json';
        mimeType = 'application/json';
        break;
      case 'csv':
        content = generateCsvContent();
        fileExtension = 'csv';
        mimeType = 'text/csv';
        break;
      case 'html':
        content = generateHtmlContent();
        fileExtension = 'html';
        mimeType = 'text/html';
        break;
      case 'pdf':
        await exportAsPdf();
        setIsExporting(false);
        return;
      default:
        content = password;
        fileExtension = 'txt';
        mimeType = 'text/plain';
    }

    const fileName = title
      ? `${title.replace(/\s+/g, '-').toLowerCase()}.${fileExtension}`
      : `secure-password.${fileExtension}`;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    try {
      if (isIOS) {
        setShowExportNotice(true);
        const blob = new Blob([content], { type: mimeType });
        const file = new File([blob], fileName, { type: mimeType });
        // Try Web Share API with files (iOS 13+)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: fileName,
            text: format === 'txt' ? content : 'Your password export',
            files: [file]
          });
          setExportSuccess(true);
          setTimeout(() => onClose(), 1500);
        } else if (navigator.share) {
          // Fallback: share just the text (works for Notes, Messages, etc)
          await navigator.share({
            title: fileName,
            text: `Title: ${title || 'Secure Password'}\nPassword: ${password}`
          });
          setExportSuccess(true);
          setTimeout(() => onClose(), 1500);
        } else {
          // Fallback for iOS devices that don't support sharing
          safeOpenContent(content, fileName);
        }
      } else {
        setShowExportNotice(true);
        // Regular download for non-iOS devices (unchanged)
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setExportSuccess(true);
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setExportError(true);
      setShowExportNotice(false);
      setTimeout(() => setIsExporting(false), 1200);
      return;
    }
    setTimeout(() => setIsExporting(false), 1200);
  };

  // Safe method to open content in a new tab for iOS
  const safeOpenContent = (content, fileName) => {
    try {
      // Try to safely open and write to a new window
      const newTab = window.open('');
      if (newTab && newTab.document) {
        newTab.document.write(content);
        newTab.document.title = fileName;
        newTab.document.close();
        setExportSuccess(true);
      } else {
        // If window.open fails, show a message to the user
        alert("Your browser blocked opening a new tab. Please copy your password manually.");

        // Create a temporary textarea to help user copy the password
        const textarea = document.createElement('textarea');
        textarea.value = password;
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        alert("Password copied to clipboard as a fallback measure.");
        setExportSuccess(true);
      }
    } catch (err) {
      console.error("Error opening content:", err);
      alert("We couldn't export the password due to browser restrictions. Password copied to clipboard instead.");
      navigator.clipboard.writeText(password).catch(() => {});
      setExportSuccess(true);
    }

    setTimeout(() => onClose(), 1500);
  };

  // Modified PDF export to fix iOS issue
  const exportAsPdf = async () => {
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title || 'Secure Password'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          h1 { color: #333; }
          .field { margin-bottom: 16px; }
          .label { font-weight: bold; margin-right: 8px; }
          .password { font-family: monospace; background: #f5f5f5; padding: 8px; border-radius: 4px; word-break: break-all; }
          .footer { margin-top: 20px; font-size: 0.8em; color: #666; }
          @media print {
            body { margin: 0; }
            .container { border: none; }
            .password { background: #f9f9f9; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${title || 'Secure Password'}</h1>
          ${description ? `<div class="field">
            <div class="label">Description:</div>
            <div>${description}</div>
          </div>` : ''}
          <div class="field">
            <div class="label">Password:</div>
            <div class="password">${password}</div>
          </div>
          <div class="footer">
            Generated on: ${new Date().toLocaleString()}
          </div>
        </div>
        <script>
          // Only try to print automatically on desktop browsers
          if (!/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            window.onload = function() { window.print(); }
          }
        </script>
      </body>
      </html>
    `;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      safeOpenContent(content, `${title || 'secure-password'}.pdf`);
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        setExportSuccess(true);
        setTimeout(() => onClose(), 1500);
      } else {
        alert("Your browser blocked the popup. Please adjust your browser settings to allow popups for this site.");
      }
    }
    setIsExporting(false);
  };

  const generateTxtContent = () => {
    const date = new Date().toLocaleString();
    let content = '';

    if (title) { content += `Title: ${title}\n`; }
    if (description) { content += `Description: ${description}\n`; }
    content += `Password: ${password}\n`;
    content += `Generated: ${date}\n`;

    return content;
  };

  const generateJsonContent = () => {
    const data = {
      title: title || 'Secure Password',
      description: description || '',
      password: password,
      generated: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  };

  const generateCsvContent = () => {
    const headers = 'Title,Description,Password,Generated\n';
    const date = new Date().toISOString();
    const data = `"${title || 'Secure Password'}","${description || ''}","${password}","${date}"\n`;

    return headers + data;
  };

  const generateHtmlContent = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <title>${title || 'Secure Password'}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    h1 { color: #333; }
    .field { margin-bottom: 16px; }
    .label { font-weight: bold; margin-right: 8px; }
    .password { font-family: monospace; background: #f5f5f5; padding: 8px; border-radius: 4px; }
    .footer { margin-top: 20px; font-size: 0.8em; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title || 'Secure Password'}</h1>

    ${description ? `<div class="field">
      <span class="label">Description:</span>
      <div>${description}</div>
    </div>` : ''}

    <div className="field">
      <span className="label">Password:</span>
      <div className="password">${password}</div>
    </div>

    <div className="footer">
      Generated on: ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>`;
  };

  // Format Card component - Make it more compact
  const FormatCard = ({ id, name, icon, description }) => (
    <button
      className={`format-card w-full mb-2 p-2 rounded-lg border transition-all flex items-center ${
        format === id
          ? darkMode
            ? 'bg-primary-600/20 border-primary-500 shadow-sm'
            : 'bg-primary-50 border-primary-400 shadow-sm'
          : darkMode
            ? 'bg-dark-700 border-dark-600 hover:bg-dark-600'
            : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => setFormat(id)}
    >
      <div className={`mr-2 p-1.5 rounded-full ${
        format === id
          ? darkMode ? 'bg-primary-600/30 text-primary-400' : 'bg-primary-100 text-primary-700'
          : darkMode ? 'bg-dark-600 text-gray-400' : 'bg-gray-100 text-gray-500'
      }`}>
        {icon}
      </div>
      <div className="text-left flex-grow">
        <h3 className={`font-medium text-sm ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>{name}</h3>
        <p className={`text-xs ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {description}
          {/* Condense additional format information */}
          {(id === 'csv' || id === 'json') && (
            <span className="block mt-0.5 text-xs font-medium opacity-80">
              {id === 'csv' ? 'Compatible with most password managers' : 'Includes metadata'}
            </span>
          )}
        </p>
      </div>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
        format === id
          ? darkMode ? 'bg-primary-500 text-white' : 'bg-primary-500 text-white'
          : darkMode ? 'border border-gray-600' : 'border border-gray-300'
      }`}>
        {format === id && <Check size={12} />}
      </div>
    </button>
  );

  return ReactDOM.createPortal(
    <div
      className="export-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className={`export-modal-content ${
          darkMode ? 'bg-dark-800 text-gray-200' : 'bg-white text-gray-800'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          borderRadius: '1rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          maxWidth: '100vw',
          width: '100%',
          minWidth: 0,
          zIndex: 100001,
          position: 'relative',
          border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 8px'
        }}
      >
        {/* Absolute X button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition"
          aria-label="Close export modal"
          style={{
            color: '#fff',
            zIndex: 1002,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className={`flex justify-between items-center p-3 border-b sticky top-0 z-10 bg-inherit ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
          <h3 className="text-lg font-semibold flex items-center truncate">
            <Download size={18} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} />
            {exportSuccess ? 'Export Success' : step === 1 ? 'Export Password' : 'Select Format'}
          </h3>
        </div>

        {/* Modal body - add scrolling */}
        <div className="overflow-y-auto flex-1" style={{maxHeight: 'calc(100vh - 120px)', minHeight: 0, paddingBottom: 8}}>
          {/* Success Message */}
          {exportSuccess ? (
            <div className="p-6 flex flex-col items-center justify-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                darkMode ? 'bg-primary-600/20 text-primary-400' : 'bg-primary-100 text-primary-600'
              }`}>
                <Check size={28} />
              </div>
              <h3 className="text-xl font-medium mb-2">Export Successful!</h3>
              <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your password has been exported successfully.
              </p>
            </div>
          ) : step === 1 ? (
            /* Step 1: Basic Info - make more compact */
            <div className="p-4">
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  What's this password for?
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Gmail, Netflix, Bank Account"
                  className={`w-full p-2 rounded-lg ${
                    darkMode
                      ? 'bg-dark-700 text-white border border-dark-600 focus:border-primary-500'
                      : 'bg-white text-gray-800 border border-gray-300 focus:border-primary-400'
                  } focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all`}
                />
              </div>

              <div className="mb-3">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes or additional details"
                  rows={2}
                  className={`w-full p-2 rounded-lg ${
                    darkMode
                      ? 'bg-dark-700 text-white border border-dark-600 focus:border-primary-500'
                      : 'bg-white text-gray-800 border border-gray-300 focus:border-primary-400'
                  } focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all`}
                />
              </div>

              <div className={`p-2 rounded-lg flex items-start ${
                darkMode ? 'bg-primary-900/20 text-primary-300' : 'bg-primary-50 text-primary-800'
              } mb-2`}>
                <Info size={14} className={`mr-1.5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
                <p className="text-xs">
                  Adding details helps you identify this password later.
                </p>
              </div>
            </div>
          ) : (
            /* Step 2: Format Selection - more compact with better scrolling */
            <div className="p-4">
              <div className="mb-2">
                <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Choose Export Format
                </h4>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  <FormatCard
                    id="txt"
                    name="Text File (.txt)"
                    icon={<FileText size={16} />}
                    description="Simple text file that works everywhere"
                  />

                  <FormatCard
                    id="pdf"
                    name="PDF Document"
                    icon={<FileText size={16} />}
                    description="Formatted document with details"
                  />

                  <FormatCard
                    id="json"
                    name="JSON File (.json)"
                    icon={<FileJson size={16} />}
                    description="Structured data format"
                  />

                  <FormatCard
                    id="csv"
                    name="CSV File (.csv)"
                    icon={<FileText size={16} />}
                    description="For spreadsheets & password managers"
                  />

                  <FormatCard
                    id="html"
                    name="HTML File (.html)"
                    icon={<FileCode size={16} />}
                    description="View in any web browser"
                  />
                </div>
              </div>

              {/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream && (
                <div className={`p-2 mb-2 rounded-lg flex items-start text-xs ${
                  darkMode ? 'bg-yellow-900/20 border border-yellow-900/30' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <Info size={14} className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-0.5 mr-1.5 flex-shrink-0`} />
                  <span>
                    <strong>iOS Device:</strong> You'll be prompted to share or view the file.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with buttons */}
        <div className={`p-3 flex justify-end border-t sticky bottom-0 z-10 bg-inherit ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
          {!exportSuccess && (
            step === 1 ? (
              <>
                <button
                  onClick={onClose}
                  className={`py-1.5 px-3 rounded-lg mr-2 ${
                    darkMode
                      ? 'bg-dark-700 hover:bg-dark-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  } transition-all`}
                  disabled={isExporting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleNextStep}
                  className={`py-1.5 px-4 rounded-lg ${
                    darkMode
                      ? 'bg-primary-600 hover:bg-primary-500 text-white'
                      : 'bg-primary-500 hover:bg-primary-400 text-white'
                  } transition-all flex items-center font-medium`}
                  disabled={isExporting}
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleBackStep}
                  className={`py-1.5 px-3 rounded-lg mr-2 ${
                    darkMode
                      ? 'bg-dark-700 hover:bg-dark-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  } transition-all`}
                  disabled={isExporting}
                >
                  Back
                </button>
                <button
                  onClick={handleExport}
                  className={`py-1.5 px-4 rounded-lg ${
                    darkMode
                      ? 'bg-primary-600 hover:bg-primary-500 text-white'
                      : 'bg-primary-500 hover:bg-primary-400 text-white'
                  } transition-all flex items-center font-medium`}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader size={16} className="mr-1.5 animate-spin" />
                      {/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream ? 'Sharing...' : 'Downloading...'}
                    </>
                  ) : (
                    <>
                      <Download size={16} className="mr-1.5" />
                      {/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream ? 'Share' : 'Export'}
                    </>
                  )}
                </button>
              </>
            )
          )}
        </div>
        {showExportNotice && (
          <div className="text-xs text-blue-600 text-center pb-2">
            {/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
              ? "Sharing sheet should appear. If not, try a different browser or check your device's sharing settings."
              : "Download started. Check your downloads folder."}
          </div>
        )}
        {exportError && (
          <div className="text-xs text-red-500 text-center pb-2">
            Export failed. Try again or use a different browser.
          </div>
        )}
      </div>
      <style jsx>{`
        .export-modal-overlay {
          position: fixed !important;
          inset: 0 !important;
          z-index: 100000 !important;
        }
        .export-modal-content {
          animation: modalFadeIn 0.3s ease forwards;
          transform: none !important;
        }
        @keyframes modalFadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .format-card {
          transition: all 0.2s ease;
        }

        /* Improve scrollbar appearance */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ExportModal;
