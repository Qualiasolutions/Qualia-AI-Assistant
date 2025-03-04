'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { speakText } from '@/lib/voice';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: Message;
  voiceEnabled: boolean;
  voiceOptions: {
    language: 'el' | 'en';
    volume: number;
    rate: number;
    pitch: number;
  };
}

export default function ChatMessage({
  message,
  voiceEnabled,
  voiceOptions,
}: ChatMessageProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Speak assistant messages if voice is enabled
  useEffect(() => {
    if (message.role === 'assistant' && voiceEnabled) {
      speakText(message.content, {
        enabled: true,
        ...voiceOptions
      });
    }
  }, [message, voiceEnabled, voiceOptions]);

  const isUser = message.role === 'user';

  // Ensure timestamp is a valid Date object
  const formatTime = () => {
    try {
      // If timestamp is already a Date object
      if (message.timestamp instanceof Date) {
        return message.timestamp.toLocaleTimeString(
          voiceOptions.language === 'el' ? 'el-GR' : 'en-US',
          { hour: '2-digit', minute: '2-digit' }
        );
      }
      
      // If timestamp is a string or number, try to convert it
      const timestamp = new Date(message.timestamp);
      if (!isNaN(timestamp.getTime())) {
        return timestamp.toLocaleTimeString(
          voiceOptions.language === 'el' ? 'el-GR' : 'en-US',
          { hour: '2-digit', minute: '2-digit' }
        );
      }
      
      // Fallback if conversion fails
      return new Date().toLocaleTimeString(
        voiceOptions.language === 'el' ? 'el-GR' : 'en-US',
        { hour: '2-digit', minute: '2-digit' }
      );
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return new Date().toLocaleTimeString(
        voiceOptions.language === 'el' ? 'el-GR' : 'en-US',
        { hour: '2-digit', minute: '2-digit' }
      );
    }
  };

  return (
    <motion.div
      className={`${isUser ? 'user-message' : 'assistant-message'} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-[#145199] rounded-full flex items-center justify-center text-white mr-2">
            Q
          </div>
        )}
        <div
          ref={contentRef}
          className="flex-1 whitespace-pre-wrap"
        >
          {message.content}
        </div>
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center ml-2">
            U
          </div>
        )}
      </div>
      <div className={`text-xs mt-1 text-gray-500 ${isUser ? 'text-right' : 'text-left'}`}>
        {formatTime()}
      </div>
    </motion.div>
  );
} 