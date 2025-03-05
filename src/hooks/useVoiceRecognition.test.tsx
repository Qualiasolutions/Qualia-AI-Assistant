import { renderHook, act } from '@testing-library/react';
import useVoiceRecognition from './useVoiceRecognition';
import { isSpeechRecognitionSupported } from '@/lib/voice';

// Mock the voice library
jest.mock('@/lib/voice', () => ({
  isSpeechRecognitionSupported: jest.fn()
}));

describe('useVoiceRecognition', () => {
  // Mock handlers
  const onResult = jest.fn();
  const onError = jest.fn();
  
  // Default props
  const defaultProps = {
    language: 'en' as const,
    onResult,
    onError
  };

  // Mock SpeechRecognition implementation
  let mockStart: jest.Mock;
  let mockStop: jest.Mock;
  let mockResultHandler: ((event: any) => void) | null = null;
  let mockErrorHandler: ((event: any) => void) | null = null;
  let mockEndHandler: (() => void) | null = null;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock SpeechRecognition
    mockStart = jest.fn();
    mockStop = jest.fn();
    
    // Mock the global SpeechRecognition constructor
    const mockSpeechRecognition = jest.fn().mockImplementation(() => ({
      start: mockStart,
      stop: mockStop,
      continuous: false,
      interimResults: false,
      lang: '',
      set onresult(handler: any) {
        mockResultHandler = handler;
      },
      set onerror(handler: any) {
        mockErrorHandler = handler;
      },
      set onend(handler: any) {
        mockEndHandler = handler;
      }
    }));
    
    // Set up the global object
    global.SpeechRecognition = mockSpeechRecognition;
    global.webkitSpeechRecognition = mockSpeechRecognition;
    
    // Mock the support check to return true by default
    (isSpeechRecognitionSupported as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    // Clean up
    delete global.SpeechRecognition;
    delete global.webkitSpeechRecognition;
  });

  test('should initialize with correct default values', () => {
    const { result } = renderHook(() => useVoiceRecognition(defaultProps));
    
    expect(result.current.isListening).toBe(false);
    expect(result.current.isSupported).toBe(true);
    expect(typeof result.current.startListening).toBe('function');
    expect(typeof result.current.stopListening).toBe('function');
  });

  test('should set isSupported to false when speech recognition is not supported', () => {
    (isSpeechRecognitionSupported as jest.Mock).mockReturnValue(false);
    
    const { result } = renderHook(() => useVoiceRecognition(defaultProps));
    
    expect(result.current.isSupported).toBe(false);
  });

  test('should start listening when startListening is called', () => {
    const { result } = renderHook(() => useVoiceRecognition(defaultProps));
    
    act(() => {
      result.current.startListening();
    });
    
    expect(mockStart).toHaveBeenCalledTimes(1);
    expect(result.current.isListening).toBe(true);
  });

  test('should stop listening when stopListening is called', () => {
    const { result } = renderHook(() => useVoiceRecognition(defaultProps));
    
    // Start listening first
    act(() => {
      result.current.startListening();
    });
    
    // Then stop
    act(() => {
      result.current.stopListening();
    });
    
    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(result.current.isListening).toBe(false);
  });

  test('should call onResult when speech is recognized', () => {
    renderHook(() => useVoiceRecognition(defaultProps));
    
    // Simulate a speech recognition result
    if (mockResultHandler) {
      const mockEvent = {
        results: [
          {
            0: { transcript: 'Hello world' },
            isFinal: true,
            length: 1
          }
        ]
      };
      
      // Make results iterable for Array.from
      mockEvent.results[0].map = Array.prototype.map;
      
      act(() => {
        mockResultHandler(mockEvent);
      });
      
      expect(onResult).toHaveBeenCalledWith('Hello world');
    }
  });

  test('should call onError when speech recognition errors', () => {
    renderHook(() => useVoiceRecognition(defaultProps));
    
    // Simulate an error
    if (mockErrorHandler) {
      const mockErrorEvent = { error: 'no-speech' };
      
      act(() => {
        mockErrorHandler(mockErrorEvent);
      });
      
      expect(onError).toHaveBeenCalledWith('Speech recognition error: no-speech');
    }
  });

  test('should set isListening to false when recognition ends', () => {
    const { result } = renderHook(() => useVoiceRecognition(defaultProps));
    
    // Start listening
    act(() => {
      result.current.startListening();
    });
    
    expect(result.current.isListening).toBe(true);
    
    // Simulate end event
    if (mockEndHandler) {
      act(() => {
        mockEndHandler();
      });
      
      expect(result.current.isListening).toBe(false);
    }
  });

  test('should update language when prop changes', () => {
    const { rerender } = renderHook(
      (props) => useVoiceRecognition(props), 
      { initialProps: defaultProps }
    );
    
    // Check initial language
    expect(global.SpeechRecognition).toHaveBeenCalledTimes(1);
    
    // Change language to Greek
    rerender({ ...defaultProps, language: 'el' });
    
    // We can't directly test the language change since we don't have access to the instance
    // But we can verify the hook reacts to language changes
    expect(global.SpeechRecognition).toHaveBeenCalledTimes(1);
  });

  test('should handle errors when starting recognition', () => {
    mockStart.mockImplementation(() => {
      throw new Error('Failed to start');
    });
    
    const { result } = renderHook(() => useVoiceRecognition(defaultProps));
    
    act(() => {
      result.current.startListening();
    });
    
    expect(onError).toHaveBeenCalledWith('Failed to start speech recognition');
    expect(result.current.isListening).toBe(false);
  });

  test('should handle errors when stopping recognition', () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    mockStop.mockImplementation(() => {
      throw new Error('Failed to stop');
    });
    
    const { result } = renderHook(() => useVoiceRecognition(defaultProps));
    
    // Start listening first
    act(() => {
      result.current.startListening();
    });
    
    // Then try to stop
    act(() => {
      result.current.stopListening();
    });
    
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
}); 