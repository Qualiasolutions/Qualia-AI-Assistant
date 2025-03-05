'use client';

import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import VoiceToggle from '@/components/voice/VoiceToggle';

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
    <header className="bg-card border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-[#145199] text-white h-10 w-10 rounded-full flex items-center justify-center font-bold">
              T
            </div>
            <span className="text-lg font-bold">Qualia AI Assistant</span>
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
        </div>
      </div>
    </header>
  );
} 