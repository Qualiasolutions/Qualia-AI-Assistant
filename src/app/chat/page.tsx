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
import SearchBar from '@/components/search/SearchBar';
import useChat from '@/hooks/useChat';
import useSettings from '@/hooks/useSettings';
import useLeads from '@/hooks/useLeads';
import { stopSpeaking } from '@/lib/voice';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiRefreshCw, FiGlobe } from 'react-icons/fi';
import { Message } from '@/types';
import useSearch from '@/hooks/useSearch';

export default function ChatPage() {
  const router = useRouter();
  const { messages, isLoading, sendMessage, resetThread, setMessages, forceReset } = useChat();
  const { settings, setLanguage, toggleVoice } = useSettings();
  const { extractLeadsFromMessage, createLead } = useLeads();
  const { search } = useSearch();
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedMessagesRef = useRef<Set<string>>(new Set());
  const [activeSidebar, setActiveSidebar] = useState<'left' | 'right' | null>(null);
  const [input, setInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [previousConversation, setPreviousConversation] = useState<Message[]>([]);

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

  // Process assistant messages for leads
  useEffect(() => {
    const processLeads = async () => {
      // Only check if there are messages and we're not in a loading state
      if (messages.length === 0 || isLoading) return;
      
      // Find the most recent assistant message
      const assistantMessages = [...messages].filter(msg => msg.role === 'assistant');
      if (assistantMessages.length === 0) return;
      
      // Get the latest message
      const latestMessage = assistantMessages[assistantMessages.length - 1];
      
      // Only process if we haven't seen this message ID before
      if (!processedMessagesRef.current.has(latestMessage.id)) {
        // Extract leads from the message
        const potentialLeads = extractLeadsFromMessage(latestMessage.content);
        
        // Create leads if any were found
        if (potentialLeads.length > 0) {
          for (const leadData of potentialLeads) {
            await createLead(leadData);
          }
        }
        
        // Mark as processed
        processedMessagesRef.current.add(latestMessage.id);
      }
    };
    
    processLeads();
  }, [messages, isLoading, extractLeadsFromMessage, createLead]);

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
    setShowInfo(false);
    setShowSearch(false);
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

  // Handle web search results
  const handleSearchComplete = (searchText: string, searchResults: string) => {
    // Remove the searching message
    setMessages(prev => prev.filter(msg => !msg.id.startsWith('searching-')));
    
    // Create system message with web search results
    const searchContextMessage: Message = {
      id: `context-${Date.now()}`,
      role: 'system',
      content: `Web search results for "${searchText}":\n\n${searchResults}`,
      timestamp: new Date(),
    };
    
    // Add user query message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: searchText,
      timestamp: new Date(),
    };
    
    // Add messages to the chat
    setMessages(prev => [...prev, userMessage, searchContextMessage]);
    
    // Trigger the assistant to respond with a placeholder message
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: 'Analyzing search results...',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    
    // Process message with backend
    sendMessage(searchText);
  };

  // Detect if the message needs a web search
  const handleSendMessage = (text: string) => {
    // Check if the message appears to be a question that might benefit from web search
    const needsWebSearch = 
      (text.includes('?') || 
       text.toLowerCase().startsWith('what') || 
       text.toLowerCase().startsWith('how') || 
       text.toLowerCase().startsWith('why') || 
       text.toLowerCase().startsWith('when') || 
       text.toLowerCase().startsWith('where') ||
       text.toLowerCase().startsWith('who') ||
       text.toLowerCase().startsWith('which') ||
       text.toLowerCase().includes('search for') ||
       text.toLowerCase().includes('find information')) &&
      text.length > 10;

    if (needsWebSearch) {
      // Display a temporary message indicating search is happening
      const searchingMessage: Message = {
        id: `searching-${Date.now()}`,
        role: 'assistant',
        content: `I'll search the web for information about "${text}" and get back to you with what I find.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, searchingMessage]);
      
      // Perform web search automatically
      performWebSearch(text);
    } else {
      // Normal message without web search
      sendMessage(text);
    }
  };

  // Function to perform web search
  const performWebSearch = async (query: string) => {
    try {
      const results = await search(query);
      
      if (results && results.length > 0) {
        const formattedResults = results.map((result, index) => {
          return `[${index + 1}] ${result.title}\n${result.snippet}\nSource: ${result.link}\n`;
        }).join('\n');
        
        // Send the search results to the assistant
        handleSearchComplete(query, formattedResults);
      } else {
        // No results found
        const noResultsMessage: Message = {
          id: `no-results-${Date.now()}`,
          role: 'assistant',
          content: `I searched the web for "${query}" but couldn't find relevant information. Let me answer based on what I know.`,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, noResultsMessage]);
        sendMessage(query);
      }
    } catch (error) {
      console.error('Search error:', error);
      
      // Send message without search results
      sendMessage(query);
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

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Business Data */}
        <Sidebar position="left">
          <DataSidebar />
        </Sidebar>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col max-w-full">
          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Message list */}
              <div className="space-y-6">
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
            </div>
          </div>

          {/* Input area with chat input and voice chat */}
          <div className="p-3 md:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg shadow-lg">
            <div className="max-w-4xl mx-auto">
              <ChatInput 
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                language={settings.language || 'en'}
              />
              <div className="mt-2">
                <VoiceChat
                  voiceOptions={settings.voice}
                  language={settings.language || 'en'}
                  onSpeechResult={handleSendMessage}
                  isProcessing={isLoading}
                />
              </div>
            </div>
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
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{settings.language === 'el' ? 'Πληροφορίες' : 'Information'}</h2>
                <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p>
                  {settings.language === 'el'
                    ? 'Ο βοηθός τεχνητής νοημοσύνης Qualia για το Tzironis Business Suite είναι σχεδιασμένος να σας βοηθήσει με εργασίες όπως διαχείριση πελατών, δημιουργία τιμολογίων και απάντηση σε ερωτήσεις σχετικά με την επιχείρησή σας.'
                    : 'The Qualia AI assistant for Tzironis Business Suite is designed to help you with tasks like customer management, invoice creation, and answering questions about your business.'}
                </p>
                <p>
                  {settings.language === 'el'
                    ? 'Χρησιμοποιεί προηγμένη τεχνολογία επεξεργασίας φυσικής γλώσσας για να κατανοήσει τις ερωτήσεις σας και να παρέχει χρήσιμες απαντήσεις.'
                    : 'It uses advanced natural language processing technology to understand your questions and provide helpful answers.'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 