'use client';

import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import VoiceToggle from '@/components/voice/VoiceToggle';
import { FiSettings, FiLogOut } from 'react-icons/fi';

interface HeaderProps {
  language: 'el' | 'en';
  voiceEnabled: boolean;
  onLanguageChange: (language: 'el' | 'en') => void;
  onVoiceToggle: () => void;
  onSettingsClick: () => void;
  username?: string;
}

export default function Header({
  language,
  voiceEnabled,
  onLanguageChange,
  onVoiceToggle,
  onSettingsClick,
  username,
}: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove token from localStorage
        localStorage.removeItem('authToken');
        // Redirect to login page
        router.push('/auth');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
          {username && (
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
              Welcome, {username}
            </span>
          )}
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
            title="Settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-red-500"
            aria-label="Logout"
            title="Logout"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
} 