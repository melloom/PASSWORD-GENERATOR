import React, { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';

const CopyButton = ({ textToCopy, darkMode }) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setError(false);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setError(true);
        setTimeout(() => setError(false), 2000);
      });
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
        darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
      } transition`}
      title={error ? "Failed to copy" : copied ? "Copied!" : "Copy password"}
    >
      {error ? <AlertCircle size={18} className="text-red-500" /> :
       copied ? <Check size={18} className="text-green-500" /> :
       <Copy size={18} />}
    </button>
  );
};

export default CopyButton;