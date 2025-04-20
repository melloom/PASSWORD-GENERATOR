import React, { useState, useEffect } from 'react';
import { X, Download, FileText, FileJson, FileCode, Info } from 'lucide-react';
// Remove html2pdf.js dependency since it's not installed yet
// We'll use a different approach for PDF export

const ExportModal = ({ isOpen, onClose, password, darkMode }) => {
  const [format, setFormat] = useState('txt');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);
  }, []);

  if (!isOpen) return null;

  // Function to handle export based on selected format
  const handleExport = () => {
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
        exportAsPdf();
        return;
      default:
        content = password;
        fileExtension = 'txt';
        mimeType = 'text/plain';
    }

    const fileName = title
      ? `${title.replace(/\s+/g, '-').toLowerCase()}.${fileExtension}`
      : `secure-password.${fileExtension}`;

    if (isIOS) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const shareData = {
        title: fileName,
        text: format === 'txt' ? content : 'Your password export',
        url: url
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData)
          .then(() => {
            onClose();
          })
          .catch(err => {
            console.error('Error sharing:', err);
            window.open(url, '_blank');
          });
      } else {
        const newTab = window.open();
        newTab.document.write(content);
        newTab.document.title = fileName;
        newTab.document.close();
      }

      setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    onClose();
  };

  // Modified PDF export to avoid using html2pdf.js dependency
  const exportAsPdf = () => {
    // Create HTML content for PDF
    const content = `
      <!DOCTYPE html>
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
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    onClose();
  };

  // Fix the function with proper semicolons
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

    <div class="field">
      <span class="label">Password:</span>
      <div class="password">${password}</div>
    </div>

    <div class="footer">
      Generated on: ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`w-full max-w-lg rounded-xl shadow-2xl ${darkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-300'} max-h-[90vh] flex flex-col animate-slideIn`}>
        <div className={`p-4 border-b ${darkMode ? 'border-dark-700' : 'border-gray-200'} flex justify-between items-center bg-gradient-to-r ${darkMode ? 'from-dark-700 to-dark-800' : 'from-gray-50 to-white'}`}>
          <h3 className="font-medium text-lg flex items-center">
            <Download size={18} className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} />
            Export Password
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-dark-600 bg-dark-700' : 'hover:bg-gray-200 bg-gray-100'} transition-colors`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              What's this password for?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Gmail, Netflix, Bank Account"
              className={`w-full p-2.5 rounded-lg ${
                darkMode
                  ? 'bg-dark-700 text-white border-dark-600 focus:border-primary-500'
                  : 'bg-white text-gray-800 border-gray-300 focus:border-primary-400'
              } border focus:ring-2 focus:ring-primary-500/20 transition-all`}
            />
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes or additional details"
              rows={3}
              className={`w-full p-2.5 rounded-lg ${
                darkMode
                  ? 'bg-dark-700 text-white border-dark-600 focus:border-primary-500'
                  : 'bg-white text-gray-800 border-gray-300 focus:border-primary-400'
              } border focus:ring-2 focus:ring-primary-500/20 transition-all`}
            />
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                className={`py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center ${
                  format === 'txt'
                    ? `${darkMode
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-primary-500 text-white shadow-sm border border-primary-600'}`
                    : `${darkMode
                        ? 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`
                } hover:shadow-md`}
                onClick={() => setFormat('txt')}
              >
                <FileText size={16} className="mr-2" />
                Text (.txt)
              </button>
              <button
                className={`py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center ${
                  format === 'pdf'
                    ? `${darkMode
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-primary-500 text-white shadow-sm border border-primary-600'}`
                    : `${darkMode
                        ? 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`
                } hover:shadow-md`}
                onClick={() => setFormat('pdf')}
              >
                <FileText size={16} className="mr-2" />
                PDF
              </button>
              <button
                className={`py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center ${
                  format === 'json'
                    ? `${darkMode
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-primary-500 text-white shadow-sm border border-primary-600'}`
                    : `${darkMode
                        ? 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`
                } hover:shadow-md`}
                onClick={() => setFormat('json')}
              >
                <FileJson size={16} className="mr-2" />
                JSON
              </button>
              <button
                className={`py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center ${
                  format === 'csv'
                    ? `${darkMode
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-primary-500 text-white shadow-sm border border-primary-600'}`
                    : `${darkMode
                        ? 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`
                } hover:shadow-md`}
                onClick={() => setFormat('csv')}
              >
                <FileText size={16} className="mr-2" />
                CSV
              </button>
              <button
                className={`py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center ${
                  format === 'html'
                    ? `${darkMode
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-primary-500 text-white shadow-sm border border-primary-600'}`
                    : `${darkMode
                        ? 'bg-dark-700 text-gray-300 hover:bg-dark-600 border border-dark-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`
                } hover:shadow-md`}
                onClick={() => setFormat('html')}
              >
                <FileCode size={16} className="mr-2" />
                HTML
              </button>
            </div>
          </div>

          <div className={`p-3 mb-4 rounded-lg flex items-start ${
            darkMode ? 'bg-dark-700/60 border border-dark-600' : 'bg-blue-50 border border-blue-100'
          }`}>
            <Info size={16} className={`${darkMode ? 'text-primary-400' : 'text-primary-500'} mt-0.5 mr-2 flex-shrink-0`} />
            <div className="text-xs">
              <p className="mb-1"><strong>Format details:</strong></p>
              {format === 'txt' && (
                <p>Plain text format with password and optional details. Easy to read but not structured for automated processing.</p>
              )}
              {format === 'json' && (
                <p>Structured JSON format. Ideal for importing into password managers or other applications.</p>
              )}
              {format === 'csv' && (
                <p>Comma-separated values format. Compatible with spreadsheets and many password managers.</p>
              )}
              {format === 'html' && (
                <p>HTML document with styled formatting. Can be opened in any web browser for better visual presentation.</p>
              )}
              {format === 'pdf' && (
                <p>PDF document with styled formatting. Can be opened in any PDF reader for better visual presentation.</p>
              )}
            </div>
          </div>

          {isIOS && (
            <div className={`p-3 mb-4 rounded-lg flex items-start ${
              darkMode ? 'bg-dark-700/60 border border-dark-600' : 'bg-orange-50 border border-orange-200'
            }`}>
              <Info size={16} className={`${darkMode ? 'text-warning-400' : 'text-warning-500'} mt-0.5 mr-2 flex-shrink-0`} />
              <div className="text-xs">
                <p className="mb-1"><strong>iOS Device Detected</strong></p>
                <p>On iOS, you'll be prompted to share or view your password in a new tab. You can then save it from there.</p>
              </div>
            </div>
          )}
        </div>

        <div className={`p-4 border-t ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`py-2 px-4 rounded-md ${
                darkMode
                  ? 'bg-dark-700 hover:bg-dark-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } transition-all`}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className={`py-2 px-4 rounded-md ${
                darkMode
                  ? 'bg-primary-600 hover:bg-primary-500 text-white'
                  : 'bg-primary-500 hover:bg-primary-400 text-white'
              } transition-all flex items-center`}
            >
              <Download size={16} className="mr-2" />
              {isIOS ? 'Share' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
