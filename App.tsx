
import React, { useState, useEffect, useCallback } from 'react';
import { TunerDisplay } from './components/TunerDisplay';
import { SettingsPanel } from './components/SettingsPanel';
import { usePitchDetector } from './hooks/usePitchDetector';
import type { NoteDetails, TuningSettings } from './types';
import { MicIcon, SettingsIcon } from './components/Icons';
import { SpectrumVisualizer } from './components/SpectrumVisualizer';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { Metronome } from './components/Metronome';
import { TimbreVisualizer } from './components/TimbreVisualizer';
import { ChordDetector } from './components/ChordDetector';
import { ThemeToggle } from './components/ThemeToggle';

type View = 'Tuner' | 'Metronome' | 'Theory AI';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('Tuner');
  const [audioStarted, setAudioStarted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [settings, setSettings] = useState<TuningSettings>(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      a4: 440,
      useSharps: true,
      smoothing: 0.7,
      preset: 'Guitar',
      debugMode: false,
      debugWaveform: false,
      timbreVisualizer: false,
      darkMode: savedDarkMode !== null ? JSON.parse(savedDarkMode) : prefersDark,
      voiceFeedback: false,
      transposition: 0,
      temperament: 'Equal',
      notationSystem: 'English',
      tuningTolerance: 5,
      targetFrequency: 440,
    };
  });

  const { note, confidence, spectrum, waveform, start, stop, isRunning } = usePitchDetector(settings);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('darkMode', JSON.stringify(settings.darkMode));
  }, [settings.darkMode]);

  const handleStart = useCallback(async () => {
    try {
      await start();
      setAudioStarted(true);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else {
          setError(`Error starting audio: ${err.message}`);
        }
      } else {
        setError('An unknown error occurred while starting audio.');
      }
      setAudioStarted(false);
    }
  }, [start]);

  useEffect(() => {
    // Stop tuner when switching away from the tuner view
    if (activeView !== 'Tuner' && isRunning) {
      stop();
      setAudioStarted(false);
    }
  }, [activeView, stop, isRunning]);
  
  const handleThemeToggle = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const renderTunerContent = () => {
    if (!audioStarted) {
      return (
        <div className="text-center flex flex-col items-center gap-6">
          <p className="text-slate-600 dark:text-slate-400 max-w-xs">
            Click the button to start the tuner. You will be asked for microphone permissions.
          </p>
          <button
            onClick={handleStart}
            className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 font-bold py-4 px-8 rounded-full flex items-center gap-3 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/10"
          >
            <MicIcon className="w-6 h-6" />
            Start Tuner
          </button>
          {error && <p className="text-red-600 dark:text-red-400 mt-4 text-sm max-w-xs">{error}</p>}
        </div>
      );
    }
    return (
      <>
        <TunerDisplay note={note} confidence={confidence} settings={settings} onSettingsChange={setSettings} />
        <div className="mt-8 w-full space-y-4">
          {settings.debugMode && spectrum && (
            <SpectrumVisualizer spectrum={spectrum} />
          )}
          {settings.debugWaveform && waveform && (
            <WaveformVisualizer waveform={waveform} />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen w-full flex flex-col items-center justify-start pt-12 sm:pt-20 md:pt-24 font-sans antialiased relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-grid-slate-100/[0.6] dark:bg-grid-slate-700/[0.2] [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-fuchsia-100/50 to-transparent dark:from-fuchsia-900/40 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-cyan-100/50 to-transparent dark:from-cyan-900/40 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md md:max-w-lg mx-auto z-10 flex flex-col h-full">
        <header className="flex justify-between items-center p-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200 tracking-wider">TUNER AND METRONOME</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle darkMode={settings.darkMode} onToggle={handleThemeToggle} />
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Open settings"
            >
              <SettingsIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </header>

        <nav className="flex justify-center mb-4 border-b border-slate-200 dark:border-slate-700/50">
            {(['Tuner', 'Metronome', 'Theory AI'] as View[]).map(view => (
                <button 
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={`px-4 sm:px-6 py-3 text-base sm:text-lg font-semibold transition-colors duration-200 focus:outline-none relative ${
                        activeView === view 
                        ? 'text-cyan-600 dark:text-cyan-400' 
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                >
                    {view}
                    {activeView === view && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 dark:bg-cyan-400"></div>}
                </button>
            ))}
        </nav>

        <main className="flex-grow flex flex-col items-center justify-center">
          {activeView === 'Tuner' && settings.timbreVisualizer && spectrum && isRunning && (
            <TimbreVisualizer spectrum={spectrum} confidence={confidence} note={note} />
          )}
          {activeView === 'Tuner' && renderTunerContent()}
          {activeView === 'Metronome' && <Metronome />}
          {activeView === 'Theory AI' && <ChordDetector settings={settings} />}
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
};

export default App;