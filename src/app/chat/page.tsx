'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessage from '@/components/chat/ChatMessage';
import VoiceChat from '@/components/chat/VoiceChat';
import Sidebar from '@/components/ui/Sidebar';
import DataSidebar from '@/components/ui/DataSidebar';
import InfoSidebar from '@/components/ui/InfoSidebar';
import useChat from '@/hooks/useChat';
import useSettings from '@/hooks/useSettings';
import { stopSpeaking } from '@/lib/voice';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiRefreshCw } from 'react-icons/fi';
import { Message } from '@/types';

export default function ChatPage() {
  const router = useRouter();
  const { messages, isLoading, sendMessage, resetThread, setMessages, forceReset } = useChat();
  const { settings, setLanguage, toggleVoice } = useSettings();
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  }, [messages, isLoading, setMessages]);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
          router.push('/auth');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/auth');
      }
    };

    checkAuth();
  }, [router]);

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

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  const handleNewChat = () => {
    stopSpeaking();
    resetThread();
  };
  
  const handleVoiceResult = (text: string) => {
    if (text.trim()) {
      sendMessage(text);
    }
  };

  // Add a recovery function for stuck states
  const handleForceReset = () => {
    stopSpeaking();
    forceReset();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header
        language={settings.language}
        voiceEnabled={settings.voice.enabled}
        onLanguageChange={setLanguage}
        onVoiceToggle={toggleVoice}
        onSettingsClick={handleSettingsClick}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Business Data */}
        <Sidebar position="left">
          <DataSidebar />
        </Sidebar>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col max-w-full">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="sticky top-0 z-10 mb-4 flex justify-center space-x-2">
              <motion.button
                onClick={handleNewChat}
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center space-x-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPlus className="mr-1" />
                <span>{settings.language === 'el' ? 'Νέα συνομιλία' : 'New Chat'}</span>
              </motion.button>

              {isLoading && (
                <motion.button
                  onClick={handleForceReset}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Reset if stuck"
                >
                  <FiRefreshCw className="mr-1" />
                  <span>{settings.language === 'el' ? 'Επαναφορά' : 'Reset'}</span>
                </motion.button>
              )}
            </div>
            
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
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
                className="flex items-center space-x-2 p-4 text-gray-500"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Chat UI */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2">
            <VoiceChat
              voiceOptions={settings.voice}
              language={settings.language}
              onSpeechResult={handleVoiceResult}
              isProcessing={isLoading}
            />
          </div>

          {/* Chat Input */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <ChatInput 
              onSendMessage={sendMessage} 
              isLoading={isLoading}
              language={settings.language}
            />
          </div>
        </div>

        {/* Right Sidebar - Information */}
        <Sidebar position="right">
          <InfoSidebar />
        </Sidebar>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">About Qualia AI Assistant</h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="prose dark:prose-invert">
                <p>
                  Qualia AI is an intelligent assistant designed specifically for Tzironis business
                  operations. It can help with:
                </p>
                <ul>
                  <li>Answering questions about products and inventory</li>
                  <li>Generating sales leads</li>
                  <li>Creating invoices</li>
                  <li>Providing business insights</li>
                </ul>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Version 1.0.0 | Powered by Mistral AI
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 