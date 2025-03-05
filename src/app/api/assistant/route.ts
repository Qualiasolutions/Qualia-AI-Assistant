import { NextRequest, NextResponse } from 'next/server';
import { 
  createThread, 
  addMessageToThread, 
  runAssistant, 
  getRunStatus, 
  getMessages 
} from '@/lib/mistral';

// Build-time check to help deployment succeed even without env vars
export const dynamic = 'force-dynamic';

// Cache for recent messages to improve response time
type MessageCache = {
  threadId: string;
  messages: Record<string, unknown>[];
  timestamp: number;
};

const messageCache = new Map<string, MessageCache>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_SIZE = 10;

// System prompts that define assistant behavior based on language
const systemPrompts = {
  en: `You are Qualia AI, a helpful and professional business assistant designed to help with business tasks, lead generation, customer support, and market research. 
      Always respond in a clear, concise, and professional manner. 
      When you don't know something, acknowledge it and suggest alternatives or offer to research it further.
      For any business analysis, make sure to provide balanced perspectives and consider multiple viewpoints.`,
  
  el: `Είσαι το Qualia AI, ένας χρήσιμος και επαγγελματικός επιχειρηματικός βοηθός σχεδιασμένος να βοηθά με επιχειρηματικές εργασίες, δημιουργία leads, υποστήριξη πελατών και έρευνα αγοράς. 
      Πάντα να απαντάς με σαφή, συνοπτικό και επαγγελματικό τρόπο. 
      Όταν δεν γνωρίζεις κάτι, αναγνώρισέ το και πρότεινε εναλλακτικές ή προσφέρσου να το ερευνήσεις περαιτέρω.
      Για οποιαδήποτε επιχειρηματική ανάλυση, φρόντισε να παρέχεις ισορροπημένες προοπτικές και να λαμβάνεις υπόψη πολλαπλές απόψεις.`
};

/**
 * Manage cache size by removing the oldest entries when the max size is reached
 */
function manageCacheSize(): void {
  if (messageCache.size >= CACHE_MAX_SIZE) {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    // Find the oldest entry
    for (const [key, data] of messageCache.entries()) {
      if (data.timestamp < oldestTime) {
        oldestTime = data.timestamp;
        oldestKey = key;
      }
    }
    
    // Remove the oldest entry
    if (oldestKey) {
      messageCache.delete(oldestKey);
    }
  }
}

/**
 * Clean expired cache entries
 */
function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, data] of messageCache.entries()) {
    if (now - data.timestamp > CACHE_TTL) {
      messageCache.delete(key);
    }
  }
}

// Clean cache periodically
if (typeof setInterval !== 'undefined') {
  setInterval(cleanExpiredCache, 60 * 1000); // Clean every minute
}

// First, let's enhance the mistral addMessageToThread function to support roles
async function enhancedAddMessageToThread(threadId: string, content: string, role: 'user' | 'system' = 'user'): Promise<void> {
  // In the future, if the API supports roles directly, this can be updated
  // For now, we'll add a prefix for system messages
  let processedContent = content;
  
  if (role === 'system') {
    processedContent = `[SYSTEM INSTRUCTIONS]: ${content}`;
  }
  
  await addMessageToThread(threadId, processedContent);
}

