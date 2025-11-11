
import React, { useState, useEffect, useRef } from 'react';
import { usePitchDetector } from './hooks/usePitchDetector';
import { TunerDisplay } from './components/TunerDisplay';
import { SpectrumVisualizer } from './components/SpectrumVisualizer';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { SettingsPanel } from './components/SettingsPanel';
import { Metronome } from './components/Metronome';
import { TheoryGuide } from './components/TheoryGuide';
import { TheoryAISearch } from './components/TheoryAISearch';
import { PracticeCoach } from './components/PracticeCoach';
import { PianoGame } from './components/PianoGame';
import { LinearTuner } from './components/LinearTuner';
import { PanoTuner } from './components/PanoTuner';
import { StrobeTuner } from './components/StrobeTuner';
import { ThemeToggle } from './components/ThemeToggle';
import { PitchStabilityGraph } from './components/PitchStabilityGraph';
import { usePitchStability } from './hooks/usePitchStability';
import { useVoiceFeedback } from './hooks/useVoiceFeedback';
import { TimbreVisualizer } from './components/TimbreVisualizer';
import { HeroLogo } from './components/HeroLogo';

import type { TuningSettings, PlanStep } from './types';
import { 
    TuneIcon, 
    SettingsIcon, PulseIcon, WheelIcon, LinearScaleIcon, StrobeIcon,
    ChevronUpIcon, ChevronDownIcon, MicIcon
} from './components/Icons';
import { INSPIRATIONAL_QUOTES } from './services/data';

const DEFAULT_SETTINGS: TuningSettings = {
  a4: 440,
  useSharps: true,
  smoothing: 0.5,
  preset: 'Guitar',
  debugMode: false,
  darkMode: true, // Default to dark for the new look
  transposition: 0,
  selectedInstrumentKey: 'C Instruments',
  temperament: 'Equal',
  notationSystem: 'English',
  tuningTolerance: 5,
  visualizerMode: 'orb',
  targetFrequency: 440,
  debugWaveform: false,
  voiceFeedback: false,
  timbreVisualizer: false
};

type MainTab = 'Tuner' | 'Metronome' | 'Theory AI' | 'Coach';

