import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types';

// Client-side API calls
const apiClient = {
  async createThread(): Promise<string> {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'createThread' }),
    });

    if (!response.ok) throw new Error('Failed to create thread');
    const data = await response.json();
    return data.threadId;
  },

  async resetThread(welcomeMessage?: string): Promise<string> {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'resetThread',
        message: welcomeMessage
      }),
    });

    if (!response.ok) throw new Error('Failed to reset thread');
    const data = await response.json();
    return data.threadId;
  },

  async sendMessage(threadId: string, message: string): Promise<string> {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'sendMessage', threadId, message }),
    });

    if (!response.ok) throw new Error('Failed to send message');
    const data = await response.json();
    return data.runId;
  },

  async getRunStatus(threadId: string, runId: string): Promise<string> {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'getRunStatus', threadId, runId }),
    });

    if (!response.ok) throw new Error('Failed to get run status');
    const data = await response.json();
    return data.status;
  },

  async getMessages(threadId: string): Promise<Message[]> {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'getMessages', threadId }),
    });

    if (!response.ok) throw new Error('Failed to get messages');
    const data = await response.json();
    
    // Ensure timestamps are Date objects
    return data.messages.map((message: { id: string; role: 'user' | 'assistant'; content: string; timestamp: string | number | Date }) => ({
      ...message,
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date()
    }));
  },
};

export default function useChat() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize thread
  useEffect(() => {
    const initializeThread = async () => {
      try {
        // Check if there's a thread ID in localStorage
        const storedThreadId = localStorage.getItem('threadId');
        
        if (storedThreadId) {
          setThreadId(storedThreadId);
          // Load messages from the existing thread
          const existingMessages = await apiClient.getMessages(storedThreadId);
          setMessages(existingMessages);
        } else {
          // Create a new thread
          const newThreadId = await apiClient.createThread();
          setThreadId(newThreadId);
          localStorage.setItem('threadId', newThreadId);
        }
      } catch (err) {
        setError('Failed to initialize chat. Please try again.');
        console.error('Error initializing thread:', err);
      }
    };

    initializeThread();
  }, []);

  // Send message to assistant
  const sendMessage = useCallback(async (content: string) => {
    if (!threadId || !content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to UI immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, userMessage]);

      // Send message to API
      const runId = await apiClient.sendMessage(threadId, content);
      
      // Store intervalId so we can clear it in case of component unmount
      let pollIntervalId: NodeJS.Timeout;
      
      // Add timeout handling
      const MAX_POLLING_TIME = 30000; // 30 seconds max wait time
      const startTime = Date.now();
      
      // Create a promise that will resolve when polling is complete
      const pollingPromise = new Promise<void>((resolve, reject) => {
        // Poll for completion
        pollIntervalId = setInterval(async () => {
          try {
            // Check if we've exceeded maximum polling time
            if (Date.now() - startTime > MAX_POLLING_TIME) {
              clearInterval(pollIntervalId);
              setError('Request timed out. Please try again.');
              setIsLoading(false);
              reject(new Error('Polling timeout exceeded'));
              return;
            }
            
            const status = await apiClient.getRunStatus(threadId, runId);
            
            if (status === 'completed') {
              clearInterval(pollIntervalId);
              
              // Get updated messages
              const updatedMessages = await apiClient.getMessages(threadId);
              setMessages(updatedMessages);
              setIsLoading(false);
              resolve();
            } else if (status === 'failed' || status === 'cancelled' || status === 'expired') {
              clearInterval(pollIntervalId);
              setError('Failed to process your message. Please try again.');
              setIsLoading(false);
              reject(new Error(`Run failed with status: ${status}`));
            }
          } catch (err) {
            clearInterval(pollIntervalId);
            reject(err);
          }
        }, 1000);
      });
      
      // Handle potential errors from the polling promise
      pollingPromise.catch((err) => {
        console.error('Error during message polling:', err);
        setError('Failed to process your message. Please try again.');
        setIsLoading(false);
      });

      return pollingPromise;
    } catch (err) {
      setError('Failed to send message. Please try again.');
      setIsLoading(false);
      console.error('Error sending message:', err);
    }
  }, [threadId]);

  // Reset thread
  const resetThread = useCallback(async () => {
    try {
      setIsLoading(true);
      // Create a new thread
      const newThreadId = await apiClient.createThread();
      setThreadId(newThreadId);
      localStorage.setItem('threadId', newThreadId);
      setMessages([]);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to reset chat. Please try again.');
      console.error('Error resetting thread:', err);
      setIsLoading(false);
    }
  }, []);

  // Force reset with a welcome message if stuck
  const forceReset = useCallback(async () => {
    try {
      setIsLoading(true);
      // Create a completely new thread and add a welcome message
      const welcomeMessage = 'Welcome to Tzironis Business Suite! How can I assist you today?';
      const newThreadId = await apiClient.resetThread(welcomeMessage);
      setThreadId(newThreadId);
      localStorage.setItem('threadId', newThreadId);
      
      // Wait a moment for the welcome message to be processed
      setTimeout(async () => {
        // Get the welcome message
        try {
          const initialMessages = await apiClient.getMessages(newThreadId);
          setMessages(initialMessages);
        } catch (e) {
          console.error('Error getting initial messages:', e);
          setMessages([{
            id: `welcome-${Date.now()}`,
            role: 'assistant',
            content: welcomeMessage,
            timestamp: new Date()
          }]);
        } finally {
          setIsLoading(false);
          setError(null);
        }
      }, 2000);
    } catch (err) {
      setError('Failed to reset chat. Please refresh the page.');
      console.error('Error force resetting thread:', err);
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetThread,
    forceReset,
    setMessages
  };
} 