export async function POST(request: NextRequest) {
  try {
    // Check for environment variables at runtime
    const mistralApiKey = process.env.MISTRAL_API_KEY;
    if (!mistralApiKey) {
      console.error('Mistral API key is missing in environment variables');
      return NextResponse.json(
        { 
          error: 'Mistral AI configuration missing', 
          details: 'Please set MISTRAL_API_KEY environment variable in the Vercel dashboard.',
          env: process.env.NODE_ENV || 'unknown',
          apiKeyFirstChar: mistralApiKey ? mistralApiKey.charAt(0) : 'undefined'
        },
        { status: 503 }
      );
    }
    
    const body = await request.json().catch(e => {
      console.error('Failed to parse request body:', e);
      return {};
    });
    
    const { action, threadId, message, runId, limit, before, language = 'en' } = body;
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }
    
    // Select the appropriate system prompt based on language
    const systemPrompt = language === 'el' ? systemPrompts.el : systemPrompts.en;

    switch (action) {
      case 'createThread': {
        const newThreadId = await createThread();
        
        // Add welcome message if creating a new thread
        if (message) {
          try {
            await enhancedAddMessageToThread(newThreadId, message, 'user');
            // Add system prompt to guide the assistant behavior
            await enhancedAddMessageToThread(newThreadId, systemPrompt, 'system');
            await runAssistant(newThreadId);
          } catch (error) {
            console.error('Error during thread initialization:', error);
            // Continue despite error to return the thread ID
          }
        }
        
        return NextResponse.json({ threadId: newThreadId });
      }
      
      case 'resetThread': {
        // Create a new thread regardless of the old one
        // This is used to recover from stuck states
        const newThreadId = await createThread();
        
        // Add system prompt to guide the assistant behavior
        await enhancedAddMessageToThread(newThreadId, systemPrompt, 'system');
        
        // If there's a welcome message, add it to the thread
        if (message) {
          await enhancedAddMessageToThread(newThreadId, message, 'user');
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
        
        try {
          await enhancedAddMessageToThread(threadId, message, 'user');
          const newRunId = await runAssistant(threadId);
          
          // Clear cache for this thread as it's now outdated
          messageCache.delete(threadId);
          
          return NextResponse.json({ runId: newRunId });
        } catch (error) {
          console.error('Error in sendMessage:', error);
          
          // Extract meaningful error message
          let errorMessage = 'An error occurred while processing your request';
          let statusCode = 500;
          
          if (error instanceof Error) {
            errorMessage = error.message;
            
            // If this is a "message still being processed" error, use a 429 status
            if (error.message.includes('message is still being processed')) {
              statusCode = 429;
            }
            
            // If thread not found, suggest creating a new thread
            if (error.message.includes('not found') || error.message.includes('Thread not found')) {
              errorMessage = 'Thread not found. Please create a new conversation.';
              statusCode = 404;
            }
          }
          
          return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
          );
        }
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
        
        // Parse pagination parameters
        const messagesLimit = limit ? parseInt(limit.toString(), 10) : 20;
        const beforeId = before ? before.toString() : undefined;
        
        // Check cache first if not paginating
        if (!beforeId && messageCache.has(threadId)) {
          const cachedData = messageCache.get(threadId)!;
          const now = Date.now();
          
          // Return cached data if it's fresh
          if (now - cachedData.timestamp < CACHE_TTL) {
            console.log('Using cached messages');
            return NextResponse.json({ 
              messages: cachedData.messages,
              hasMore: cachedData.messages.length === messagesLimit,
              fromCache: true
            });
          }
        }
        
        try {
          // Get messages with pagination
          const messages = await getMessages(threadId, messagesLimit, beforeId);
          
          // Format the messages for safe JSON serialization
          const formattedMessages = messages.map(message => ({
            ...message,
            timestamp: message.timestamp instanceof Date ? message.timestamp.toISOString() : new Date().toISOString()
          }));
          
          // Cache the messages if not paginating
          if (!beforeId) {
            manageCacheSize();
            messageCache.set(threadId, {
              threadId,
              messages: formattedMessages,
              timestamp: Date.now()
            });
          }
          
          return NextResponse.json({ 
            messages: formattedMessages,
            hasMore: messages.length === messagesLimit
          });
        } catch (error) {
          console.error('Error fetching messages:', error);
          
          let statusCode = 500;
          let errorMessage = 'Failed to fetch messages';
          
          if (error instanceof Error) {
            // Thread not found
            if (error.message.includes('not found') || error.message.includes('Thread not found')) {
              statusCode = 404;
              errorMessage = 'Thread not found. Please create a new conversation.';
            }
          }
          
          return NextResponse.json({ error: errorMessage }, { status: statusCode });
        }
      }
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Unhandled error in assistant API route:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 