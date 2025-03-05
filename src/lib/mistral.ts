import MistralClient from '@mistralai/mistralai';
import { Message } from '@/types';

interface Thread {
  id: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: number;
  }>;
  created_at: number;
}

interface Run {
  id: string;
  thread_id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  created_at: number;
}

// Thread storage in memory for development
// In production, this should be replaced with a database
const threadsStore: Record<string, Thread> = {};
const runsStore: Record<string, Run> = {};

// Create a function to initialize the Mistral client
// This should only be called on the server side
const getMistralClient = () => {
  const apiKey = process.env.MISTRAL_API_KEY;
  const modelName = process.env.MISTRAL_MODEL || 'mistral-large-latest';

  if (!apiKey) {
    console.error('MISTRAL_API_KEY environment variable is not set. Please configure it in the Vercel dashboard or .env.local file.');
    throw new Error('Missing Mistral API key. Please add this to your environment variables in the Vercel dashboard.');
  }

  try {
    const client = new MistralClient(apiKey);
    return {
      client,
      modelName
    };
  } catch (error) {
    console.error('Failed to initialize Mistral client:', error);
    throw new Error('Failed to initialize Mistral client. Please check your API key validity.');
  }
};

// Handle missing environment variables gracefully for API routes
// This prevents build failures during static analysis
const safeGetMistralClient = () => {
  try {
    return getMistralClient();
  } catch (error) {
    // During build time, return a mock client
    if (process.env.NODE_ENV === 'production' && !process.env.MISTRAL_API_KEY) {
      console.warn('Building without Mistral credentials. API functionality will not work until environment variables are set.');
      // Return a placeholder that won't be used in the actual build
      return {
        client: {} as MistralClient,
        modelName: 'placeholder-during-build'
      };
    }
    throw error;
  }
};

// Generate an ID for a new thread
function generateId(): string {
  return `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Create a new thread
export async function createThread(): Promise<string> {
  try {
    const threadId = generateId();
    
    // Initialize empty thread
    threadsStore[threadId] = {
      id: threadId,
      messages: [],
      created_at: Date.now()
    };
    
    return threadId;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw new Error('Failed to create conversation thread');
  }
}

// Add a message to a thread
export async function addMessageToThread(threadId: string, content: string): Promise<void> {
  try {
    // Check if thread exists
    if (!threadsStore[threadId]) {
      throw new Error(`Thread ${threadId} not found`);
    }
    
    // Cancel any active runs
    const activeRuns = Object.values(runsStore).filter(
      run => run.thread_id === threadId && ['queued', 'in_progress'].includes(run.status)
    );
    
    for (const run of activeRuns) {
      run.status = 'cancelled';
    }
    
    // Add message to thread
    const messageId = generateId();
    threadsStore[threadId].messages.push({
      id: messageId,
      role: 'user',
      content,
      created_at: Date.now()
    });
  } catch (error) {
    console.error('Error adding message to thread:', error);
    throw new Error('Failed to send message');
  }
}

// Run the assistant on a thread
export async function runAssistant(threadId: string): Promise<string> {
  try {
    const { client, modelName } = getMistralClient();
    const thread = threadsStore[threadId];
    
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }
    
    // Create a new run
    const runId = generateId();
    runsStore[runId] = {
      id: runId,
      thread_id: threadId,
      status: 'in_progress',
      created_at: Date.now()
    };
    
    // Format messages for Mistral API
    const messages = thread.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add system message to instruct the model
    const systemMessage = {
      role: 'system',
      content: 'You are a helpful business assistant for Tzironis Business Suite. Help with product information, lead generation, invoice creation, and business questions. When generating leads, include company name, industry, location, and contact details when available.'
    };
    
    // Execute the chat completion in a non-blocking way
    setTimeout(async () => {
      try {
        // Call Mistral API
        console.log('Calling Mistral API with model:', modelName);
        const response = await client.chat({
          model: modelName,
          messages: [systemMessage, ...messages],
        });
        
        // Add assistant response to thread
        if (response.choices[0]?.message) {
          thread.messages.push({
            id: generateId(),
            role: 'assistant',
            content: response.choices[0].message.content,
            created_at: Date.now()
          });
        }
        
        // Update run status
        runsStore[runId].status = 'completed';
      } catch (error) {
        console.error('Error in Mistral chat completion:', error);
        runsStore[runId].status = 'failed';
      }
    }, 0);
    
    return runId;
  } catch (error) {
    console.error('Error running assistant:', error);
    throw new Error('Failed to process message');
  }
}

// Get the status of a run
export async function getRunStatus(threadId: string, runId: string): Promise<string> {
  try {
    // Check if run exists
    const run = runsStore[runId];
    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }
    
    return run.status;
  } catch (error) {
    console.error('Error getting run status:', error);
    throw new Error('Failed to check message status');
  }
}

// Get messages from a thread
export async function getMessages(threadId: string, limit = 20, before?: string): Promise<Message[]> {
  try {
    // Check if thread exists
    const thread = threadsStore[threadId];
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }
    
    // Clone messages to avoid mutations
    let messages = [...thread.messages];
    
    // Sort by creation time (newest first)
    messages.sort((a, b) => b.created_at - a.created_at);
    
    // Apply 'before' filter if provided
    if (before) {
      const beforeIndex = messages.findIndex(msg => msg.id === before);
      if (beforeIndex !== -1) {
        messages = messages.slice(beforeIndex + 1);
      }
    }
    
    // Apply limit
    messages = messages.slice(0, limit);
    
    // Format messages for the frontend
    return messages.map(message => ({
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: new Date(message.created_at),
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    throw new Error('Failed to retrieve messages');
  }
}

// Export the client
export default (() => {
  try {
    return getMistralClient().client;
  } catch (error) {
    console.warn('Mistral client initialization skipped during build.');
    return {} as MistralClient;
  }
})(); 