import { useState, useEffect, useCallback, useRef } from 'react';
import { isSpeechRecognitionSupported } from '@/lib/voice';

type Language = 'el' | 'en';

interface UseVoiceRecognitionProps {
  language: Language;
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
}

export default function useVoiceRecognition({
  language,
  onResult,
  onError
}: UseVoiceRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  
  // Use refs instead of state for objects that don't need re-renders
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const callbacksRef = useRef({ onResult, onError, language });
  
  // Update callback refs when props change
  useEffect(() => {
    callbacksRef.current = { onResult, onError, language };
  }, [onResult, onError, language]);

  // Initialize speech recognition just once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const supported = isSpeechRecognitionSupported();
    setIsSupported(supported);
    
    if (!supported) return;
    
    // Create recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    // Configure recognition
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = language === 'el' ? 'el-GR' : 'en-US';
    
    // Store in ref
    recognitionRef.current = recognitionInstance;
    
    // Set up event handlers
    const handleResult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
        
      if (event.results[0].isFinal) {
        callbacksRef.current.onResult(transcript);
      }
    };
    
    const handleError = (event: SpeechRecognitionErrorEvent) => {
      callbacksRef.current.onError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
    
    const handleEnd = () => {
      setIsListening(false);
    };
    
    recognitionInstance.onresult = handleResult;
    recognitionInstance.onerror = handleError;
    recognitionInstance.onend = handleEnd;
    
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        
        if (isListening) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.error('Error stopping recognition on unmount:', e);
          }
        }
      }
    };
  }, [language, isListening]); // Dependencies that are used inside the effect

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'el' ? 'el-GR' : 'en-US';
    }
  }, [language]);

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        callbacksRef.current.onError('Failed to start speech recognition');
        console.error('Speech recognition error:', error);
      }
    }
  }, [isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening
  };
} 