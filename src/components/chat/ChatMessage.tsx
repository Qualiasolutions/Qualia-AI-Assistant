'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Message } from '@/types';
import { speakText } from '@/lib/voice';
import { motion } from 'framer-motion';
import { FiUser, FiMessageSquare, FiCpu } from 'react-icons/fi';

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
  const isSystem = message.role === 'system';

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

  // Get appropriate ARIA labels based on language
  const getAriaLabels = () => {
    if (voiceOptions.language === 'el') {
      return {
        user: 'Μήνυμα χρήστη',
        assistant: 'Μήνυμα βοηθού',
        system: 'Μήνυμα συστήματος',
        sentAt: 'Στάλθηκε στις'
      };
    }
    return {
      user: 'User message',
      assistant: 'Assistant message',
      system: 'System message',
      sentAt: 'Sent at'
    };
  };

  const ariaLabels = getAriaLabels();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-3`}
    >
      <div 
        className={`flex max-w-[85%] md:max-w-[75%]`}
        tabIndex={0}
      >
        {!isUser && !isSystem && (
          <div 
            className="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded flex items-center justify-center text-white mr-3 shadow-sm"
            aria-hidden="true"
          >
            <FiCpu className="w-4 h-4" />
          </div>
        )}
        
        <div className="flex flex-col">
          <div 
            ref={contentRef}
            className={`
              py-3 px-4 rounded shadow-sm
              ${isSystem 
                ? 'bg-amber-50 dark:bg-amber-900/40 border-l-4 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-200'
                : isUser 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white' 
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }
            `}
            aria-live={isUser ? 'off' : 'polite'}
          >
            <div className="whitespace-pre-wrap text-sm">
              {message.content}
            </div>
          </div>
          
          <div 
            className={`text-xs mt-1 text-gray-500 flex items-center ${isUser ? 'justify-end mr-1' : 'justify-start ml-1'}`}
            aria-label={`${ariaLabels.sentAt} ${formattedTime}`}
          >
            <span className="opacity-70">{formattedTime}</span>
          </div>
        </div>
        
        {isUser && (
          <div 
            className="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded flex items-center justify-center ml-3 shadow-sm"
            aria-hidden="true"
          >
            <FiUser className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
}