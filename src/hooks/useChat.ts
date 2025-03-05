import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types';

// Number of messages to load per page
const MESSAGES_PER_PAGE = 20;

// Define specific error types
class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class APIError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

// Offline message queue
interface QueuedMessage {
  id: string;
  content: string;
  timestamp: Date;
  threadId: string;
}

// Client-side API calls with improved error handling
const apiClient = {
  async createThread(): Promise<string> {
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'createThread' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.error || 'Failed to create thread', 
          response.status
        );
      }
      
      const data = await response.json();
      return data.threadId;
    } catch (error) {
      if (error instanceof APIError) throw error;
      if (!navigator.onLine) throw new NetworkError('No internet connection');
      throw new Error('Failed to create thread: ' + (error instanceof Error ? error.message : String(error)));
    }
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

  async getMessages(threadId: string, limit = MESSAGES_PER_PAGE, before?: string): Promise<Message[]> {
    const queryParams = new URLSearchParams();
    if (before) queryParams.append('before', before);
    if (limit) queryParams.append('limit', limit.toString());
    
    const response = await fetch(`/api/assistant?${queryParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'getMessages', 
        threadId,
        limit,
        before
      }),
    });

    if (!response.ok) throw new Error('Failed to get messages');
    const data = await response.json();
    
    // Ensure timestamps are Date objects
    return data.messages.map((message: { id: string; role: 'user' | 'assistant'; content: string; timestamp: string | number | Date }) => ({
      ...message,
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date()
    }));
  },

  // Implement retry logic for network errors
  async withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Only retry on network errors
        if (!(error instanceof NetworkError)) {
          throw error;
        }
        
        // Wait before retrying (with exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
    
    throw lastError || new Error('Maximum retries exceeded');
  },

  // Save message to offline queue
  saveMessageToQueue(message: QueuedMessage): void {
    try {
      // Get existing queue
      const queueString = localStorage.getItem('offlineMessageQueue');
      const queue: QueuedMessage[] = queueString ? JSON.parse(queueString) : [];
      
      // Add new message to queue
      queue.push(message);
      
      // Save updated queue
      localStorage.setItem('offlineMessageQueue', JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving message to offline queue:', error);
    }
  },
  
  // Get messages from offline queue
  getMessagesFromQueue(): QueuedMessage[] {
    try {
      const queueString = localStorage.getItem('offlineMessageQueue');
      return queueString ? JSON.parse(queueString) : [];
    } catch (error) {
      console.error('Error getting messages from offline queue:', error);
      return [];
    }
  },
  
  // Clear messages from offline queue
  clearMessagesFromQueue(): void {
    localStorage.removeItem('offlineMessageQueue');
  },
  
  // Process offline message queue
  async processOfflineQueue(): Promise<boolean> {
    try {
      const queue = this.getMessagesFromQueue();
      
      if (queue.length === 0) {
        return true;
      }
      
      let success = true;
      
      // Process each message in the queue
      for (const message of queue) {
        try {
          await this.sendMessage(message.threadId, message.content);
        } catch (error) {
          console.error('Error processing offline message:', error);
          success = false;
          break;
        }
      }
      
      // If all messages were processed successfully, clear the queue
      if (success) {
        this.clearMessagesFromQueue();
      }
      
      return success;
    } catch (error) {
      console.error('Error processing offline queue:', error);
      return false;
    }
  },
};

export default function useChat() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setCurrentRunId] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Process offline queue when coming back online
  const processOfflineQueue = useCallback(async () => {
    if (isProcessingQueue || !isOnline) return;
    
    setIsProcessingQueue(true);
    try {
      await apiClient.processOfflineQueue();
    } catch (error) {
      console.error('Error processing offline queue:', error);
    } finally {
      setIsProcessingQueue(false);
    }
  }, [isProcessingQueue, isOnline]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processOfflineQueue]);

  // Initialize chat thread with retry
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Check for existing threadId in localStorage
        const storedThreadId = localStorage.getItem('chatThreadId');
        
        if (storedThreadId) {
          setThreadId(storedThreadId);
          await apiClient.withRetry(() => fetchMessages(storedThreadId));
        } else {
          const newThreadId = await apiClient.withRetry(() => apiClient.createThread());
          setThreadId(newThreadId);
          localStorage.setItem('chatThreadId', newThreadId);
        }
      } catch (err) {
        if (err instanceof AuthenticationError) {
          setError('Authentication failed. Please log in again.');
          // Handle auth error (e.g., redirect to login)
        } else if (err instanceof NetworkError) {
          setError('Network connection issue. Please check your internet connection.');
        } else {
          setError('Failed to initialize chat. Please try refreshing the page.');
        }
        console.error('Chat initialization error:', err);
      }
    };

    initializeChat();
  }, []);

  // Fetch messages for a thread
  const fetchMessages = async (threadId: string, before?: string) => {
    try {
      const fetchedMessages = await apiClient.getMessages(threadId, MESSAGES_PER_PAGE, before);
      
      // If we got exactly MESSAGES_PER_PAGE messages, there might be more
      setHasMoreMessages(fetchedMessages.length === MESSAGES_PER_PAGE);
      
      return fetchedMessages;
    } catch (err) {
      console.error('Error fetching messages:', err);
      throw err;
    }
  };

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!threadId || isLoadingMore || !hasMoreMessages) return;
    
    setIsLoadingMore(true);
    try {
      // Get the oldest message ID to use as the 'before' parameter
      const oldestMessageId = messages.length > 0 ? 
        messages[messages.length - 1].id : 
        undefined;
      
      const olderMessages = await fetchMessages(threadId, oldestMessageId);
      
      // Append older messages to the end of the list
      setMessages(prevMessages => [...prevMessages, ...olderMessages]);
    } catch (err) {
      setError('Failed to load more messages');
      console.error('Error loading more messages:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Send a message with offline support
  const sendMessage = async (message: string) => {
    if (!threadId) {
      console.error("No thread ID available");
      setError("Chat not initialized. Please refresh the page.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Send message to API and start the run
      const runId = await apiClient.sendMessage(threadId, message);
      setCurrentRunId(runId);
      
      // Poll for completion
      await pollForCompletion(threadId, runId);
      
      // Fetch updated messages after completion
      const updatedMessages = await fetchMessages(threadId);
      setMessages(updatedMessages);
    } catch (err) {
      if (err instanceof NetworkError) {
        // Store in offline queue if it's a network error
        apiClient.saveMessageToQueue({
          id: `temp-${Date.now()}`,
          content: message,
          timestamp: new Date(),
          threadId,
        });
        
        setError('Network error. Your message will be sent when you reconnect.');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        console.error('Send message error:', err);
      }
    } finally {
      setIsLoading(false);
      setCurrentRunId(null);
    }
  };

  // Poll for run completion
  const pollForCompletion = async (threadId: string, runId: string) => {
    let status = 'in_progress';
    
    while (status !== 'completed' && status !== 'failed' && status !== 'cancelled') {
      // Add a small delay to avoid hammering the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        status = await apiClient.getRunStatus(threadId, runId);
      } catch (err) {
        console.error('Error polling run status:', err);
        break;
      }
    }
    
    return status === 'completed';
  };

  // Reset thread
  const resetThread = async (welcomeMessage?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newThreadId = await apiClient.resetThread(welcomeMessage);
      setThreadId(newThreadId);
      localStorage.setItem('chatThreadId', newThreadId);
      
      // Fetch initial messages for the new thread
      const initialMessages = await fetchMessages(newThreadId);
      setMessages(initialMessages);
      
      return true;
    } catch (err) {
      setError('Failed to reset conversation');
      console.error('Reset thread error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Force reset (for development/testing)
  const forceReset = async () => {
    localStorage.removeItem('chatThreadId');
    setThreadId(null);
    setMessages([]);
    
    try {
      const newThreadId = await apiClient.withRetry(() => apiClient.createThread());
      setThreadId(newThreadId);
      localStorage.setItem('chatThreadId', newThreadId);
      
      // Fetch initial messages
      const initialMessages = await fetchMessages(newThreadId);
      setMessages(initialMessages);
    } catch (err) {
      setError('Failed to force reset');
      console.error('Force reset error:', err);
    }
  };

  return {
    threadId,
    messages,
    isLoading,
    isLoadingMore,
    hasMoreMessages,
    error,
    sendMessage,
    resetThread,
    forceReset,
    setMessages,
    loadMoreMessages,
    isOnline,
    isProcessingQueue,
  };
} 