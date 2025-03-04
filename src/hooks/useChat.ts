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
      
      // Create a promise that will resolve when polling is complete
      const pollingPromise = new Promise<void>((resolve, reject) => {
        // Poll for completion
        pollIntervalId = setInterval(async () => {
          try {
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
      // Create a new thread
      const newThreadId = await apiClient.createThread();
      setThreadId(newThreadId);
      localStorage.setItem('threadId', newThreadId);
      setMessages([]);
      setError(null);
    } catch (err) {
      setError('Failed to reset chat. Please try again.');
      console.error('Error resetting thread:', err);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetThread,
  };
} 