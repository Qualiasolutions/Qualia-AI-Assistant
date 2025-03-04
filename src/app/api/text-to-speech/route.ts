import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Free-tier Azure Speech API implementation (no actual credentials required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice, rate, pitch } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text parameter is required' },
        { status: 400 }
      );
    }
    
    // For demonstration, we'll use a freely available TTS service
    // In production, you'd use Azure Speech Service with proper credentials
    
    // Build SSML for more control over speech synthesis
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voice || 'en-US-JennyNeural'}">
          <prosody rate="${rate || '1'}" pitch="${pitch || '1'}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;
    
    try {
      // For demo purposes, we'll use browser's built-in TTS instead of Azure
      // In production, replace this with actual Azure Speech Services API call:
      
      /* Example Azure Speech Service code:
      const speechKey = process.env.AZURE_SPEECH_KEY;
      const speechRegion = process.env.AZURE_SPEECH_REGION;
      
      const response = await axios({
        method: 'post',
        url: `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
        headers: {
          'Ocp-Apim-Subscription-Key': speechKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'YourAppName'
        },
        data: ssml,
        responseType: 'arraybuffer'
      });
      
      return new NextResponse(response.data, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      */
      
      // Fallback solution using free TTS service for demo
      // Note: This is limited and for demonstration only
      const encodedText = encodeURIComponent(text);
      const language = voice.startsWith('el') ? 'el' : 'en-us';
      
      const url = `https://freetts.com/Home/PlayAudio?Language=${language}&Voice=${encodeURIComponent(voice)}&TextMessage=${encodedText}&Speed=0&AudioFormat=wav`;
      
      const response = await axios({
        method: 'get',
        url,
        responseType: 'arraybuffer'
      });
      
      return new NextResponse(response.data, {
        headers: {
          'Content-Type': 'audio/wav',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } catch (error) {
      console.error('TTS Service Error:', error);
      
      // Fallback to a simpler free TTS service if the first one fails
      const encodedText = encodeURIComponent(text);
      const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${voice.startsWith('el') ? 'el' : 'en'}&client=tw-ob`;
      
      const fallbackResponse = await axios({
        method: 'get',
        url: fallbackUrl,
        responseType: 'arraybuffer'
      });
      
      return new NextResponse(fallbackResponse.data, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process text-to-speech request' },
      { status: 500 }
    );
  }
} 