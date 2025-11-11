


import React, { useState, useRef, useEffect, useMemo, forwardRef } from 'react';
import { useMetronome } from '../hooks/useMetronome';
import { useMetronomePresets } from '../hooks/useMetronomePresets';
import { PlayIcon, PauseIcon, SoundIcon, ChevronDownIcon, GeminiIcon, PulseIcon, TilesIcon, BeatIcon, PendulumIcon } from './Icons';
import type { MetronomePreset, TrainerConfig, SilenceConfig, AutoStopConfig, MetronomeControls } from '../types';
import { BpmInputModal } from './BpmInputModal';
import { SoundSelectionModal } from './SoundSelectionModal';
import { PresetManagerModal } from './PresetManagerModal';
import { SavePresetModal } from './SavePresetModal';
import { MeterSelectionModal } from './MeterSelectionModal';
import { SubdivisionSelectionModal } from './SubdivisionSelectionModal';
import { SUBDIVISIONS_DATA } from '../constants';
import { generateGroove } from '../services/gemini';

// Visualizers
import { EnergyWaveVisualizer } from './EnergyWaveVisualizer';
import { TileVisualizer } from './TileVisualizer';
import { BeatWheelVisualizer } from './BeatWheelVisualizer';
import { PendulumVisualizer } from './PendulumVisualizer';


