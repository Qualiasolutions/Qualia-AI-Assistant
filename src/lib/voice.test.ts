import {
  defaultVoiceOptions,
  enhancedVoiceOptions,
  getVoice,
  getAvailableVoices,
  speakWithBrowserTTS,
  speakWithEnhancedTTS,
  speakText,
  stopSpeaking,
  isSpeechSynthesisSupported,
  isSpeechRecognitionSupported
} from './voice';

describe('Voice Library', () => {
  // Mock global objects
  let mockSpeechSynthesis: {
    getVoices: jest.Mock;
    speak: jest.Mock;
    cancel: jest.Mock;
  };
  
  let mockUtterance: jest.Mock;
  let mockFetch: jest.Mock;
  
  beforeEach(() => {
    // Mock SpeechSynthesis
    mockSpeechSynthesis = {
      getVoices: jest.fn(),
      speak: jest.fn(),
      cancel: jest.fn()
    };
    
    // Mock SpeechSynthesisUtterance
    mockUtterance = jest.fn().mockImplementation(() => ({
      voice: null,
      volume: 1,
      rate: 1,
      pitch: 1,
      lang: ''
    }));
    
    // Mock fetch
    mockFetch = jest.fn();
    
    // Set up global objects
    global.window = Object.create(window);
    Object.defineProperty(global.window, 'speechSynthesis', {
      value: mockSpeechSynthesis
    });
    global.SpeechSynthesisUtterance = mockUtterance;
    global.fetch = mockFetch;
    
    // Mock AudioContext
    const mockAudioContext = {
      decodeAudioData: jest.fn().mockResolvedValue({}),
      createBufferSource: jest.fn().mockReturnValue({
        buffer: null,
        connect: jest.fn(),
        start: jest.fn(),
        onended: null
      }),
      createGain: jest.fn().mockReturnValue({
        gain: { value: 1 },
        connect: jest.fn()
      }),
      destination: {}
    };
    
    global.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
    global.window.AudioContext = global.AudioContext;
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });
  
  describe('defaultVoiceOptions', () => {
    test('should have the correct default values', () => {
      expect(defaultVoiceOptions).toEqual({
        enabled: true,
        language: 'el',
        volume: 1.0,
        rate: 1.0,
        pitch: 1.0,
        useEnhancedVoices: true,
        voiceId: 'default'
      });
    });
  });
  
  describe('enhancedVoiceOptions', () => {
    test('should have options for Greek and English', () => {
      expect(enhancedVoiceOptions).toHaveProperty('el');
      expect(enhancedVoiceOptions).toHaveProperty('en');
      expect(enhancedVoiceOptions.el.length).toBeGreaterThan(0);
      expect(enhancedVoiceOptions.en.length).toBeGreaterThan(0);
    });
  });
  
  describe('getVoice', () => {
    test('should return null when window is undefined', () => {
      // @ts-ignore - Simulate server-side environment
      delete global.window;
      
      const result = getVoice('el');
      expect(result).toBeNull();
    });
    
    test('should return a female voice when available', () => {
      const mockVoices = [
        { lang: 'el-GR', name: 'Greek Female', voiceURI: 'el-female' },
        { lang: 'el-GR', name: 'Greek Male', voiceURI: 'el-male' }
      ];
      
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);
      
      const result = getVoice('el');
      expect(result).toEqual(mockVoices[0]);
    });
    
    test('should return any voice for the language when female not available', () => {
      const mockVoices = [
        { lang: 'el-GR', name: 'Greek Male', voiceURI: 'el-male' },
        { lang: 'en-US', name: 'English Female', voiceURI: 'en-female' }
      ];
      
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);
      
      const result = getVoice('el');
      expect(result).toEqual(mockVoices[0]);
    });
    
    test('should return null when no matching voice is found', () => {
      const mockVoices = [
        { lang: 'fr-FR', name: 'French Female', voiceURI: 'fr-female' },
        { lang: 'de-DE', name: 'German Male', voiceURI: 'de-male' }
      ];
      
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);
      
      const result = getVoice('el');
      expect(result).toBeNull();
    });
  });
  
  describe('getAvailableVoices', () => {
    test('should return empty array when window is undefined', () => {
      // @ts-ignore - Simulate server-side environment
      delete global.window;
      
      const result = getAvailableVoices('el');
      expect(result).toEqual([]);
    });
    
    test('should return filtered voices for Greek', () => {
      const mockVoices = [
        { lang: 'el-GR', name: 'Greek Female', voiceURI: 'el-female' },
        { lang: 'el-CY', name: 'Cypriot Greek', voiceURI: 'el-cy' },
        { lang: 'en-US', name: 'English US', voiceURI: 'en-us' }
      ];
      
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);
      
      const result = getAvailableVoices('el');
      expect(result).toEqual([mockVoices[0], mockVoices[1]]);
    });
    
    test('should return filtered voices for English', () => {
      const mockVoices = [
        { lang: 'en-US', name: 'English US', voiceURI: 'en-us' },
        { lang: 'en-GB', name: 'English UK', voiceURI: 'en-gb' },
        { lang: 'el-GR', name: 'Greek', voiceURI: 'el-gr' }
      ];
      
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);
      
      const result = getAvailableVoices('en');
      expect(result).toEqual([mockVoices[0], mockVoices[1]]);
    });
  });
  
  describe('speakWithBrowserTTS', () => {
    test('should do nothing when window is undefined', () => {
      // @ts-ignore - Simulate server-side environment
      delete global.window;
      
      speakWithBrowserTTS('Hello', defaultVoiceOptions);
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });
    
    test('should do nothing when speech is disabled', () => {
      speakWithBrowserTTS('Hello', { ...defaultVoiceOptions, enabled: false });
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });
    
    test('should cancel any ongoing speech', () => {
      speakWithBrowserTTS('Hello', defaultVoiceOptions);
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });
    
    test('should use specific voice when voiceId is provided', () => {
      const mockVoices = [
        { lang: 'el-GR', name: 'Greek Voice', voiceURI: 'specific-voice-id' }
      ];
      
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);
      
      speakWithBrowserTTS('Hello', { 
        ...defaultVoiceOptions, 
        voiceId: 'specific-voice-id' 
      });
      
      expect(mockUtterance).toHaveBeenCalledWith('Hello');
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });
    
    test('should set correct utterance properties', () => {
      const options = {
        ...defaultVoiceOptions,
        volume: 0.8,
        rate: 1.2,
        pitch: 0.9
      };
      
      speakWithBrowserTTS('Hello', options);
      
      expect(mockUtterance).toHaveBeenCalledWith('Hello');
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });
  });
  
  describe('speakWithEnhancedTTS', () => {
    beforeEach(() => {
      // Mock successful fetch response
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10))
      });
    });
    
    test('should do nothing when window is undefined', async () => {
      // @ts-ignore - Simulate server-side environment
      delete global.window;
      
      await speakWithEnhancedTTS('Hello', defaultVoiceOptions);
      expect(mockFetch).not.toHaveBeenCalled();
    });
    
    test('should do nothing when speech is disabled', async () => {
      await speakWithEnhancedTTS('Hello', { ...defaultVoiceOptions, enabled: false });
      expect(mockFetch).not.toHaveBeenCalled();
    });
    
    test('should call the API with correct parameters', async () => {
      const options = {
        ...defaultVoiceOptions,
        voiceId: 'el-GR-AthinaNeural',
        rate: 1.2,
        pitch: 0.9
      };
      
      await speakWithEnhancedTTS('Hello', options);
      
      expect(mockFetch).toHaveBeenCalledWith('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Hello',
          voice: 'el-GR-AthinaNeural',
          rate: '1.2',
          pitch: '0.9',
        }),
      });
    });
    
    test('should use default voice when voiceId is not specified', async () => {
      await speakWithEnhancedTTS('Hello', defaultVoiceOptions);
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/text-to-speech',
        expect.objectContaining({
          body: expect.stringContaining(enhancedVoiceOptions.el[0].id)
        })
      );
    });
    
    test('should fallback to browser TTS when API fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Server Error'
      });
      
      await speakWithEnhancedTTS('Hello', defaultVoiceOptions);
      
      // Should fallback to browser TTS
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });
  });
  
  describe('speakText', () => {
    test('should do nothing when window is undefined', async () => {
      // @ts-ignore - Simulate server-side environment
      delete global.window;
      
      await speakText('Hello', defaultVoiceOptions);
      expect(mockSpeechSynthesis.cancel).not.toHaveBeenCalled();
    });
    
    test('should do nothing when speech is disabled', async () => {
      await speakText('Hello', { ...defaultVoiceOptions, enabled: false });
      expect(mockSpeechSynthesis.cancel).not.toHaveBeenCalled();
    });
    
    test('should stop any ongoing speech', async () => {
      await speakText('Hello', defaultVoiceOptions);
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });
    
    test('should use enhanced TTS when useEnhancedVoices is true', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10))
      });
      
      await speakText('Hello', { ...defaultVoiceOptions, useEnhancedVoices: true });
      
      expect(mockFetch).toHaveBeenCalled();
    });
    
    test('should use browser TTS when useEnhancedVoices is false', async () => {
      await speakText('Hello', { ...defaultVoiceOptions, useEnhancedVoices: false });
      
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
  
  describe('stopSpeaking', () => {
    test('should do nothing when window is undefined', () => {
      // @ts-ignore - Simulate server-side environment
      delete global.window;
      
      stopSpeaking();
      expect(mockSpeechSynthesis.cancel).not.toHaveBeenCalled();
    });
    
    test('should cancel speech synthesis', () => {
      stopSpeaking();
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });
  });
  
  describe('isSpeechSynthesisSupported', () => {
    test('should return false when window is undefined', () => {
      // @ts-ignore - Simulate server-side environment
      delete global.window;
      
      const result = isSpeechSynthesisSupported();
      expect(result).toBe(false);
    });
    
    test('should return true when speechSynthesis is available', () => {
      const result = isSpeechSynthesisSupported();
      expect(result).toBe(true);
    });
    
    test('should return false when speechSynthesis is not available', () => {
      // @ts-ignore - Remove speechSynthesis
      delete global.window.speechSynthesis;
      
      const result = isSpeechSynthesisSupported();
      expect(result).toBe(false);
    });
  });
  
  describe('isSpeechRecognitionSupported', () => {
    test('should return false when window is undefined', () => {
      // @ts-ignore - Simulate server-side environment
      delete global.window;
      
      const result = isSpeechRecognitionSupported();
      expect(result).toBe(false);
    });
    
    test('should return true when SpeechRecognition is available', () => {
      // @ts-ignore - Add SpeechRecognition
      global.window.SpeechRecognition = jest.fn();
      
      const result = isSpeechRecognitionSupported();
      expect(result).toBe(true);
    });
    
    test('should return true when webkitSpeechRecognition is available', () => {
      // @ts-ignore - Add webkitSpeechRecognition
      global.window.webkitSpeechRecognition = jest.fn();
      
      const result = isSpeechRecognitionSupported();
      expect(result).toBe(true);
    });
    
    test('should return false when neither is available', () => {
      const result = isSpeechRecognitionSupported();
      expect(result).toBe(false);
    });
  });
}); 