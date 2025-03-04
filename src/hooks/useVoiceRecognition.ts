import { useState, useEffect, useCallback } from 'react';
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
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = isSpeechRecognitionSupported();
      setIsSupported(supported);
      
      if (supported) {
        // Create recognition instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        
        // Configure recognition
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = language === 'el' ? 'el-GR' : 'en-US';
        
        // Set up event handlers
        recognitionInstance.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
            
          if (event.results[0].isFinal) {
            onResult(transcript);
          }
        };
        
        recognitionInstance.onerror = (event) => {
          onError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(recognitionInstance);
      }
    }
  }, [language, onResult, onError]);

  // Update language when it changes
  useEffect(() => {
    if (recognition) {
      recognition.lang = language === 'el' ? 'el-GR' : 'en-US';
    }
  }, [language, recognition]);

  // Start listening
  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        onError('Failed to start speech recognition');
        console.error('Speech recognition error:', error);
      }
    }
  }, [recognition, isListening, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening
  };
} 