'use client';

import { useState, useEffect } from 'react';
import { FiMic } from 'react-icons/fi';
import useVoiceRecognition from '@/hooks/useVoiceRecognition';

interface VoiceRecordButtonProps {
  language: 'el' | 'en';
  onResult: (transcript: string) => void;
  disabled?: boolean;
}

export default function VoiceRecordButton({
  language,
  onResult,
  disabled = false,
}: VoiceRecordButtonProps) {
  const [error, setError] = useState<string | null>(null);
  
  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
  } = useVoiceRecognition({
    language,
    onResult,
    onError: (errorMsg) => setError(errorMsg),
  });

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);

  if (!isSupported) {
    return (
      <button
        disabled
        className="p-3 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed"
        title="Voice input is not supported in your browser"
      >
        <FiMic className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        className={`p-3 rounded-full ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : disabled
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-[#145199] text-white hover:bg-[#0e3b70]'
        } transition-colors`}
        title={
          isListening
            ? 'Stop recording'
            : disabled
              ? 'Voice recording not available'
              : 'Start voice recording'
        }
      >
        <FiMic className="w-5 h-5" />
      </button>
      {error && (
        <div className="text-red-500 text-xs mt-1">{error}</div>
      )}
    </div>
  );
} 