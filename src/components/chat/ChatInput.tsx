'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiLoader } from 'react-icons/fi';
import VoiceRecordButton from '@/components/voice/VoiceRecordButton';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  language: 'el' | 'en';
}

export default function ChatInput({
  onSendMessage,
  isLoading,
  language,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      // Reset height after sending
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      // Announce message sent to screen readers
      announceToScreenReader(language === 'el' ? 'Το μήνυμα στάλθηκε' : 'Message sent');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      sendButtonRef.current?.focus();
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setMessage(transcript);
    // Announce voice transcription to screen readers
    announceToScreenReader(
      language === 'el' 
        ? 'Φωνητική εισαγωγή: ' + transcript 
        : 'Voice input: ' + transcript
    );
  };

  // Function to announce messages to screen readers
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('role', 'status');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    // Remove after announcement is read
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return (
    <div 
      className="border-t border-gray-200 dark:border-gray-700 bg-card p-4 sticky bottom-0 backdrop-blur-md bg-white/80 dark:bg-gray-900/80"
      role="region"
      aria-label={language === 'el' ? 'Περιοχή εισαγωγής μηνύματος' : 'Message input area'}
    >
      <div className="max-w-4xl mx-auto">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end space-x-2 relative rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-1 bg-white dark:bg-gray-800"
        >
          <label htmlFor="message-input" className="sr-only">
            {language === 'el' ? 'Γράψτε το μήνυμά σας' : 'Type your message'}
          </label>
          <div className="flex-grow relative">
            <textarea
              id="message-input"
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'el' ? 'Γράψτε το μήνυμά σας...' : 'Type your message...'}
              className="w-full min-h-[45px] max-h-[150px] py-2 px-3 resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-gray-800 dark:text-gray-200"
              disabled={isLoading}
              aria-disabled={isLoading}
              aria-multiline="true"
              aria-required="true"
              aria-label={language === 'el' ? 'Μήνυμα' : 'Message'}
            />
            {isLoading && (
              <div 
                className="absolute right-2 top-2 flex items-center justify-center text-gray-400"
                aria-hidden="true"
              >
                <FiLoader className="animate-spin w-4 h-4" />
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <VoiceRecordButton
              language={language}
              onResult={handleVoiceResult}
              disabled={isLoading}
            />
            
            <button
              ref={sendButtonRef}
              type="submit"
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className={`p-3 rounded-full transition-all duration-200 ${
                !message.trim() || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-gradient-to-r from-[#145199] to-[#1a62b3] text-white hover:shadow-md hover:from-[#0e3b70] hover:to-[#145199]'
              }`}
              aria-label={language === 'el' ? 'Αποστολή μηνύματος' : 'Send message'}
              aria-disabled={!message.trim() || isLoading}
            >
              <FiSend className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </form>
        
        {isLoading && (
          <div 
            className="text-xs text-center mt-2 text-gray-500"
            aria-live="polite"
            role="status"
          >
            {language === 'el' ? 'Επεξεργάζεται...' : 'Processing...'}
          </div>
        )}
      </div>
    </div>
  );
} 