const TrainerPanel: React.FC<{
    trainerConfig: TrainerConfig; setTrainerConfig: (c: TrainerConfig) => void;
    silenceConfig: SilenceConfig; setSilenceConfig: (c: SilenceConfig) => void;
    autoStopConfig: AutoStopConfig; setAutoStopConfig: (c: AutoStopConfig) => void;
}> = ({ trainerConfig, setTrainerConfig, silenceConfig, setSilenceConfig, autoStopConfig, setAutoStopConfig }) => {
    return (
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
            {/* Auto Tempo Increase */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-slate-800 dark:text-slate-200">Auto Tempo</label>
                    <input type="checkbox" className="accent-accent w-5 h-5 bg-slate-700 border-slate-500 rounded"
                           checked={trainerConfig.enabled}
                           onChange={e => setTrainerConfig({...trainerConfig, enabled: e.target.checked})} />
                </div>
                <div className={`space-y-2 ${!trainerConfig.enabled && 'opacity-50'}`}>
                    <div className="flex items-center gap-4 text-sm">
                        <span>Increase by</span>
                        <span className="font-mono w-8 text-right">{trainerConfig.bpmIncrease}</span>
                    </div>
                     <div className="flex items-center gap-4 text-sm">
                        <span>Every</span>
                        <span className="font-mono w-8 text-right">{trainerConfig.barInterval} bars</span>
                    </div>
                </div>
            </div>
             {/* Bar Silencing */}
            <div className="border-t border-slate-200 dark:border-slate-700/70 pt-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-slate-800 dark:text-slate-200">Bar Silencing</label>
                    <input type="checkbox" className="accent-accent w-5 h-5 bg-slate-700 border-slate-500 rounded"
                           checked={silenceConfig.enabled}
                           onChange={e => setSilenceConfig({...silenceConfig, enabled: e.target.checked})} />
                </div>
                 <div className={`space-y-2 ${!silenceConfig.enabled && 'opacity-50'}`}>
                    <div className="flex items-center gap-4 text-sm">
                        <span>Play for</span>
                        <span className="font-mono w-8 text-right">{silenceConfig.barsToPlay} bars</span>
                    </div>
                     <div className="flex items-center gap-4 text-sm">
                        <span>Mute for</span>
                        <span className="font-mono w-8 text-right">{silenceConfig.barsToMute} bars</span>
                    </div>
                </div>
            </div>
            {/* Auto Stop */}
            <div className="border-t border-slate-200 dark:border-slate-700/70 pt-4">
                 <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-slate-800 dark:text-slate-200">Auto-Stop</label>
                    <input type="checkbox" className="accent-accent w-5 h-5 bg-slate-700 border-slate-500 rounded"
                           checked={autoStopConfig.enabled}
                           onChange={e => setAutoStopConfig({...autoStopConfig, enabled: e.target.checked})} />
                </div>
                <div className={`space-y-2 ${!autoStopConfig.enabled && 'opacity-50'}`}>
                     <div className="flex items-center gap-4 text-sm">
                        <span>Stop after</span>
                        <span className="font-mono w-8 text-right">{autoStopConfig.bars} bars</span>
                    </div>
                </div>
            </div>
        </div>
    )
};


export const Metronome = forwardRef<MetronomeControls, {}>((props, ref) => {
  const metronome = useMetronome(ref);
  const presets = useMetronomePresets();
  
  const [isBpmModalOpen, setIsBpmModalOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
  const [isSavePresetOpen, setIsSavePresetOpen] = useState(false);
  const [isMeterModalOpen, setIsMeterModalOpen] = useState(false);
  const [isSubdivisionModalOpen, setIsSubdivisionModalOpen] = useState(false);
  const [activeVisualizer, setActiveVisualizer] = useState<'pulse' | 'tiles' | 'circle' | 'pendulum'>('pulse');

  const [groovePrompt, setGroovePrompt] = useState('');
  const [isGeneratingGroove, setIsGeneratingGroove] = useState(false);
  const [grooveError, setGrooveError] = useState<string | null>(null);
  
  const currentPresetName = metronome.activePresetId 
    ? presets.presets.find(p => p.id === metronome.activePresetId)?.name ?? 'Custom Session'
    : 'Custom Session';
  
  const currentSubdivision = useMemo(() => {
    return SUBDIVISIONS_DATA.find(s => s.id === metronome.subdivision) || SUBDIVISIONS_DATA[0];
  }, [metronome.subdivision]);

  const handleSavePreset = (name: string) => {
    const newPreset: Omit<MetronomePreset, 'id' | 'isDefault'> = {
        name, bpm: metronome.bpm, timeSignature: metronome.timeSignature, subdivision: metronome.subdivision,
        emphasisPattern: metronome.emphasisPattern, isSwingActive: metronome.isSwingActive, sound: metronome.sound,
        volume: metronome.volume, isCountInEnabled: metronome.isCountInEnabled, trainerConfig: metronome.trainerConfig,
        silenceConfig: metronome.silenceConfig, autoStopConfig: metronome.autoStopConfig,
    };
    presets.savePreset(newPreset);
    setIsSavePresetOpen(false);
  };

  const handleGenerateGroove = async () => {
    if (!groovePrompt.trim()) return;
    setIsGeneratingGroove(true);
    setGrooveError(null);
    try {
        const newPattern = await generateGroove(groovePrompt, metronome.timeSignature);
        metronome.setEmphasisPattern(newPattern);
    } catch (err) {
        setGrooveError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
        setIsGeneratingGroove(false);
    }
  };

  const renderVisualizer = () => {
    switch (activeVisualizer) {
        case 'pulse': return <EnergyWaveVisualizer currentBeat={metronome.currentBeat} isPlaying={metronome.isPlaying} emphasisPattern={metronome.emphasisPattern} />;
        case 'tiles': return <TileVisualizer currentBeat={metronome.currentBeat} isPlaying={metronome.isPlaying} emphasisPattern={metronome.emphasisPattern} beatsPerMeasure={metronome.beatsPerMeasure} grouping={metronome.grouping} onBeatClick={metronome.cycleEmphasisForBeat} />;
        case 'circle': return <BeatWheelVisualizer currentBeat={metronome.currentBeat} isPlaying={metronome.isPlaying} emphasisPattern={metronome.emphasisPattern} beatsPerMeasure={metronome.beatsPerMeasure} onBeatClick={metronome.cycleEmphasisForBeat} />;
        case 'pendulum': return <PendulumVisualizer currentBeat={metronome.currentBeat} isPlaying={metronome.isPlaying} emphasisPattern={metronome.emphasisPattern} bpm={metronome.bpm} />;
    }
  }


  return (
    <div className="w-full h-full flex flex-col lg:flex-row items-start lg:justify-center gap-6 animate-fade-in-up p-4">
        <BpmInputModal isOpen={isBpmModalOpen} onClose={() => setIsBpmModalOpen(false)} currentBpm={metronome.bpm} onSetBpm={metronome.setBpm}/>
        <SoundSelectionModal isOpen={isSoundModalOpen} onClose={() => setIsSoundModalOpen(false)} currentSound={metronome.sound} onSelectSound={metronome.setSound} onPreviewSound={metronome.playSoundPreview}/>
        <PresetManagerModal isOpen={isPresetManagerOpen} onClose={() => setIsPresetManagerOpen(false)} presets={presets.presets} isLoading={presets.isLoading} onLoad={metronome.loadPreset} onDelete={presets.deletePreset} />
        <SavePresetModal isOpen={isSavePresetOpen} onClose={() => setIsSavePresetOpen(false)} onSave={handleSavePreset} />
        <MeterSelectionModal isOpen={isMeterModalOpen} onClose={() => setIsMeterModalOpen(false)} onSelect={metronome.setTimeSignature} current={metronome.timeSignature} />
        <SubdivisionSelectionModal isOpen={isSubdivisionModalOpen} onClose={() => setIsSubdivisionModalOpen(false)} onSelect={metronome.setSubdivision} current={metronome.subdivision}/>
       
        <div className="w-full lg:max-w-md card p-6 flex flex-col gap-4">
            <div 
              key={activeVisualizer}
              className={`relative w-full mx-auto flex items-center justify-center ${activeVisualizer === 'tiles' ? 'min-h-[12rem]' : 'h-48'}`}
            >
                {renderVisualizer()}
            </div>
            
            <div className="flex items-center justify-center gap-4">
                <button onClick={() => metronome.setBpm(p => Math.max(40, p - 1))} className="w-14 h-14 rounded-full font-bold text-3xl bg-slate-100 dark:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 flex-shrink-0 flex items-center justify-center">-</button>
                 <button onClick={metronome.togglePlay} className="w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-200 ease-in-out text-accent bg-accent/10 hover:bg-accent/20 active:scale-95 flex-shrink-0" aria-label={metronome.isPlaying ? "Pause metronome" : "Play metronome"}>
                    {metronome.isPlaying ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10 pl-2" />}
                </button>
                <button onClick={() => metronome.setBpm(p => Math.min(240, p + 1))} className="w-14 h-14 rounded-full font-bold text-3xl bg-slate-100 dark:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 flex-shrink-0 flex items-center justify-center">+</button>
            </div>
            <input type="range" min="40" max="240" step="1" value={metronome.bpm} onChange={(e) => metronome.setBpm(parseInt(e.target.value, 10))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent" aria-label="Tempo slider" />
            
            <div className="flex items-center justify-between gap-4 mt-2">
                <button onClick={metronome.tapTempo} className="w-auto px-8 py-4 rounded-full text-lg font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all">
                    Tap Tempo
                </button>
                <div className="text-right">
                    <button onClick={() => setIsBpmModalOpen(true)} className="font-sans text-5xl font-bold tracking-tighter p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors" aria-label={`Current tempo is ${metronome.bpm} BPM. Click to edit.`}>
                        {metronome.bpm}
                    </button>
                    <p className="text-sm text-slate-500 dark:text-slate-400 -mt-1">BPM</p>
                </div>
            </div>
        </div>

        <div className="w-full lg:max-w-md space-y-4">
            <div className="card p-4">
                 <h3 className="font-bold text-lg mb-2 px-2">Rhythm</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Meter</span>
                        <button onClick={() => setIsMeterModalOpen(true)} className="w-full text-center text-3xl font-bold p-1 h-12 flex items-center justify-center">{metronome.timeSignature}</button>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Subdivision</span>
                        <button onClick={() => setIsSubdivisionModalOpen(true)} className="w-full flex flex-col justify-center items-center p-1 h-12" aria-label={`Current subdivision: ${currentSubdivision.name}. Click to change.`}>
                            <currentSubdivision.Icon className="w-auto h-10"/>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="card p-4">
                <h3 className="font-bold text-lg mb-2 px-2">Visualizer</h3>
                 <div className="segmented-control w-full">
                    <button onClick={() => setActiveVisualizer('pulse')} className={`w-1/4 flex justify-center ${activeVisualizer === 'pulse' ? 'active' : ''}`}><PulseIcon className="w-6 h-6" /></button>
                    <button onClick={() => setActiveVisualizer('tiles')} className={`w-1/4 flex justify-center ${activeVisualizer === 'tiles' ? 'active' : ''}`}><TilesIcon className="w-6 h-6" /></button>
                    <button onClick={() => setActiveVisualizer('circle')} className={`w-1/4 flex justify-center ${activeVisualizer === 'circle' ? 'active' : ''}`}><BeatIcon className="w-6 h-6" /></button>
                    <button onClick={() => setActiveVisualizer('pendulum')} className={`w-1/4 flex justify-center ${activeVisualizer === 'pendulum' ? 'active' : ''}`}><PendulumIcon className="w-6 h-6" /></button>
                </div>
            </div>
            
             <div className="card p-4">
                <h3 className="font-bold text-lg mb-2 px-2">Sound & Feel</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <SoundIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <input type="range" min="0" max="1" step="0.01" value={metronome.volume} onChange={e => metronome.setVolume(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent" aria-label="Volume slider" />
                        <button onClick={() => setIsSoundModalOpen(true)} className="py-1 px-4 rounded-full text-sm font-semibold whitespace-nowrap bg-slate-100 dark:bg-slate-800">{metronome.sound}</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => metronome.setIsCountInEnabled(!metronome.isCountInEnabled)} className={`flex-1 text-center py-2 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${metronome.isCountInEnabled ? 'bg-accent/20 text-accent' : 'bg-slate-100 dark:bg-slate-800'}`}>Count In</button>
                        <button onClick={() => metronome.setIsSwingActive(!metronome.isSwingActive)} className={`flex-1 text-center py-2 rounded-full text-sm font-semibold transition-colors flex items-center justify-center ${metronome.isSwingActive ? 'bg-accent/20 text-accent' : 'bg-slate-100 dark:bg-slate-800'}`}>Swing</button>
                    </div>
                </div>
            </div>

            <div className="card p-4">
                 <h3 className="font-bold text-lg mb-2 px-2">Presets</h3>
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setIsSavePresetOpen(true)} className="flex-1 text-center py-2.5 rounded-full text-sm font-semibold bg-slate-100 dark:bg-slate-800">Save</button>
                    <button onClick={() => setIsPresetManagerOpen(true)} className="flex-1 text-center py-2.5 rounded-full text-sm font-semibold bg-slate-100 dark:bg-slate-800">Presets</button>
                </div>
                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2 truncate h-4">{currentPresetName}</p>
            </div>
            
            <details className="accordion-card">
                <summary>AI Groove Generator <GeminiIcon className="w-5 h-5"/>
                    <ChevronDownIcon className="w-5 h-5 text-slate-400 transform transition-transform duration-200 group-open:rotate-180"/>
                </summary>
                <div className="accordion-content">
                    <div className="flex flex-col gap-2 pt-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Describe a rhythm and let AI create an emphasis pattern for you.</p>
                        <div className="flex items-center gap-2">
                            <input
                                value={groovePrompt}
                                onChange={(e) => setGroovePrompt(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateGroove(); }}
                                placeholder="e.g., funky disco beat"
                                className="w-full p-2 rounded-md border bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-accent"
                                disabled={isGeneratingGroove}
                            />
                            <button
                                onClick={handleGenerateGroove}
                                disabled={isGeneratingGroove || !groovePrompt.trim()}
                                className="p-2.5 rounded-full bg-indigo-500 text-white disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors flex items-center justify-center"
                                aria-label="Generate Groove"
                            >
                                {isGeneratingGroove ? (
                                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <GeminiIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {grooveError && <p className="text-xs text-red-500 mt-1">{grooveError}</p>}
                    </div>
                </div>
            </details>

            <details className="accordion-card">
                <summary>Practice Tools
                    <ChevronDownIcon className="w-5 h-5 text-slate-400 transform transition-transform duration-200 group-open:rotate-180"/>
                </summary>
                <div className="accordion-content pt-4">
                    <TrainerPanel trainerConfig={metronome.trainerConfig} setTrainerConfig={metronome.setTrainerConfig} silenceConfig={metronome.silenceConfig} setSilenceConfig={metronome.setSilenceConfig} autoStopConfig={metronome.autoStopConfig} setAutoStopConfig={metronome.setAutoStopConfig} />
                </div>
            </details>

        </div>
    </div>
  );
});