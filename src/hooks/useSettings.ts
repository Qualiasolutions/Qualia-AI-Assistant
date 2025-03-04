import { useState, useEffect } from 'react';
import { AppSettings, VoiceOptions } from '@/types';
import { defaultVoiceOptions } from '@/lib/voice';

const defaultSettings: AppSettings = {
  theme: 'light',
  language: 'el',
  voice: defaultVoiceOptions,
};

export default function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const storedSettings = localStorage.getItem('appSettings');
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  // Update theme
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  // Update language
  const setLanguage = (language: 'el' | 'en') => {
    setSettings((prev) => ({ 
      ...prev, 
      language,
      voice: { ...prev.voice, language },
    }));
  };

  // Update voice options
  const setVoiceOptions = (options: Partial<VoiceOptions>) => {
    setSettings((prev) => ({
      ...prev,
      voice: { ...prev.voice, ...options },
    }));
  };

  // Toggle voice enabled
  const toggleVoice = () => {
    setSettings((prev) => ({
      ...prev,
      voice: { ...prev.voice, enabled: !prev.voice.enabled },
    }));
  };

  return {
    settings,
    isLoaded,
    setTheme,
    setLanguage,
    setVoiceOptions,
    toggleVoice,
  };
} 