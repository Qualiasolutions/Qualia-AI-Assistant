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
  const inputRef = useRef<HTMLInputElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    // Focus input on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={language === 'el' ? 'Γράψτε το μήνυμά σας...' : 'Type your message...'}
              className="w-full p-4 pr-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
              aria-label={language === 'el' ? 'Πεδίο μηνύματος' : 'Message input field'}
              disabled={isLoading}
              ref={inputRef}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
            <button
              ref={sendButtonRef}
              type="submit"
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className={`p-3 rounded transition-all duration-300 ${
                !message.trim() || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-md'
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