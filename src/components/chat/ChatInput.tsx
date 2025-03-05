'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiLoader, FiCommand } from 'react-icons/fi';

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
      className="sticky bottom-0 backdrop-blur-md z-10"
      role="region"
      aria-label={language === 'el' ? 'Περιοχή εισαγωγής μηνύματος' : 'Message input area'}
    >
      <div className="max-w-4xl mx-auto">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end space-x-2 relative rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
        >
          <div className="absolute bottom-4 left-4 text-xs text-gray-400 dark:text-gray-500 flex items-center">
            <FiCommand className="w-3 h-3 mr-1" />
            <span>Enter to send</span>
          </div>
          
          <div className="flex-grow relative mt-6">
            <textarea
              id="message-input"
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'el' ? 'Γράψτε το μήνυμά σας...' : 'Type your message...'}
              className="w-full min-h-[45px] max-h-[150px] py-3 px-3 resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/40 rounded-xl text-gray-800 dark:text-gray-200 border-0"
              disabled={isLoading}
              aria-disabled={isLoading}
              aria-multiline="true"
              aria-required="true"
              aria-label={language === 'el' ? 'Μήνυμα' : 'Message'}
            />
            {isLoading && (
              <div 
                className="absolute right-3 bottom-3 flex items-center justify-center text-gray-400"
                aria-hidden="true"
              >
                <FiLoader className="animate-spin w-4 h-4" />
              </div>
            )}
          </div>
          
          <div className="flex items-center pb-2 pr-1">
            <button
              ref={sendButtonRef}
              type="submit"
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className={`p-3.5 rounded-xl transition-all duration-300 ${
                !message.trim() || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-md hover:shadow-blue-500/20 hover:from-blue-600 hover:to-indigo-700'
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