export default function App() {
    // State
    const [settings, setSettings] = useState<TuningSettings>(() => {
        try {
            const saved = localStorage.getItem('tuningSettings');
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });
    const [activeTab, setActiveTab] = useState<MainTab>('Tuner');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPlayingGame, setIsPlayingGame] = useState(false);
    const [quote, setQuote] = useState(INSPIRATIONAL_QUOTES[0]);

    // Practice Coach State
    const [coachSessionActive, setCoachSessionActive] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<PlanStep[] | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [stepTimeLeft, setStepTimeLeft] = useState(0);
    const coachTimerRef = useRef<number | null>(null);

    // Tuner Hooks
    const pitchDetector = usePitchDetector(settings);
    const { stabilityScore, feedback: stabilityFeedback } = usePitchStability(pitchDetector.note, pitchDetector.confidence);
    useVoiceFeedback(pitchDetector.note, pitchDetector.confidence, settings);

    // Effects
    useEffect(() => {
        localStorage.setItem('tuningSettings', JSON.stringify(settings));
        if (settings.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings]);

    useEffect(() => {
        // Set a random quote on mount
        setQuote(INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)]);
    }, []);

    useEffect(() => {
        // Manage audio resources based on tab
        if (activeTab === 'Tuner' && !pitchDetector.isRunning) {
            // Tuner starts manually via button
        } else if (activeTab !== 'Tuner' && pitchDetector.isRunning) {
            pitchDetector.stop();
        }
    }, [activeTab, pitchDetector]);

    // Coach Logic
    useEffect(() => {
        if (coachSessionActive && stepTimeLeft > 0) {
            coachTimerRef.current = window.setTimeout(() => {
                setStepTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (coachSessionActive && stepTimeLeft === 0) {
            // Step finished
            if (currentPlan && currentStepIndex < currentPlan.length - 1) {
                const nextIndex = currentStepIndex + 1;
                setCurrentStepIndex(nextIndex);
                setStepTimeLeft(currentPlan[nextIndex].duration_seconds);
                // Auto-switch context if needed
                const nextStep = currentPlan[nextIndex];
                if (nextStep.module === 'Tuner') setActiveTab('Tuner');
                if (nextStep.module === 'Metronome') setActiveTab('Metronome');
            } else {
                setCoachSessionActive(false);
                alert("Practice session complete!");
            }
        }
        return () => {
            if (coachTimerRef.current) clearTimeout(coachTimerRef.current);
        };
    }, [coachSessionActive, stepTimeLeft, currentPlan, currentStepIndex]);

    const startPracticeSession = () => {
        if (currentPlan && currentPlan.length > 0) {
            setCurrentStepIndex(0);
            setStepTimeLeft(currentPlan[0].duration_seconds);
            setCoachSessionActive(true);
            // Switch to first module
            const firstStep = currentPlan[0];
            if (firstStep.module === 'Tuner') setActiveTab('Tuner');
            if (firstStep.module === 'Metronome') setActiveTab('Metronome');
        }
    };

    const stopPracticeSession = () => {
        setCoachSessionActive(false);
        if (coachTimerRef.current) clearTimeout(coachTimerRef.current);
    };

    if (isPlayingGame) {
        return <PianoGame settings={settings} onExit={() => setIsPlayingGame(false)} />;
    }

    const renderTuner = () => (
        <div className="flex flex-col items-center w-full animate-fade-in-up gap-6">
            
            {/* Visualizer Area */}
            <div className="w-full card p-0 overflow-hidden rounded-3xl relative bg-slate-900/40 border-slate-800">
                {!pitchDetector.isRunning && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm gap-4">
                       <p className="text-slate-400 text-sm">Ready to tune?</p>
                    </div>
                )}

                {settings.visualizerMode === 'orb' && (
                    <TunerDisplay 
                        note={pitchDetector.note} 
                        confidence={pitchDetector.confidence} 
                        settings={settings}
                        spectrum={pitchDetector.spectrum}
                    />
                )}
                {settings.visualizerMode === 'linear' && (
                    <LinearTuner 
                        note={pitchDetector.note} 
                        settings={settings} 
                        volume={pitchDetector.volume}
                    />
                )}
                {settings.visualizerMode === 'pano' && (
                    <PanoTuner 
                        note={pitchDetector.note} 
                        settings={settings} 
                    />
                )}
                {settings.visualizerMode === 'strobe' && (
                    <StrobeTuner 
                        note={pitchDetector.note} 
                        settings={settings} 
                    />
                )}

                {settings.timbreVisualizer && pitchDetector.spectrum && (
                    <TimbreVisualizer 
                        spectrum={pitchDetector.spectrum} 
                        confidence={pitchDetector.confidence} 
                        note={pitchDetector.note} 
                    />
                )}
            </div>

            {/* Tuner Mode Switcher */}
            <div className="segmented-control bg-white/10 dark:bg-slate-800/50 border border-white/10 backdrop-blur-md p-1">
                <button onClick={() => setSettings(s => ({...s, visualizerMode: 'orb'}))} title="Orb Tuner" className={`p-2 rounded-full ${!settings.visualizerMode || settings.visualizerMode === 'orb' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'}`}><PulseIcon className="w-5 h-5"/></button>
                <button onClick={() => setSettings(s => ({...s, visualizerMode: 'pano'}))} title="Pano Tuner" className={`p-2 rounded-full ${settings.visualizerMode === 'pano' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'}`}><WheelIcon className="w-5 h-5"/></button>
                <button onClick={() => setSettings(s => ({...s, visualizerMode: 'linear'}))} title="Linear Tuner" className={`p-2 rounded-full ${settings.visualizerMode === 'linear' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'}`}><LinearScaleIcon className="w-5 h-5"/></button>
                <button onClick={() => setSettings(s => ({...s, visualizerMode: 'strobe'}))} title="Strobe Tuner" className={`p-2 rounded-full ${settings.visualizerMode === 'strobe' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'}`}><StrobeIcon className="w-5 h-5"/></button>
            </div>

            {/* Controls: A4 & Stats */}
            <div className="w-full grid grid-cols-2 gap-4 px-2">
                <div className="card p-4 flex flex-col justify-between bg-slate-800/60 border-slate-700/50">
                    <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">A4 Ref</p>
                            <span className="text-[10px] font-bold text-slate-500">Hz</span>
                    </div>
                    
                    <div className="flex items-center justify-center mb-2">
                            <p className="text-3xl font-bold tracking-tighter text-slate-100">{settings.a4.toFixed(0)}</p>
                    </div>

                    <div className="flex justify-between items-end w-full gap-2">
                            <button onClick={() => setSettings(s => ({...s, a4: parseFloat(Math.max(430, s.a4 - 1).toFixed(1))}))} className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-md py-1 flex items-center justify-center transition-colors">
                            <ChevronDownIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSettings(s => ({...s, a4: parseFloat(Math.min(450, s.a4 + 1).toFixed(1))}))} className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-md py-1 flex items-center justify-center transition-colors">
                            <ChevronUpIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="card p-4 flex flex-col justify-between bg-slate-800/60 border-slate-700/50">
                    <div className="flex justify-between items-center">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Frequency</p>
                        <span className="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[60px]">{settings.preset}</span>
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                        <p className="text-3xl font-bold truncate text-slate-100">
                        {(pitchDetector.note?.frequency ?? 0).toFixed(1)}
                        </p>
                        <span className="text-xs font-normal text-slate-500">Hz</span>
                    </div>
                </div>
            </div>

            {/* Debug & Stability */}
            {settings.debugMode && pitchDetector.spectrum && (
                <div className="w-full px-2">
                    <SpectrumVisualizer spectrum={pitchDetector.spectrum} />
                </div>
            )}
            {settings.debugWaveform && pitchDetector.waveform && (
                <div className="w-full px-2">
                    <WaveformVisualizer waveform={pitchDetector.waveform} />
                </div>
            )}
            
            {pitchDetector.isRunning && (
                <div className="w-full px-2">
                    <div className="card p-0 overflow-hidden bg-slate-800/40 border-slate-700/50">
                        <PitchStabilityGraph note={pitchDetector.note} settings={settings} />
                        <div className="px-4 pb-2 flex justify-between text-[10px] text-slate-500">
                            <span>Score: {stabilityScore.toFixed(0)}</span>
                            <span>{stabilityFeedback}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500/30 pb-safe">
            
            {/* Mobile-first Layout Container */}
            <div className="max-w-md mx-auto w-full p-6 flex flex-col gap-6">
                
                {/* 1. Hero Image Card - Only visible on Home Page (Tuner tab, not started) */}
                {activeTab === 'Tuner' && !pitchDetector.isRunning && (
                    <div className="w-full aspect-square relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 group">
                        <HeroLogo className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                        {/* Overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none" />
                    </div>
                )}

                {/* 2. Control Bar: Theme Toggle | Title | Settings */}
                <div className="flex items-center justify-between px-2">
                    <div className="scale-90 origin-left">
                        <ThemeToggle darkMode={settings.darkMode} onToggle={() => setSettings(s => ({...s, darkMode: !s.darkMode}))} />
                    </div>
                    
                    <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 drop-shadow-sm">
                        TunerBeatsPro
                    </h1>

                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-300"
                        aria-label="Settings"
                    >
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* 3. Navigation Tabs */}
                <nav className="flex justify-between items-center px-2 pb-2 relative">
                    {(['Tuner', 'Metronome', 'Theory AI', 'Coach'] as MainTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 text-sm font-bold transition-all duration-300 relative whitespace-nowrap ${
                                activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-teal-500 rounded-full shadow-[0_0_10px_#2dd4bf]" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* 4. Main Content Area */}
                <main className="flex-grow flex flex-col items-center w-full gap-6 animate-fade-in">
                    
                    {activeTab === 'Tuner' && (
                        <>
                            {!pitchDetector.isRunning ? (
                                <button 
                                    onClick={pitchDetector.start}
                                    className="w-full py-4 rounded-full bg-gradient-to-r from-teal-400 to-teal-500 text-slate-900 font-bold text-lg shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:shadow-[0_0_30px_rgba(45,212,191,0.6)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 mt-2"
                                >
                                    <MicIcon className="w-6 h-6" />
                                    Start Tuning
                                </button>
                            ) : (
                                renderTuner()
                            )}

                            {!pitchDetector.isRunning && (
                                <div className="w-full card bg-slate-900/50 border-slate-800 p-6 text-center relative overflow-hidden group mt-4">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <p className="text-lg italic font-serif text-slate-400 mb-4 leading-relaxed">"{quote.text}"</p>
                                    <p className="text-sm font-bold text-teal-600 dark:text-teal-500 tracking-widest uppercase">- {quote.author}</p>
                                </div>
                            )}
                        </>
                    )}
                    
                    {activeTab === 'Metronome' && <div className="w-full"><Metronome /></div>}
                    
                    {activeTab === 'Theory AI' && (
                        <div className="w-full flex flex-col gap-6">
                            <TheoryAISearch />
                            <TheoryGuide />
                        </div>
                    )}

                    {activeTab === 'Coach' && (
                        <PracticeCoach 
                            isSessionActive={coachSessionActive}
                            currentStep={currentPlan ? currentPlan[currentStepIndex] : null}
                            timeLeftInStep={stepTimeLeft}
                            currentStepIndex={currentStepIndex}
                            totalSteps={currentPlan?.length || 0}
                            onPlanCreated={setCurrentPlan}
                            onSessionStart={startPracticeSession}
                            onSessionStop={stopPracticeSession}
                        />
                    )}
                </main>
            </div>

            <SettingsPanel 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                settings={settings} 
                onSettingsChange={setSettings} 
            />
        </div>
    );
}
