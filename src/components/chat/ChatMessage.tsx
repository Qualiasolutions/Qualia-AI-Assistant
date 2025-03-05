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
      className={`w-full mb-6 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="listitem"
      aria-label={isUser ? ariaLabels.user : isSystem ? ariaLabels.system : ariaLabels.assistant}
    >
      <div 
        className={`flex max-w-[85%] md:max-w-[75%]`}
        tabIndex={0}
      >
        {!isUser && !isSystem && (
          <div 
            className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#0077ff] to-[#00c2ff] rounded-xl flex items-center justify-center text-white mr-3 shadow-lg backdrop-blur-sm"
            aria-hidden="true"
          >
            <FiCpu className="w-5 h-5" />
          </div>
        )}
        
        <div className="flex flex-col">
          <div 
            ref={contentRef}
            className={`
              py-4 px-5 rounded-2xl shadow-md backdrop-blur-sm
              ${isSystem 
                ? 'bg-amber-50/80 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/30 text-amber-800 dark:text-amber-200'
                : isUser 
                  ? 'bg-gradient-to-r from-[#145199] to-[#1a62b3] text-white border border-blue-400/20 dark:border-blue-500/20' 
                  : 'bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50'
              }
              ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}
              ${isSystem ? 'ring-2 ring-amber-200/20 dark:ring-amber-700/20' : ''}
            `}
            aria-live={isUser ? 'off' : 'polite'}
          >
            <div className="whitespace-pre-wrap text-sm">
              {message.content}
            </div>
          </div>
          
          <div 
            className={`text-xs mt-1.5 text-gray-500 flex items-center ${isUser ? 'justify-end mr-1' : 'justify-start ml-1'}`}
            aria-label={`${ariaLabels.sentAt} ${formattedTime}`}
          >
            <span className="opacity-70">{formattedTime}</span>
          </div>
        </div>
        
        {isUser && (
          <div 
            className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-400 to-blue-500 dark:from-indigo-500 dark:to-blue-600 rounded-xl flex items-center justify-center ml-3 shadow-lg backdrop-blur-sm"
            aria-hidden="true"
          >
            <FiUser className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
} 