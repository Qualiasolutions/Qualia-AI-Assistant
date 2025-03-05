'use client';

import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { FiMenu, FiSettings } from 'react-icons/fi';

interface HeaderProps {
  language: 'el' | 'en';
  voiceEnabled: boolean;
  onLanguageChange: (language: 'el' | 'en') => void;
  onVoiceToggle: () => void;
  onSettingsClick: () => void;
  username?: string; // Keeping parameter for backward compatibility
}

export default function Header({
  language,
  voiceEnabled,
  onLanguageChange,
  onVoiceToggle,
  onSettingsClick,
}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle Button */}
          <button 
            onClick={onSettingsClick}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={language === 'el' ? 'Εναλλαγή πλευρικής μπάρας' : 'Toggle sidebar'}
          >
            <FiMenu className="w-5 h-5" />
          </button>
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white h-8 w-8 rounded flex items-center justify-center font-bold">
              T
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Qualia AI Assistant</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <LanguageToggle
            language={language}
            onChange={onLanguageChange}
          />
          <ThemeToggle />
          <button 
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={language === 'el' ? 'Ρυθμίσεις' : 'Settings'}
          >
            <FiSettings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
} 