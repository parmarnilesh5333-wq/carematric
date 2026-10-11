import { useCallback, useEffect, useRef, useState } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../types/report';

interface UseVoiceInputOptions {
  language: SupportedLanguage;
  onTranscript: (text: string) => void;
}

export function useVoiceInput({ language, onTranscript }: UseVoiceInputOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
    }
  }, []);

  const toggleListening = useCallback(() => {
    setVoiceError(null);
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        'Voice input requires a browser with Web Speech API support (such as Chrome or Edge).'
      );
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language);
      recognition.lang = langMeta?.speechLang || 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event?.error && event.error !== 'aborted') {
          setVoiceError(`Voice input error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setVoiceError(err?.message || 'Unable to start microphone.');
    }
  }, [isListening, language, onTranscript]);

  return {
    isSupported,
    isListening,
    voiceError,
    setVoiceError,
    toggleListening,
  };
}
