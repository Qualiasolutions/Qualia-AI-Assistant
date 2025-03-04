'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
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
    <div className="border-t border-gray-200 dark:border-gray-700 bg-card p-4">
      <div className="flex items-end space-x-2">
        <div className="flex-grow">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'el' ? 'Γράψτε το μήνυμά σας...' : 'Type your message...'}
            className="input-field w-full min-h-[45px] max-h-[150px] py-2 px-3 resize-none"
            disabled={isLoading}
          />
        </div>
        
        <VoiceRecordButton
          language={language}
          onResult={handleVoiceResult}
          disabled={isLoading}
        />
        
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading}
          className={`p-3 rounded-full ${
            !message.trim() || isLoading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              : 'bg-[#145199] text-white hover:bg-[#0e3b70]'
          } transition-colors`}
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 