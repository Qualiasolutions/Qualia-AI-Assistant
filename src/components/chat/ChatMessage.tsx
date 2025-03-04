'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Message } from '@/types';
import { speakText } from '@/lib/voice';
import { motion } from 'framer-motion';
import { FiUser, FiMessageSquare } from 'react-icons/fi';

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

  // Memoize the formatted time to prevent unnecessary re-renders
  const formattedTime = useMemo(() => {
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
  }, [message.timestamp, voiceOptions.language]);

  return (
    <motion.div
      className={`w-full mb-5 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex max-w-[80%] md:max-w-[70%]`}>
        {!isUser && (
          <div className="flex-shrink-0 h-9 w-9 bg-gradient-to-br from-[#145199] to-[#0a2d5c] rounded-full flex items-center justify-center text-white mr-2 shadow-md">
            <FiMessageSquare className="w-4 h-4" />
          </div>
        )}
        
        <div className="flex flex-col">
          <div 
            ref={contentRef}
            className={`
              py-3 px-4 rounded-2xl shadow-sm
              ${isUser 
                ? 'bg-gradient-to-r from-[#145199] to-[#1a62b3] text-white' 
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }
            `}
          >
            <div className="whitespace-pre-wrap text-sm">
              {message.content}
            </div>
          </div>
          
          <div className={`text-xs mt-1 text-gray-500 flex items-center ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="opacity-70">{formattedTime}</span>
          </div>
        </div>
        
        {isUser && (
          <div className="flex-shrink-0 h-9 w-9 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center ml-2 shadow-md">
            <FiUser className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </div>
        )}
      </div>
    </motion.div>
  );
} 