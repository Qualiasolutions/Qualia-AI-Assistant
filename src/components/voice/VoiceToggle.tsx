'use client';

import { FiMic, FiMicOff } from 'react-icons/fi';

interface VoiceToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function VoiceToggle({
  enabled,
  onToggle,
}: VoiceToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-full ${
        enabled 
          ? 'bg-[#145199] text-white' 
          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
      } transition-colors`}
      aria-label={enabled ? 'Disable voice' : 'Enable voice'}
    >
      {enabled ? (
        <FiMic className="w-5 h-5" />
      ) : (
        <FiMicOff className="w-5 h-5" />
      )}
    </button>
  );
} 