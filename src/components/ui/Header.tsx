'use client';

import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import VoiceToggle from '@/components/voice/VoiceToggle';
import { FiSettings } from 'react-icons/fi';

interface HeaderProps {
  language: 'el' | 'en';
  voiceEnabled: boolean;
  onLanguageChange: (language: 'el' | 'en') => void;
  onVoiceToggle: () => void;
  onSettingsClick: () => void;
}

export default function Header({
  language,
  voiceEnabled,
  onLanguageChange,
  onVoiceToggle,
  onSettingsClick,
}: HeaderProps) {
  return (
    <header className="bg-card border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Logos - Replace with actual logos */}
          <div className="flex items-center space-x-2">
            <div className="bg-[#145199] text-white h-10 w-10 rounded-full flex items-center justify-center font-bold">
              T
            </div>
            <span className="text-lg font-bold">Qualia</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <LanguageToggle
            language={language}
            onChange={onLanguageChange}
          />
          <VoiceToggle
            enabled={voiceEnabled}
            onToggle={onVoiceToggle}
          />
          <ThemeToggle />
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
} 