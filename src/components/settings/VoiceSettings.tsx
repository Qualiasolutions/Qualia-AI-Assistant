'use client';

import { useState, useEffect } from 'react';
import { VoiceOptions, AppSettings } from '@/types';
import { speakText, getAvailableVoices, enhancedVoiceOptions, stopSpeaking } from '@/lib/voice';

interface VoiceSettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

export default function VoiceSettings({ settings, onUpdate }: VoiceSettingsProps) {
  const [voiceOptions, setVoiceOptions] = useState<VoiceOptions>(settings.voice);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testText, setTestText] = useState<string>(
    settings.language === 'el' 
      ? 'Γεια σας! Αυτό είναι ένα δείγμα ομιλίας.'
      : 'Hello! This is a sample of the voice.'
  );
  
  // Load browser voices
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initial load
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      setBrowserVoices(voices.filter(voice => 
        voice.lang.startsWith(settings.language === 'el' ? 'el' : 'en')
      ));
    }
    
    // Handle voices loaded event
    const handleVoicesChanged = () => {
      const updatedVoices = window.speechSynthesis.getVoices();
      setBrowserVoices(updatedVoices.filter(voice => 
        voice.lang.startsWith(settings.language === 'el' ? 'el' : 'en')
      ));
    };
    
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, [settings.language]);
  
  // Update test text when language changes
  useEffect(() => {
    setTestText(
      settings.language === 'el' 
        ? 'Γεια σας! Αυτό είναι ένα δείγμα ομιλίας.'
        : 'Hello! This is a sample of the voice.'
    );
  }, [settings.language]);
  
  // Update parent component when voice options change
  useEffect(() => {
    onUpdate({
      ...settings,
      voice: voiceOptions
    });
  }, [voiceOptions]);
  
  const handleToggleVoice = () => {
    setVoiceOptions(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };
  
  const handleChangeVoiceType = (useEnhanced: boolean) => {
    setVoiceOptions(prev => ({
      ...prev,
      useEnhancedVoices: useEnhanced,
      voiceId: 'default' // Reset voice ID when switching types
    }));
  };
  
  const handleVoiceChange = (voiceId: string) => {
    setVoiceOptions(prev => ({
      ...prev,
      voiceId
    }));
  };
  
  const handleVolumeChange = (volume: number) => {
    setVoiceOptions(prev => ({
      ...prev,
      volume
    }));
  };
  
  const handleRateChange = (rate: number) => {
    setVoiceOptions(prev => ({
      ...prev,
      rate
    }));
  };
  
  const handlePitchChange = (pitch: number) => {
    setVoiceOptions(prev => ({
      ...prev,
      pitch
    }));
  };
  
  const testVoice = () => {
    stopSpeaking();
    speakText(testText, voiceOptions);
  };
  
  // Get the appropriate voice options based on current settings
  const currentVoiceOptions = voiceOptions.useEnhancedVoices
    ? enhancedVoiceOptions[voiceOptions.language]
    : browserVoices.map(voice => ({
        id: voice.voiceURI,
        name: `${voice.name} (${voice.lang})`,
        gender: voice.name.toLowerCase().includes('female') ? 'female' : 'male'
      }));
  
  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {settings.language === 'el' ? 'Ρυθμίσεις Φωνής' : 'Voice Settings'}
        </h2>
        
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={voiceOptions.enabled}
              onChange={handleToggleVoice}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium">
              {settings.language === 'el' ? 'Ενεργοποίηση φωνής' : 'Enable voice'}
            </span>
          </label>
        </div>
      </div>
      
      {voiceOptions.enabled && (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {settings.language === 'el' ? 'Τύπος φωνής' : 'Voice type'}
              </label>
              <div className="flex gap-4">
                <button
                  className={`px-4 py-2 text-sm rounded-md ${
                    !voiceOptions.useEnhancedVoices
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  onClick={() => handleChangeVoiceType(false)}
                >
                  {settings.language === 'el' ? 'Βασικές φωνές' : 'Basic voices'}
                </button>
                <button
                  className={`px-4 py-2 text-sm rounded-md ${
                    voiceOptions.useEnhancedVoices
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  onClick={() => handleChangeVoiceType(true)}
                >
                  {settings.language === 'el' ? 'Βελτιωμένες φωνές' : 'Enhanced voices'}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {settings.language === 'el' ? 'Επιλογή φωνής' : 'Select voice'}
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                value={voiceOptions.voiceId || 'default'}
                onChange={(e) => handleVoiceChange(e.target.value)}
              >
                <option value="default">
                  {settings.language === 'el' ? 'Προεπιλεγμένη φωνή' : 'Default voice'}
                </option>
                {currentVoiceOptions.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {settings.language === 'el' ? 'Ένταση' : 'Volume'}: {voiceOptions.volume.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voiceOptions.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {settings.language === 'el' ? 'Ταχύτητα' : 'Speed'}: {voiceOptions.rate.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceOptions.rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {settings.language === 'el' ? 'Τόνος' : 'Pitch'}: {voiceOptions.pitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceOptions.pitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              {settings.language === 'el' ? 'Δοκιμή φωνής' : 'Test voice'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={testVoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {settings.language === 'el' ? 'Δοκιμή' : 'Test'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 