'use client';

import { useEffect, useRef } from 'react';
import { AppSettings } from '@/types';
import VoiceSettings from './VoiceSettings';
import { FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

export default function SettingsDrawer({
  isOpen,
  onClose,
  settings,
  onUpdate
}: SettingsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm">
        <motion.div
          ref={drawerRef}
          className="absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-lg overflow-y-auto"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {settings.language === 'el' ? 'Ρυθμίσεις' : 'Settings'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close settings"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-6">
            <VoiceSettings 
              settings={settings}
              onUpdate={onUpdate}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 