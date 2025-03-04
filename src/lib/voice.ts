import { VoiceOptions } from '@/types';

// Default voice settings
export const defaultVoiceOptions: VoiceOptions = {
  enabled: true,
  language: 'el',
  volume: 1.0,
  rate: 1.0,
  pitch: 1.0,
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

// Text-to-speech function
export function speakText(text: string, options: VoiceOptions): void {
  if (typeof window === 'undefined' || !options.enabled) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getVoice(options.language);
  
  if (voice) {
    utterance.voice = voice;
  }
  
  utterance.volume = options.volume;
  utterance.rate = options.rate;
  utterance.pitch = options.pitch;
  utterance.lang = options.language === 'el' ? 'el-GR' : 'en-US';
  
  window.speechSynthesis.speak(utterance);
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