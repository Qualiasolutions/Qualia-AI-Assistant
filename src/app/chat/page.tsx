'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessage from '@/components/chat/ChatMessage';
import { stopSpeaking } from '@/lib/voice';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiRefreshCw, FiZap } from 'react-icons/fi';
import { Message } from '@/types';
import useChat from '@/hooks/useChat';
import useSettings from '@/hooks/useSettings';
import useLeads from '@/hooks/useLeads';
import DataSidebar from '@/components/ui/DataSidebar';

export default function ChatPage() {
  const router = useRouter();
  const { messages, isLoading, sendMessage, resetThread, setMessages, forceReset } = useChat();
  const { settings, setLanguage, toggleVoice } = useSettings();
  const { extractLeadsFromMessage, createLead } = useLeads();
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

  // Process new assistant messages for lead extraction
  useEffect(() => {
    const processLeadsFromMessages = async () => {
      // Get the most recent assistant message
      const lastAssistantMessage = [...messages]
        .filter(msg => msg.role === 'assistant')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      if (lastAssistantMessage && lastAssistantMessage.id) {
        // Check if this message contains leads
        if (lastAssistantMessage.content.toLowerCase().includes('lead') && 
            !lastAssistantMessage.content.includes('processed-for-leads')) {
          
          // Extract leads from message content
          const leads = extractLeadsFromMessage(lastAssistantMessage.content);
          
          // Create leads if any were found
          if (leads && leads.length > 0) {
            for (const lead of leads) {
              await createLead(lead);
            }
            
            // Mark message as processed to avoid duplicate processing
            const updatedMessage = { 
              ...lastAssistantMessage, 
              content: lastAssistantMessage.content + '\n\n<!-- processed-for-leads -->' 
            };
            
            setMessages(messages.map(msg => 
              msg.id === lastAssistantMessage.id ? updatedMessage : msg
            ));
          }
        }
      }
    };

    if (!isLoading && messages.length > 0) {
      processLeadsFromMessages();
    }
  }, [messages, isLoading, extractLeadsFromMessage, createLead, setMessages]);

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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <Header
          language={settings.language}
          voiceEnabled={settings.voice.enabled}
          onLanguageChange={setLanguage}
          onVoiceToggle={toggleVoice}
          onSettingsClick={toggleSidebar}
          username={"Guest"}
        />
        
        {/* New Chat Button moved to header area */}
        <motion.button
          onClick={handleNewChat}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded shadow hover:shadow-md transition-all duration-300 flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus className="w-4 h-4" />
          <span>{settings.language === 'el' ? 'Νέα συνομιλία' : 'New Chat'}</span>
        </motion.button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Leads Sidebar */}
        {showSidebar && (
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto hidden md:block">
            <DataSidebar />
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col w-full">
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <div className="max-w-3xl mx-auto">
              {/* Removed New Chat Button from here */}
              
              {/* Messages - Modern style with squared corners */}
              <div className="space-y-6">
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
                    className="flex items-center space-x-3 p-4 text-gray-500 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-md max-w-[85%] mr-auto backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex space-x-2">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                    </div>
                    <span className="text-sm text-gray-400">AI is thinking...</span>
                  </motion.div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat input area with squared corners */}
          <div className="p-4 md:p-5 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-md">
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