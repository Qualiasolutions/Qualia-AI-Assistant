'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiMic, FiMicOff, FiVolume2, FiVolumeX } from 'react-icons/fi';
import useVoiceRecognition from '@/hooks/useVoiceRecognition';
import { VoiceOptions } from '@/types';
import { stopSpeaking } from '@/lib/voice';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [voiceActivity, setVoiceActivity] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update mute state when voice options change
  useEffect(() => {
    setIsMuted(!voiceOptions.enabled);
  }, [voiceOptions.enabled]);
  
  // Handle voice recognition
  const handleSpeechResult = useCallback((transcript: string, confidence?: number) => {
    if (transcript.trim() && transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      
      // Simulate voice activity based on transcript length and confidence
      setVoiceActivity(Math.min(100, Math.max(30, transcript.length * 2 + (confidence || 0.5) * 50)));
      
      // Reset activity after short delay
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      
      activityTimeoutRef.current = setTimeout(() => {
        setVoiceActivity(0);
      }, 800);
      
      // Clear any existing timeout for speech result
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
    setErrorMessage(error);
    
    // Auto-clear error after 5 seconds
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
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
      setVoiceActivity(0);
    } else {
      setIsActivated(true);
      if (!isListening && !isProcessing) {
        startListening();
        // Initial pulse animation on activation
        setVoiceActivity(30);
        setTimeout(() => setVoiceActivity(0), 800);
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
          setVoiceActivity(0);
        }
      } else {
        if (!isListening) {
          startListening();
          // Pulse animation when starting to listen
          setVoiceActivity(30);
          setTimeout(() => setVoiceActivity(10), 800);
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
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
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
    <div className="fixed bottom-20 right-6 flex flex-col items-center gap-3 z-20">
      {/* Voice activity visualization */}
      <AnimatePresence>
        {isActivated && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative w-12 h-12 mb-1"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute inset-0 rounded-full border-2 border-blue-500"
                initial={{ opacity: 0.7, scale: 1 }}
                animate={{ 
                  opacity: voiceActivity > 0 ? [0.7, 0.2] : 0.5,
                  scale: voiceActivity > 0 ? [1, 1 + (i + 1) * 0.1 * Math.min(1, voiceActivity / 50)] : 1 + (i + 1) * 0.05,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error message display */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg shadow-lg max-w-xs text-center"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Voice control buttons */}
      <div className="flex gap-2">
        {/* Mute/unmute button */}
        <motion.button
          onClick={toggleMute}
          whileTap={{ scale: 0.95 }}
          className={`p-3 rounded-full ${
            isMuted 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } shadow-lg transition-colors duration-200`}
          aria-label={isMuted ? 'Unmute assistant' : 'Mute assistant'}
          title={isMuted ? 'Unmute assistant' : 'Mute assistant'}
        >
          {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
        </motion.button>
        
        {/* Voice activation button */}
        <motion.button
          onClick={toggleActivation}
          disabled={isProcessing}
          whileTap={{ scale: 0.95 }}
          className={`p-3 rounded-full ${
            isActivated
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : isProcessing
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
          } shadow-lg transition-colors duration-200`}
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
        </motion.button>
      </div>
      
      {/* Status indicator */}
      <AnimatePresence>
        {isActivated && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`text-sm px-3 py-1 rounded-full shadow-lg ${
              isProcessing 
                ? 'bg-yellow-500 text-white' 
                : 'bg-green-500 text-white'
            }`}
          >
            {isProcessing 
              ? (language === 'el' ? 'Επεξεργασία...' : 'Processing...') 
              : (language === 'el' ? 'Σας ακούω...' : 'Listening...')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 