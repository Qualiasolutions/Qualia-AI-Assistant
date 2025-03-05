import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// In-memory cache for TTS responses to reduce API calls
const ttsCache = new Map<string, Buffer>();
const CACHE_MAX_SIZE = 50; // Maximum number of cached items

// API route for text-to-speech functionality
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = 'en-US', rate = '1', pitch = '1' } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text parameter is required' },
        { status: 400 }
      );
    }
    
    // Determine language from voice parameter
    const language = voice.startsWith('el') ? 'el' : 'en';
    const encodedText = encodeURIComponent(text);
    
    // Create cache key based on text and voice parameters
    const cacheKey = `${encodedText}_${language}_${rate}_${pitch}`;
    
    // Check if we have a cached response
    if (ttsCache.has(cacheKey)) {
      console.log('Using cached TTS response');
      const cachedData = ttsCache.get(cacheKey)!;
      
      return new NextResponse(cachedData, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'max-age=86400', // Cache for 24 hours
          'X-Source': 'cache'
        }
      });
    }
    
    // Try multiple TTS services in sequence until one works
    try {
      // First attempt: Google Translate TTS (most reliable)
      const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${language}&client=tw-ob`;
      
      const googleResponse = await axios({
        method: 'get',
        url: googleUrl,
        responseType: 'arraybuffer',
        timeout: 8000, // 8 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Cache the response
      manageCacheSize();
      ttsCache.set(cacheKey, Buffer.from(googleResponse.data));
      
      return new NextResponse(googleResponse.data, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'max-age=86400', // Cache for 24 hours
          'X-Source': 'google-tts'
        }
      });
    } catch (error) {
      console.warn('Primary TTS service failed, trying fallback:', error);
      
      try {
        // Second attempt: VoiceRSS API
        const voiceRssApiKey = process.env.VOICERSS_API_KEY || '2096a7db10a347f8a95cf36ad85d7963'; 
        const voiceRssUrl = `https://api.voicerss.org/?key=${voiceRssApiKey}&hl=${language}&src=${encodedText}&r=${rate}&f=16khz_16bit_mono`;
        
        const voiceRssResponse = await axios({
          method: 'get',
          url: voiceRssUrl,
          responseType: 'arraybuffer',
          timeout: 8000 // 8 second timeout
        });
        
        // Cache the response
        manageCacheSize();
        ttsCache.set(cacheKey, Buffer.from(voiceRssResponse.data));
        
        return new NextResponse(voiceRssResponse.data, {
          headers: {
            'Content-Type': 'audio/wav',
            'Cache-Control': 'max-age=86400', // Cache for 24 hours
            'X-Source': 'voicerss'
          }
        });
      } catch (_) {
        // Third attempt: Try Microsoft Edge TTS API (if available)
        try {
          const edgeTtsUrl = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${Date.now()}`;
          
          const voice_name = language === 'el' ? 'el-GR-AthinaNeural' : 'en-US-AriaNeural';
          
          const edgeTtsPayload = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='${language}'><voice name='${voice_name}'><prosody rate='${rate}' pitch='${pitch}'>${text}</prosody></voice></speak>`;
          
          const edgeTtsResponse = await axios({
            method: 'post',
            url: edgeTtsUrl,
            data: edgeTtsPayload,
            responseType: 'arraybuffer',
            timeout: 8000,
            headers: {
              'Content-Type': 'application/ssml+xml',
              'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.76'
            }
          });
          
          // Cache the response
          manageCacheSize();
          ttsCache.set(cacheKey, Buffer.from(edgeTtsResponse.data));
          
          return new NextResponse(edgeTtsResponse.data, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'max-age=86400', // Cache for 24 hours
              'X-Source': 'edge-tts'
            }
          });
        } catch (edgeError) {
          console.error('All TTS services failed:', edgeError);
          
          // Return a special error response that the client can use to fall back to browser TTS
          return NextResponse.json(
            { 
              error: 'TTS services unavailable', 
              fallbackToBrowser: true,
              message: 'Speech synthesis service is unavailable. Using browser TTS instead.'
            },
            { status: 503 }
          );
        }
      }
    }
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process text-to-speech request' },
      { status: 500 }
    );
  }
}

/**
 * Manages the cache size by removing the oldest entries when the maximum size is reached
 */
function manageCacheSize(): void {
  if (ttsCache.size >= CACHE_MAX_SIZE) {
    // Remove the oldest cache entry (first key in the map)
    const oldestKey = ttsCache.keys().next().value;
    if (oldestKey !== undefined) {
      ttsCache.delete(oldestKey);
    }
  }
} 