'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiMic, FiMicOff, FiVolume2, FiVolumeX } from 'react-icons/fi';
import useVoiceRecognition from '@/hooks/useVoiceRecognition';
import { VoiceOptions } from '@/types';
import { stopSpeaking } from '@/lib/voice';

interface VoiceChatProps {
  voiceOptions: VoiceOptions;
  language: 'el' | 'en';
  onSpeechResult: (text: string) => void;
  isProcessing: boolean;
}

export default function VoiceChat({
  voiceOptions,
  language,
  onSpeechResult,
  isProcessing
}: VoiceChatProps) {
  const [isMuted, setIsMuted] = useState(!voiceOptions.enabled);
  const [isActivated, setIsActivated] = useState(false);
  const lastTranscriptRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update mute state when voice options change
  useEffect(() => {
    setIsMuted(!voiceOptions.enabled);
  }, [voiceOptions.enabled]);
  
  // Handle voice recognition
  const handleSpeechResult = useCallback((transcript: string) => {
    if (transcript.trim() && transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set a timeout to consider speech finished if no new input for 1.5 seconds
      timeoutRef.current = setTimeout(() => {
        onSpeechResult(transcript);
        lastTranscriptRef.current = '';
      }, 1500);
    }
  }, [onSpeechResult]);
  
  const handleSpeechError = useCallback((error: string) => {
    console.error('Speech recognition error:', error);
  }, []);
  
  const {
    isListening,
    isSupported,
    startListening,
    stopListening
  } = useVoiceRecognition({
    language,
    onResult: handleSpeechResult,
    onError: handleSpeechError
  });
  
  // Toggle continuous listening mode
  const toggleActivation = () => {
    if (isActivated) {
      setIsActivated(false);
      stopListening();
    } else {
      setIsActivated(true);
      if (!isListening && !isProcessing) {
        startListening();
      }
    }
  };
  
  // Toggle mute for assistant voice
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopSpeaking();
    }
  };
  
  // Manage listening state based on activation and processing status
  useEffect(() => {
    if (isActivated) {
      if (isProcessing) {
        if (isListening) {
          stopListening();
        }
      } else {
        if (!isListening) {
          startListening();
        }
      }
    }
  }, [isActivated, isProcessing, isListening, startListening, stopListening]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);
  
  if (!isSupported) {
    return null;
  }
  
  return (
    <div className="fixed bottom-20 right-6 flex flex-col items-center gap-3">
      {/* Voice control buttons */}
      <div className="flex gap-2">
        {/* Mute/unmute button */}
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full ${
            isMuted 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } shadow-lg`}
          aria-label={isMuted ? 'Unmute assistant' : 'Mute assistant'}
          title={isMuted ? 'Unmute assistant' : 'Mute assistant'}
        >
          {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
        </button>
        
        {/* Voice activation button */}
        <button
          onClick={toggleActivation}
          disabled={isProcessing}
          className={`p-3 rounded-full ${
            isActivated
              ? 'bg-green-500 text-white animate-pulse'
              : isProcessing
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
          } shadow-lg`}
          aria-label={
            isActivated 
              ? 'Deactivate voice chat' 
              : 'Activate voice chat'
          }
          title={
            isActivated 
              ? 'Deactivate voice chat' 
              : 'Activate voice chat'
          }
        >
          {isActivated ? <FiMic size={20} /> : <FiMicOff size={20} />}
        </button>
      </div>
      
      {/* Status indicator */}
      {isActivated && (
        <div className="text-sm bg-black bg-opacity-70 text-white px-3 py-1 rounded-full shadow-lg">
          {isProcessing 
            ? (language === 'el' ? 'Επεξεργασία...' : 'Processing...') 
            : (language === 'el' ? 'Σας ακούω...' : 'Listening...')}
        </div>
      )}
    </div>
  );
} 