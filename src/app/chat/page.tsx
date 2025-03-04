'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessage from '@/components/chat/ChatMessage';
import VoiceChat from '@/components/chat/VoiceChat';
import useChat from '@/hooks/useChat';
import useSettings from '@/hooks/useSettings';
import { stopSpeaking } from '@/lib/voice';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiInfo } from 'react-icons/fi';

export default function ChatPage() {
  const router = useRouter();
  const { messages, isLoading, error, sendMessage, resetThread } = useChat();
  const { settings, setLanguage, toggleVoice } = useSettings();
  const [showInfo, setShowInfo] = useState(false);
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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header
        language={settings.language}
        voiceEnabled={settings.voice.enabled}
        onLanguageChange={setLanguage}
        onVoiceToggle={toggleVoice}
        onSettingsClick={handleSettingsClick}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center h-[calc(100vh-180px)] text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative mb-8">
                <div className="bg-[#145199] text-white h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">
                  Q
                </div>
                <motion.div 
                  className="absolute -top-2 -right-2 bg-green-500 h-6 w-6 rounded-full border-2 border-white dark:border-gray-950"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
              
              <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                {settings.language === 'el' ? 'Καλώς ήρθατε στο Qualia AI' : 'Welcome to Qualia AI'}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 max-w-md mb-10 text-lg">
                {settings.language === 'el'
                  ? 'Ο βοηθός AI της Tzironis είναι εδώ για να σας βοηθήσει με τη δημιουργία νέων επαφών, τη δημιουργία τιμολογίων και ερωτήσεις για προϊόντα.'
                  : 'Your Tzironis AI assistant is here to help you with lead generation, invoice creation, and product inquiries.'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {[
                  {
                    icon: '🏢',
                    title: settings.language === 'el' ? 'Εύρεση πελατών' : 'Find clients',
                    prompt: settings.language === 'el'
                      ? 'Βρες μου πιθανούς πελάτες στον κλάδο των επίπλων στην Αθήνα'
                      : 'Find me potential clients in the furniture industry in Athens'
                  },
                  {
                    icon: '📝',
                    title: settings.language === 'el' ? 'Δημιουργία τιμολογίου' : 'Create invoice',
                    prompt: settings.language === 'el'
                      ? 'Δημιούργησε τιμολόγιο για την Furniture World για 3 τραπέζια φαγητού στα €250 το καθένα'
                      : 'Create invoice for Furniture World for 3 dining tables at €250 each'
                  },
                  {
                    icon: '🛋️',
                    title: settings.language === 'el' ? 'Έλεγχος αποθεμάτων' : 'Check inventory',
                    prompt: settings.language === 'el'
                      ? 'Τι καναπέδες έχουμε διαθέσιμους;'
                      : 'What sofas do we currently have in stock?'
                  },
                  {
                    icon: '🔍',
                    title: settings.language === 'el' ? 'Γενική ερώτηση' : 'General inquiry',
                    prompt: settings.language === 'el'
                      ? 'Ποια είναι τα βήματα για τη δημιουργία μιας νέας παραγγελίας;'
                      : 'What are the steps to create a new order?'
                  }
                ].map((suggestion, i) => (
                  <motion.button
                    key={i}
                    onClick={() => sendMessage(suggestion.prompt)}
                    className="flex items-center p-4 text-left border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow-md dark:shadow-gray-800/20"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.3 }}
                  >
                    <span className="text-2xl mr-3">{suggestion.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">{suggestion.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{suggestion.prompt}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <motion.button 
                onClick={() => setShowInfo(!showInfo)}
                className="mt-8 text-sm text-gray-500 dark:text-gray-400 flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <FiInfo className="mr-1" />
                {settings.language === 'el' ? 'Σχετικά με τη φωνητική λειτουργία' : 'About voice features'}
              </motion.button>
              
              <AnimatePresence>
                {showInfo && (
                  <motion.div 
                    className="mt-4 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg text-sm text-blue-800 dark:text-blue-200 max-w-md"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="mb-2">
                      {settings.language === 'el' 
                        ? '✨ Νέα λειτουργία: Μπορείτε τώρα να μιλήσετε στο Qualia AI και να λάβετε φωνητικές απαντήσεις!' 
                        : '✨ New feature: You can now talk to Qualia AI and receive voice responses!'}
                    </p>
                    <p>
                      {settings.language === 'el'
                        ? 'Χρησιμοποιήστε το κουμπί φωνής στην κάτω δεξιά γωνία για συνεχή φωνητική συνομιλία. Διαμορφώστε τις φωνητικές ρυθμίσεις από τη σελίδα ρυθμίσεων.'
                        : 'Use the voice button in the bottom right corner for continuous voice chat. Configure voice settings from the settings page.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <>
              <div className="sticky top-0 z-10 mb-4 flex justify-center">
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
              
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <ChatMessage
                      message={message}
                      voiceEnabled={settings.voice.enabled}
                      voiceOptions={settings.voice}
                    />
                  </motion.div>
                ))}
              </div>
              
              {isLoading && (
                <motion.div
                  className="flex items-start space-x-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-[#145199] rounded-full flex items-center justify-center text-white font-bold">
                    Q
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              {error && (
                <motion.div 
                  className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-center space-x-2 mt-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FiX className="flex-shrink-0 w-5 h-5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      <ChatInput
        onSendMessage={sendMessage}
        isLoading={isLoading}
        language={settings.language}
      />
      
      {/* Voice Chat component */}
      <VoiceChat
        voiceOptions={settings.voice}
        language={settings.language}
        onSpeechResult={handleVoiceResult}
        isProcessing={isLoading}
      />
    </div>
  );
} 