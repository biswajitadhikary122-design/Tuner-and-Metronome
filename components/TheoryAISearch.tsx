
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MicIcon, SendIcon, GeminiIcon, PlayIcon, PauseIcon } from './Icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { getTheoryExplanation } from '../services/gemini';

// Helper function to remove SSML for display and highlighting.
const stripSSML = (text: string): string => text.replace(/<[^>]+>/g, '');


// ========================================================
// TheoryAISearch Component
// ========================================================
const allExamplePrompts = [
    "Explain the circle of fifths", 
    "What are modes in music?", 
    "How do I build a Cmaj7 chord?",
    "What's the difference between major and minor?",
    "Explain what a 'ii-V-I' progression is",
    "How does a blues scale work?",
    "What is a time signature?",
    "Define 'arpeggio'",
    "What is counterpoint?",
    "Explain chord inversions",
    "What's a key signature?",
    "How do I use a capo effectively?",
    "What are intervals in music?",
    "Explain relative major and minor keys",
    "How does music transposition work?",
    "What is a triad and how do I build one?",
    "What is a 'cadence' in music?",
    "Explain the difference between rhythm and tempo",
    "How are guitar tabs different from sheet music?",
    "What does 'a cappella' mean?"
];

const AnswerSkeleton: React.FC = () => (
    <div className="w-full p-4 mt-4 card">
        <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="space-y-2 mt-4">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
    </div>
);

type Paragraph = { text: string; charIndexStart: number; charIndexEnd: number };

