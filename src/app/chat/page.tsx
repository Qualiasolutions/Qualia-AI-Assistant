'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessage from '@/components/chat/ChatMessage';
import { Message } from '@/types';
import useChat from '@/hooks/useChat';
import useSettings from '@/hooks/useSettings';
import { stopSpeaking } from '@/lib/voice';
import { motion } from 'framer-motion';

export default function ChatPage() {
  const router = useRouter();
  const { messages, isLoading, error, sendMessage, resetThread } = useChat();
  const { settings, setTheme, setLanguage, toggleVoice } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    setShowSettings(!showSettings);
  };

  const handleNewChat = () => {
    stopSpeaking();
    resetThread();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        language={settings.language}
        voiceEnabled={settings.voice.enabled}
        onLanguageChange={setLanguage}
        onVoiceToggle={toggleVoice}
        onSettingsClick={handleSettingsClick}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-[#145199] text-white h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              Q
            </div>
            <h2 className="text-xl font-bold mb-2">
              {settings.language === 'el' ? 'Καλώς ήρθατε στο Qualia AI' : 'Welcome to Qualia AI'}
            </h2>
            <p className="text-gray-500 max-w-md mb-8">
              {settings.language === 'el'
                ? 'Ο βοηθός AI της Tzironis είναι εδώ για να σας βοηθήσει με τη δημιουργία νέων επαφών, τη δημιουργία τιμολογίων και ερωτήσεις για προϊόντα.'
                : 'Your Tzironis AI assistant is here to help you with lead generation, invoice creation, and product inquiries.'}
            </p>
            <div className="flex flex-col space-y-2 w-full max-w-md">
              {[
                settings.language === 'el'
                  ? 'Βρες μου πιθανούς πελάτες στον κλάδο των επίπλων στην Αθήνα'
                  : 'Find me potential clients in the furniture industry in Athens',
                settings.language === 'el'
                  ? 'Δημιούργησε τιμολόγιο για την Furniture World για 3 τραπέζια φαγητού στα €250 το καθένα'
                  : 'Create invoice for Furniture World for 3 dining tables at €250 each',
                settings.language === 'el'
                  ? 'Τι καναπέδες έχουμε διαθέσιμους;'
                  : 'What sofas do we currently have in stock?',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(suggestion)}
                  className="text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              <button
                onClick={handleNewChat}
                className="btn-secondary text-sm"
              >
                {settings.language === 'el' ? 'Νέα συνομιλία' : 'New Chat'}
              </button>
            </div>
            
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                voiceEnabled={settings.voice.enabled}
                voiceOptions={settings.voice}
              />
            ))}
            
            {isLoading && (
              <motion.div
                className="assistant-message mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#145199] rounded-full flex items-center justify-center text-white mr-2">
                    Q
                  </div>
                  <div className="flex-1">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput
        onSendMessage={sendMessage}
        isLoading={isLoading}
        language={settings.language}
      />
    </div>
  );
} 