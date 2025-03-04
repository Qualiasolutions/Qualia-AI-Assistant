import { NextRequest, NextResponse } from 'next/server';
import { 
  createThread, 
  addMessageToThread, 
  runAssistant, 
  getRunStatus, 
  getMessages 
} from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { action, threadId, message, runId } = await request.json();

    switch (action) {
      case 'createThread': {
        const newThreadId = await createThread();
        return NextResponse.json({ threadId: newThreadId });
      }
      
      case 'resetThread': {
        // Create a new thread regardless of the old one
        // This is used to recover from stuck states
        const newThreadId = await createThread();
        
        // If there's a welcome message, add it to the thread
        if (message) {
          await addMessageToThread(newThreadId, message);
          await runAssistant(newThreadId);
        }
        
        return NextResponse.json({ 
          threadId: newThreadId,
          status: 'reset_successful' 
        });
      }
      
      case 'sendMessage': {
        if (!threadId || !message) {
          return NextResponse.json(
            { error: 'Thread ID and message are required' },
            { status: 400 }
          );
        }
        
        await addMessageToThread(threadId, message);
        const newRunId = await runAssistant(threadId);
        
        return NextResponse.json({ runId: newRunId });
      }
      
      case 'getRunStatus': {
        if (!threadId || !runId) {
          return NextResponse.json(
            { error: 'Thread ID and run ID are required' },
            { status: 400 }
          );
        }
        
        const status = await getRunStatus(threadId, runId);
        return NextResponse.json({ status });
      }
      
      case 'getMessages': {
        if (!threadId) {
          return NextResponse.json(
            { error: 'Thread ID is required' },
            { status: 400 }
          );
        }
        
        const messages = await getMessages(threadId);
        
        // Format the messages for safe JSON serialization (Date objects can't be directly serialized)
        const formattedMessages = messages.map(message => ({
          ...message,
          timestamp: message.timestamp instanceof Date ? message.timestamp.toISOString() : new Date().toISOString()
        }));
        
        return NextResponse.json({ messages: formattedMessages });
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 