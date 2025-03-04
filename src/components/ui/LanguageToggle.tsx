'use client';

import { FiGlobe } from 'react-icons/fi';

interface LanguageToggleProps {
  language: 'el' | 'en';
  onChange: (language: 'el' | 'en') => void;
}

export default function LanguageToggle({
  language,
  onChange,
}: LanguageToggleProps) {
  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => onChange(language === 'el' ? 'en' : 'el')}
        className="flex items-center space-x-1 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={`Switch to ${language === 'el' ? 'English' : 'Greek'}`}
      >
        <FiGlobe className="w-5 h-5" />
        <span className="text-sm font-medium">
          {language === 'el' ? 'EL' : 'EN'}
        </span>
      </button>
    </div>
  );
} 