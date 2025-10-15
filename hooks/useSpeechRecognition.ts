import { useState, useRef, useEffect, useCallback } from 'react';

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const startListening = useCallback(() => {
        if (!SpeechRecognition) {
            setError("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            stopListening();
            return;
        }
        
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                 setTranscript(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
            }
        };
        
        recognition.onerror = (event) => {
            setError(`Speech recognition error: ${event.error}`);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
        setIsListening(true);
        setTranscript('');
        setError(null);
    }, [isListening, stopListening]);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopListening();
        };
    }, [stopListening]);

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        hasRecognitionSupport: !!SpeechRecognition
    };
};