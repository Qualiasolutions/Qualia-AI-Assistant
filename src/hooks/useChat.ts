import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types';
import { 
  createThread, 
  addMessageToThread, 
  runAssistant, 
  getRunStatus, 
  getMessages 
} from '@/lib/openai';

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
          const existingMessages = await getMessages(storedThreadId);
          setMessages(existingMessages);
        } else {
          // Create a new thread
          const newThreadId = await createThread();
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

      // Send message to OpenAI
      await addMessageToThread(threadId, content);
      
      // Run the assistant
      const runId = await runAssistant(threadId);
      
      // Poll for completion
      const pollInterval = setInterval(async () => {
        const status = await getRunStatus(threadId, runId);
        
        if (status === 'completed') {
          clearInterval(pollInterval);
          
          // Get updated messages
          const updatedMessages = await getMessages(threadId);
          setMessages(updatedMessages);
          setIsLoading(false);
        } else if (status === 'failed' || status === 'cancelled' || status === 'expired') {
          clearInterval(pollInterval);
          setError('Failed to process your message. Please try again.');
          setIsLoading(false);
        }
      }, 1000);
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
      const newThreadId = await createThread();
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