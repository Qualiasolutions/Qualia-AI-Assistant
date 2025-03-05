import OpenAI from 'openai';
import { Message } from '@/types';

// Create a function to initialize the OpenAI client
// This should only be called on the server side
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.ASSISTANT_ID;

  if (!apiKey) {
    console.error('OPENAI_API_KEY environment variable is not set. Please configure it in environment variables.');
    throw new Error('Missing OpenAI API key');
  }

  if (!assistantId) {
    console.error('ASSISTANT_ID environment variable is not set. Please configure it in environment variables.');
    throw new Error('Missing OpenAI Assistant ID');
  }

  return {
    client: new OpenAI({ apiKey }),
    assistantId
  };
};

// These functions will now be called via API routes, not directly from the client
export async function createThread() {
  try {
    const { client } = getOpenAIClient();
    const thread = await client.beta.threads.create();
    return thread.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw new Error('Failed to create conversation thread');
  }
}

export async function addMessageToThread(threadId: string, content: string) {
  try {
    const { client } = getOpenAIClient();
    await client.beta.threads.messages.create(threadId, {
      role: 'user',
      content,
    });
  } catch (error) {
    console.error('Error adding message to thread:', error);
    throw new Error('Failed to send message');
  }
}

export async function runAssistant(threadId: string) {
  try {
    const { client, assistantId } = getOpenAIClient();
    const run = await client.beta.threads.runs.create(threadId, {
      assistant_id: assistantId as string,
    });
    return run.id;
  } catch (error) {
    console.error('Error running assistant:', error);
    throw new Error('Failed to process message');
  }
}

export async function getRunStatus(threadId: string, runId: string) {
  try {
    const { client } = getOpenAIClient();
    const run = await client.beta.threads.runs.retrieve(threadId, runId);
    return run.status;
  } catch (error) {
    console.error('Error getting run status:', error);
    throw new Error('Failed to check message status');
  }
}

export async function getMessages(threadId: string, limit = 20, before?: string): Promise<Message[]> {
  try {
    const { client } = getOpenAIClient();
    
    // Prepare pagination parameters
    const params: { limit: number; before?: string; order?: 'asc' | 'desc' } = {
      limit,
      order: 'desc' // Most recent first
    };
    
    if (before) {
      params.before = before;
    }
    
    const messages = await client.beta.threads.messages.list(threadId, params);
    
    return messages.data.map((message) => ({
      id: message.id,
      role: message.role as 'user' | 'assistant',
      content: message.content[0].type === 'text' 
        ? message.content[0].text.value 
        : 'Unsupported message type',
      timestamp: new Date(message.created_at * 1000),
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    throw new Error('Failed to retrieve messages');
  }
}

export default getOpenAIClient().client; 