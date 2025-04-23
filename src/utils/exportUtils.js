// ...existing code...

// If there's a formatExportContent function, update it
export const formatExportContent = (password, format = 'txt') => {
  if (format === 'txt') {
    // Simplified text format without encryption details
    return `Your Password:
${password}

Generated with Lockora`;
  }
  
  // ...existing code for other formats...
};

// ...existing code...