// This is a new file to help resolve circular dependencies

// Instead of having components import each other directly,
// you can use a central export file like this:

import PasswordGenerator from './PasswordGenerator';
import PasswordHistory from './PasswordHistory';
import PasswordGuides from './PasswordGuides';
import CreatorInfo from './CreatorInfo';
import ExportModal from './ExportModal';
import QRCodeModal from './QRCodeModal';
import ShareButton from './ShareButton';
// ...import all your components

// Then export them
export {
  PasswordGenerator,
  PasswordHistory,
  PasswordGuides,
  CreatorInfo,
  ExportModal,
  QRCodeModal,
  ShareButton,
  // ...export all components
};

// Now in your files, instead of:
// import ComponentA from './ComponentA';
// You can use:
// import { ComponentA } from './circularDependencyFix';
