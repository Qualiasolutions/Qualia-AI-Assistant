import OpenAI from 'openai';
import { Message } from '@/types';

const apiKey = process.env.OPENAI_API_KEY;
const assistantId = process.env.OPENAI_ASSISTANT_ID;

if (!apiKey) {
  console.error('OPENAI_API_KEY environment variable is not set. Please configure it in Vercel environment variables.');
  throw new Error('Missing OpenAI API key');
}

if (!assistantId) {
  console.error('OPENAI_ASSISTANT_ID environment variable is not set. Please configure it in Vercel environment variables.');
  throw new Error('Missing OpenAI Assistant ID');
}

const openai = new OpenAI({
  apiKey,
});

export async function createThread() {
  try {
    const thread = await openai.beta.threads.create();
    return thread.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw new Error('Failed to create conversation thread');
  }
}

export async function addMessageToThread(threadId: string, content: string) {
  try {
    await openai.beta.threads.messages.create(threadId, {
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
    const run = await openai.beta.threads.runs.create(threadId, {
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
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    return run.status;
  } catch (error) {
    console.error('Error getting run status:', error);
    throw new Error('Failed to check message status');
  }
}

export async function getMessages(threadId: string): Promise<Message[]> {
  try {
    const messages = await openai.beta.threads.messages.list(threadId);
    
    return messages.data.map((message) => ({
      id: message.id,
      role: message.role as 'user' | 'assistant',
      content: message.content[0].type === 'text' 
        ? message.content[0].text.value 
        : 'Unsupported message type',
      timestamp: new Date(message.created_at * 1000),
    })).reverse();
  } catch (error) {
    console.error('Error getting messages:', error);
    throw new Error('Failed to retrieve messages');
  }
}

export default openai; 