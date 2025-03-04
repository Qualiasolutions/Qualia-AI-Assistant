'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import VoiceSettings from '@/components/settings/VoiceSettings';
import useSettings from '@/hooks/useSettings';
import { FiArrowLeft, FiMoon, FiSun, FiMonitor } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { AppSettings } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, setTheme, setLanguage, toggleVoice, setVoiceOptions } = useSettings();
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
          router.push('/auth');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/auth');
      }
    };

    checkAuth();
  }, [router]);
  
  const handleGoBack = () => {
    router.back();
  };
  
  const handleVoiceSettingsUpdate = (newSettings: AppSettings) => {
    setVoiceOptions(newSettings.voice);
  };
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        language={settings.language}
        voiceEnabled={settings.voice.enabled}
        onLanguageChange={setLanguage}
        onVoiceToggle={toggleVoice}
        onSettingsClick={() => {}}
      />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 mr-2"
            aria-label="Go back"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">
            {settings.language === 'el' ? 'Ρυθμίσεις' : 'Settings'}
          </h1>
        </div>
        
        <div className="space-y-8">
          {/* Theme settings */}
          <motion.div 
            className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold">
              {settings.language === 'el' ? 'Εμφάνιση' : 'Appearance'}
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-lg flex flex-col items-center justify-center ${
                  settings.theme === 'light' 
                    ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <FiSun className="w-6 h-6 mb-2" />
                <span>
                  {settings.language === 'el' ? 'Φωτεινό' : 'Light'}
                </span>
              </button>
              
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-lg flex flex-col items-center justify-center ${
                  settings.theme === 'dark' 
                    ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <FiMoon className="w-6 h-6 mb-2" />
                <span>
                  {settings.language === 'el' ? 'Σκούρο' : 'Dark'}
                </span>
              </button>
              
              <button
                onClick={() => setTheme('system')}
                className={`p-4 rounded-lg flex flex-col items-center justify-center ${
                  settings.theme === 'system' 
                    ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <FiMonitor className="w-6 h-6 mb-2" />
                <span>
                  {settings.language === 'el' ? 'Συστήματος' : 'System'}
                </span>
              </button>
            </div>
          </motion.div>
          
          {/* Language settings */}
          <motion.div 
            className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold">
              {settings.language === 'el' ? 'Γλώσσα' : 'Language'}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setLanguage('el')}
                className={`p-4 rounded-lg flex items-center justify-center ${
                  settings.language === 'el' 
                    ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <span className="mr-2">🇬🇷</span>
                <span>Ελληνικά</span>
              </button>
              
              <button
                onClick={() => setLanguage('en')}
                className={`p-4 rounded-lg flex items-center justify-center ${
                  settings.language === 'en' 
                    ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <span className="mr-2">🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </motion.div>
          
          {/* Voice settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <VoiceSettings 
              settings={settings} 
              onUpdate={handleVoiceSettingsUpdate} 
            />
          </motion.div>
          
          <div className="h-20" /> {/* Extra space at bottom for scrolling */}
        </div>
      </div>
    </div>
  );
} 