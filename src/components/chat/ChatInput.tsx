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
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setMessage(transcript);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-card p-4 sticky bottom-0 backdrop-blur-md bg-white/80 dark:bg-gray-900/80">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-2 relative rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-1 bg-white dark:bg-gray-800">
          <div className="flex-grow relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'el' ? 'Γράψτε το μήνυμά σας...' : 'Type your message...'}
              className="w-full min-h-[45px] max-h-[150px] py-2 px-3 resize-none bg-transparent focus:outline-none text-gray-800 dark:text-gray-200"
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-2 top-2 flex items-center justify-center text-gray-400">
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
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className={`p-3 rounded-full transition-all duration-200 ${
                !message.trim() || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-gradient-to-r from-[#145199] to-[#1a62b3] text-white hover:shadow-md hover:from-[#0e3b70] hover:to-[#145199]'
              }`}
              aria-label="Send message"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {isLoading && (
          <div className="text-xs text-center mt-2 text-gray-500">
            {language === 'el' ? 'Επεξεργάζεται...' : 'Processing...'}
          </div>
        )}
      </div>
    </div>
  );
} 