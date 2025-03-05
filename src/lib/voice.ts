import { VoiceOptions } from '@/types';

// Track the current enhanced TTS audio source for cancellation
let enhancedTTSSource: AudioBufferSourceNode | null = null;

// Default voice settings
export const defaultVoiceOptions: VoiceOptions = {
  enabled: true,
  language: 'en',
  volume: 1.0,
  rate: 1.0,
  pitch: 1.0,
  useEnhancedVoices: true,  // New option to use enhanced voices
  voiceId: 'default',        // New option for specific voice selection
  greekVoice: {
    voiceId: 'el-GR'
  },
  englishVoice: {
    voiceId: 'en-US'
  }
};

// Voice options for enhanced TTS (Azure Cognitive Services)
export const enhancedVoiceOptions = {
  el: [
    { id: 'el-GR-AthinaNeural', name: 'Athina (Female)', gender: 'female' },
    { id: 'el-GR-NestorasNeural', name: 'Nestoras (Male)', gender: 'male' },
  ],
  en: [
    { id: 'en-US-JennyNeural', name: 'Jenny (Female)', gender: 'female' },
    { id: 'en-US-GuyNeural', name: 'Guy (Male)', gender: 'male' },
    { id: 'en-GB-SoniaNeural', name: 'Sonia (Female, British)', gender: 'female' },
    { id: 'en-GB-RyanNeural', name: 'Ryan (Male, British)', gender: 'male' },
  ]
};

// Get appropriate voice for the selected language
export function getVoice(language: 'el' | 'en'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null;
  
  const voices = window.speechSynthesis.getVoices();
  
  // Try to find a female voice for the selected language
  const femaleVoice = voices.find(
    (voice) => 
      voice.lang.startsWith(language === 'el' ? 'el' : 'en') && 
      voice.name.toLowerCase().includes('female')
  );
  
  // If no female voice is found, try to find any voice for the selected language
  const anyVoice = voices.find(
    (voice) => voice.lang.startsWith(language === 'el' ? 'el' : 'en')
  );
  
  return femaleVoice || anyVoice || null;
}

// Get all available browser voices for a language
export function getAvailableVoices(language: 'el' | 'en'): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined') return [];
  
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(voice => voice.lang.startsWith(language === 'el' ? 'el' : 'en'));
}

// Standard browser-based TTS
export function speakWithBrowserTTS(text: string, options: VoiceOptions): void {
  if (typeof window === 'undefined' || !options.enabled) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Use specific voice if provided, otherwise find appropriate one
  if (options.voiceId && options.voiceId !== 'default') {
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.voiceURI === options.voiceId);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      utterance.voice = getVoice(options.language);
    }
  } else {
    utterance.voice = getVoice(options.language);
  }
  
  utterance.volume = options.volume;
  utterance.rate = options.rate;
  utterance.pitch = options.pitch;
  utterance.lang = options.language === 'el' ? 'el-GR' : 'en-US';
  
  window.speechSynthesis.speak(utterance);
}

// Enhanced TTS using Azure Cognitive Services
export async function speakWithEnhancedTTS(text: string, options: VoiceOptions): Promise<void> {
  if (typeof window === 'undefined' || !options.enabled) return;
  
  // Cancel any ongoing speech
  stopSpeaking();
  
  // Choose the appropriate voice based on language
  const voiceOptions = options.language === 'el' ? options.greekVoice : options.englishVoice;
  const voiceId = voiceOptions?.voiceId || (options.language === 'el' ? 'el-GR' : 'en-US');
  
  try {
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: voiceId,
        rate: options.rate.toString(),
        pitch: options.pitch.toString(),
      }),
    });
    
    if (!response.ok) {
      // Check if response contains JSON with fallback instruction
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        const jsonResponse = await response.json();
        if (jsonResponse.fallbackToBrowser) {
          console.warn('TTS API suggested browser fallback:', jsonResponse.message);
          speakWithBrowserTTS(text, options);
          return;
        }
      }
      throw new Error(`Failed to get speech: ${response.statusText}`);
    }
    
    // Get audio data and play it
    const audioArrayBuffer = await response.arrayBuffer();
    
    // Define window with WebKit audio context extension
    interface ExtendedWindow extends Window {
      AudioContext: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    }
    
    const extWindow = window as ExtendedWindow;
    const AudioContextClass = extWindow.AudioContext || extWindow.webkitAudioContext;
    const audioContext = new AudioContextClass();
    
    const audioBuffer = await audioContext.decodeAudioData(audioArrayBuffer);
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = options.volume;
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Store the source in the global scope for potential cancellation
    enhancedTTSSource = source;
    
    source.start(0);
    
    return new Promise((resolve) => {
      source.onended = () => {
        enhancedTTSSource = null;
        audioContext.close();
        resolve();
      };
    });
  } catch (error) {
    console.error('Enhanced TTS error:', error);
    // Automatically fall back to browser TTS
    speakWithBrowserTTS(text, options);
  }
}

// Main text-to-speech function that handles both standard and enhanced options
export async function speakText(text: string, options: VoiceOptions): Promise<void> {
  if (typeof window === 'undefined' || !options.enabled) return;
  
  // Cancel any ongoing speech
  stopSpeaking();
  
  try {
    if (options.useEnhancedVoices) {
      try {
        // Try enhanced TTS first
        await speakWithEnhancedTTS(text, options);
      } catch (error) {
        console.warn('Enhanced TTS failed, falling back to browser TTS:', error);
        // Fall back to browser TTS if enhanced fails
        speakWithBrowserTTS(text, options);
      }
    } else {
      // Use browser TTS directly if enhanced isn't enabled
      speakWithBrowserTTS(text, options);
    }
  } catch (error) {
    console.error('Speech synthesis error:', error);
  }
}

// Stop speaking
export function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
}

// Check if browser supports speech synthesis
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Check if browser supports speech recognition
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && 
    (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window));
} 