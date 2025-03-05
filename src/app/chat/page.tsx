'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessage from '@/components/chat/ChatMessage';
import { stopSpeaking } from '@/lib/voice';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import { Message } from '@/types';
import useChat from '@/hooks/useChat';
import useSettings from '@/hooks/useSettings';
import DataSidebar from '@/components/ui/DataSidebar';

export default function ChatPage() {
  const router = useRouter();
  const { messages, isLoading, sendMessage, resetThread, setMessages, forceReset } = useChat();
  const { settings, setLanguage, toggleVoice } = useSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Add welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Welcome to Tzironis Business Suite! How can I assist you today? I can help with product information, lead generation, invoice creation, or answering any questions about your business.',
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
    }
  }, [messages.length, isLoading, setMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Stop speaking when leaving the page
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleNewChat = () => {
    stopSpeaking();
    resetThread();
  };

  const handleSendMessage = async (text: string) => {
    // Create and immediately add the user message to UI
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    
    // Add message to the chat immediately
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Then send to API
      await sendMessage(text);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Extract error message if available
      let errorMessage = 'Sorry, there was an error processing your message. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('message is still being processed')) {
          errorMessage = 'Please wait while your previous message is being processed.';
        }
      }
      
      // Add error message to chat
      const errorSystemMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: errorMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorSystemMessage]);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header
        language={settings.language}
        voiceEnabled={settings.voice.enabled}
        onLanguageChange={setLanguage}
        onVoiceToggle={toggleVoice}
        onSettingsClick={toggleSidebar}
        username={"Guest"}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Leads Sidebar */}
        {showSidebar && (
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto hidden md:block">
            <DataSidebar />
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col w-full">
          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8">
            <div className="max-w-3xl mx-auto">
              {/* New Chat Button - Centered at top */}
              <div className="mb-6 flex justify-center">
                <motion.button
                  onClick={handleNewChat}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center space-x-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPlus className="mr-1" />
                  <span>{settings.language === 'el' ? 'Νέα συνομιλία' : 'New Chat'}</span>
                </motion.button>
              </div>
              
              {/* Messages - Perplexity-style floating chat */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className={`rounded-xl shadow-md ${
                        message.role === 'user' 
                          ? 'bg-blue-50 dark:bg-blue-900/20 ml-auto max-w-[85%]' 
                          : 'bg-white dark:bg-gray-800 mr-auto max-w-[85%]'
                      }`}
                    >
                      <ChatMessage 
                        message={message} 
                        voiceEnabled={settings.voice.enabled}
                        voiceOptions={settings.voice}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center space-x-2 p-4 text-gray-500 bg-white dark:bg-gray-800 rounded-xl shadow-md max-w-[85%] mr-auto"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Input area with chat input only */}
          <div className="p-3 md:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <div className="max-w-3xl mx-auto">
              <ChatInput 
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                language={settings.language || 'en'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 