export const TheoryAISearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [displayedPrompts, setDisplayedPrompts] = useState<string[]>([]);
    
    // Speech Synthesis State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [highlightedParagraphIndex, setHighlightedParagraphIndex] = useState(-1);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    const speech = useSpeechRecognition();
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const lastCharIndexRef = useRef(0);

    // --- EFFECTS ---
    
    // Effect to set random example prompts on component mount
    useEffect(() => {
        const shuffled = [...allExamplePrompts].sort(() => 0.5 - Math.random());
        setDisplayedPrompts(shuffled.slice(0, 4));
    }, []);

    // Effect to select a high-quality female voice for TTS
    useEffect(() => {
        const getVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                const voicePreferences = [
                    'Samantha', 
                    'Google UK English Female',
                    'Microsoft Zira Desktop - English (United States)',
                    'Victoria',
                    'Google US English',
                ];
                let chosenVoice = null;
                for (const name of voicePreferences) {
                    chosenVoice = voices.find(voice => voice.name === name && voice.lang.startsWith('en-'));
                    if (chosenVoice) break;
                }
                if (!chosenVoice) chosenVoice = voices.find(voice => voice.lang.startsWith('en-US') && voice.name.includes('Female') && !voice.name.includes('Desktop'));
                if (!chosenVoice) chosenVoice = voices.find(voice => voice.lang.startsWith('en-US') && voice.name.includes('Female'));
                if (!chosenVoice) chosenVoice = voices.find(voice => voice.lang.startsWith('en-US'));
                setSelectedVoice(chosenVoice || voices[0]);
            }
        };

        getVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = getVoices;
        }
    }, []);

    // Effect to sync speech recognition transcript with query input
    useEffect(() => {
        if (speech.transcript) {
            setQuery(speech.transcript);
        }
    }, [speech.transcript]);
    
    // Effect to scroll the highlighted paragraph into view
    useEffect(() => {
        if (!isSpeaking || highlightedParagraphIndex < 0 || !scrollContainerRef.current) return;
        
        const paraNode = scrollContainerRef.current.querySelector(`[data-paragraph-index='${highlightedParagraphIndex}']`);
        
        if (paraNode) {
            paraNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightedParagraphIndex, isSpeaking]);

    // Cleanup for speech synthesis on unmount
    useEffect(() => {
        const cancelSpeech = () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
        window.addEventListener('beforeunload', cancelSpeech);
        return () => {
            cancelSpeech();
            window.removeEventListener('beforeunload', cancelSpeech);
        };
    }, []);

    
    // --- SPEECH SYNTHESIS LOGIC ---
    
    const playSpeech = useCallback((startIndex: number) => {
        if (!answer || !window.speechSynthesis) return;
        
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        const textToSpeak = stripSSML(answer);
        if (startIndex >= textToSpeak.length) {
            startIndex = 0;
        }
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak.substring(startIndex));
        
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                const originalCharIndex = startIndex + event.charIndex;
                lastCharIndexRef.current = originalCharIndex;
                const paraIndex = paragraphs.findIndex(p => originalCharIndex >= p.charIndexStart && originalCharIndex < p.charIndexEnd);
                if (paraIndex > -1) setHighlightedParagraphIndex(paraIndex);
            }
        };
        
        utterance.onpause = (event) => {
            lastCharIndexRef.current = startIndex + event.charIndex;
            setIsPaused(true);
        };
        
        utterance.onresume = () => setIsPaused(false);
        
        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setHighlightedParagraphIndex(-1);
            lastCharIndexRef.current = 0;
        };

        utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
                console.error("Speech synthesis error:", e.error);
                setError(`Speech playback error: ${e.error}. Please try again.`);
            }
            setIsSpeaking(false);
            setIsPaused(false);
            setHighlightedParagraphIndex(-1);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setIsPaused(false);
    }, [answer, paragraphs, selectedVoice]);

    const handleToggleSpeech = () => {
        if (!answer) return;

        if (isSpeaking) {
            if (isPaused) {
                window.speechSynthesis.resume();
            } else {
                window.speechSynthesis.pause();
            }
        } else {
            playSpeech(lastCharIndexRef.current);
        }
    };
    
    const handleParagraphClick = (paraIndex: number) => {
        if (isLoading || !paragraphs[paraIndex]) return;
        const startIndex = paragraphs[paraIndex].charIndexStart;
        playSpeech(startIndex);
    };

    const performSearch = async (searchQuery: string) => {
        if (!searchQuery.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAnswer('');
        setParagraphs([]);
        setHighlightedParagraphIndex(-1);
        lastCharIndexRef.current = 0;
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);

        try {
            const stream = getTheoryExplanation(searchQuery);
            let fullText = '';
            for await (const chunk of stream) {
                fullText += chunk;
                setAnswer(fullText);
            }
            const strippedText = stripSSML(fullText);
            const rawParagraphs = strippedText.split('\n').filter(p => p.trim().length > 0);
            
            const processedParagraphs: Paragraph[] = [];
            let charCounter = 0;
            
            rawParagraphs.forEach(pText => {
                const startIndex = strippedText.indexOf(pText, charCounter);
                if (startIndex !== -1) {
                    processedParagraphs.push({
                        text: pText,
                        charIndexStart: startIndex,
                        charIndexEnd: startIndex + pText.length,
                    });
                    charCounter = startIndex + pText.length;
                }
            });
            setParagraphs(processedParagraphs);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(query);
    };

    const handleExampleClick = (prompt: string) => {
        setQuery(prompt);
        performSearch(prompt);
    };
    
    // --- RENDER ---
    const isPlaying = isSpeaking && !isPaused;

    return (
        <div className="w-full max-w-3xl flex flex-col items-center gap-4 animate-fade-in-up">
            <form
                onSubmit={handleSubmit}
                className={`
                    w-full flex items-center gap-2 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800
                    border border-transparent
                    transition-all duration-300 
                    ${isFocused ? 'ring-2 ring-accent border-accent/50' : ''}
                `}
            >
                <div className="pl-3 flex items-center pointer-events-none">
                    <GeminiIcon className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    value={query}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about music theory..."
                    className="flex-grow p-2.5 w-full border-none bg-transparent focus:outline-none focus:ring-0 placeholder-slate-400"
                />
                {speech.hasRecognitionSupport && (
                    <button type="button" onClick={speech.isListening ? speech.stopListening : speech.startListening} className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" aria-label={speech.isListening ? "Stop listening" : "Start listening"}>
                        <MicIcon className={`w-6 h-6 transition-colors ${speech.isListening ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
                    </button>
                )}
                <button type="submit" disabled={isLoading || !query.trim()} className="p-3 rounded-full bg-accent text-white disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-all hover:opacity-90 transform hover:scale-105 active:scale-95">
                    {isLoading ? <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <SendIcon className="w-6 h-6" />}
                </button>
            </form>

            {!answer && !isLoading && (
                <div className="flex flex-wrap justify-center gap-2 mt-4 animate-fade-in">
                    {displayedPrompts.map(prompt => (
                        <button 
                            key={prompt} 
                            onClick={() => handleExampleClick(prompt)}
                            className="px-3 py-1.5 text-sm rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {isLoading && !answer && <AnswerSkeleton />}
            {error && <div className="mt-4 text-red-500">{error}</div>}
            
            {answer && (
                <div className="relative w-full p-6 mt-4 card animate-fade-in">
                    {window.speechSynthesis && (
                        <button 
                            onClick={handleToggleSpeech} 
                            className={`absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 shadow-md ${
                                isPlaying
                                ? 'bg-red-500 text-white' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                            aria-label={isPlaying ? "Pause reading" : isPaused ? "Continue reading" : "Read explanation aloud"}
                        >
                            {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 pl-1" />}
                        </button>
                    )}
                     <div ref={scrollContainerRef} className="ai-answer-container text-slate-700 dark:text-slate-300">
                        <div className="ai-answer-content space-y-4">
                            {paragraphs.map((para, index) => (
                                <p
                                    key={index}
                                    data-paragraph-index={index}
                                    className={`cursor-pointer rounded p-1 transition-colors ${highlightedParagraphIndex === index ? 'bg-accent/20' : ''}`}
                                    onClick={() => handleParagraphClick(index)}
                                >
                                    {para.text}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
