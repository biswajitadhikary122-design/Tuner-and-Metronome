import React, { useState, useRef, useEffect } from 'react';
import { useMetronome } from '../hooks/useMetronome';
import { useMetronomePresets } from '../hooks/useMetronomePresets';
import { PlayIcon, PauseIcon, ChevronDownIcon, SoundIcon, QuarterNoteIcon, EighthNoteIcon, TripletIcon, SixteenthNoteIcon, GraphIcon, BeatIcon } from './Icons';
import type { TimeSignature, MetronomeSound, Subdivision, BeatEmphasis, MetronomePreset, TrainerConfig, SilenceConfig, AutoStopConfig } from '../types';
import { BpmInputModal } from './BpmInputModal';
import { BeatWheelVisualizer } from './BeatWheelVisualizer';
import { SoundSelectionModal } from './SoundSelectionModal';
import { PresetManagerModal } from './PresetManagerModal';
import { SavePresetModal } from './SavePresetModal';


const TrainerPanel: React.FC<{
    trainerConfig: TrainerConfig; setTrainerConfig: (c: TrainerConfig) => void;
    silenceConfig: SilenceConfig; setSilenceConfig: (c: SilenceConfig) => void;
    autoStopConfig: AutoStopConfig; setAutoStopConfig: (c: AutoStopConfig) => void;
}> = ({ trainerConfig, setTrainerConfig, silenceConfig, setSilenceConfig, autoStopConfig, setAutoStopConfig }) => {
    return (
        <div className="bg-black/5 dark:bg-black/20 p-4 rounded-lg space-y-4">
            {/* Auto Tempo Increase */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Auto Tempo Increase</label>
                    <input type="checkbox" className="accent-cyan-600 dark:accent-cyan-400 w-5 h-5"
                           checked={trainerConfig.enabled}
                           onChange={e => setTrainerConfig({...trainerConfig, enabled: e.target.checked})} />
                </div>
                <div className={`space-y-2 ${!trainerConfig.enabled && 'opacity-50'}`}>
                    <div className="flex items-center gap-4 text-sm">
                        <span>Increase by</span>
                        <input type="range" min="1" max="10" value={trainerConfig.bpmIncrease} disabled={!trainerConfig.enabled}
                               onChange={e => setTrainerConfig({...trainerConfig, bpmIncrease: +e.target.value})}
                               className="w-full h-2 bg-slate-300/80 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-400 flex-grow"/>
                        <span className="font-mono w-8 text-right">{trainerConfig.bpmIncrease}</span>
                    </div>
                     <div className="flex items-center gap-4 text-sm">
                        <span>Every</span>
                        <input type="range" min="1" max="16" value={trainerConfig.barInterval} disabled={!trainerConfig.enabled}
                               onChange={e => setTrainerConfig({...trainerConfig, barInterval: +e.target.value})}
                               className="w-full h-2 bg-slate-300/80 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-400 flex-grow"/>
                        <span className="font-mono w-8 text-right">{trainerConfig.barInterval} bars</span>
                    </div>
                </div>
            </div>
             {/* Bar Silencing */}
            <div className="border-t border-slate-300/50 dark:border-gray-700/50 pt-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Bar Silencing</label>
                    <input type="checkbox" className="accent-cyan-600 dark:accent-cyan-400 w-5 h-5"
                           checked={silenceConfig.enabled}
                           onChange={e => setSilenceConfig({...silenceConfig, enabled: e.target.checked})} />
                </div>
                <div className={`space-y-2 ${!silenceConfig.enabled && 'opacity-50'}`}>
                    <div className="flex items-center gap-4 text-sm">
                        <span>Play for</span>
                        <input type="range" min="1" max="16" value={silenceConfig.barsToPlay} disabled={!silenceConfig.enabled}
                               onChange={e => setSilenceConfig({...silenceConfig, barsToPlay: +e.target.value})}
                               className="w-full h-2 bg-slate-300/80 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-400 flex-grow"/>
                        <span className="font-mono w-8 text-right">{silenceConfig.barsToPlay} bars</span>
                    </div>
                     <div className="flex items-center gap-4 text-sm">
                        <span>Mute for</span>
                        <input type="range" min="1" max="16" value={silenceConfig.barsToMute} disabled={!silenceConfig.enabled}
                               onChange={e => setSilenceConfig({...silenceConfig, barsToMute: +e.target.value})}
                               className="w-full h-2 bg-slate-300/80 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-400 flex-grow"/>
                        <span className="font-mono w-8 text-right">{silenceConfig.barsToMute} bars</span>
                    </div>
                </div>
            </div>
            {/* Auto Stop */}
            <div className="border-t border-slate-300/50 dark:border-gray-700/50 pt-4">
                 <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Auto-Stop</label>
                    <input type="checkbox" className="accent-cyan-600 dark:accent-cyan-400 w-5 h-5"
                           checked={autoStopConfig.enabled}
                           onChange={e => setAutoStopConfig({...autoStopConfig, enabled: e.target.checked})} />
                </div>
                <div className={`space-y-2 ${!autoStopConfig.enabled && 'opacity-50'}`}>
                     <div className="flex items-center gap-4 text-sm">
                        <span>Stop after</span>
                        <input type="range" min="1" max="100" value={autoStopConfig.bars} disabled={!autoStopConfig.enabled}
                               onChange={e => setAutoStopConfig({...autoStopConfig, bars: +e.target.value})}
                               className="w-full h-2 bg-slate-300/80 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-400 flex-grow"/>
                        <span className="font-mono w-8 text-right">{autoStopConfig.bars} bars</span>
                    </div>
                </div>
            </div>
        </div>
    )
};


export const Metronome: React.FC = () => {
  const metronome = useMetronome();
  const presets = useMetronomePresets();
  
  {/* FIX: Corrected useState declarations which were causing syntax errors. */}
  const [isBpmModalOpen, setIsBpmModalOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isTrainerOpen, setIsTrainerOpen] = useState(false);
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
  const [isSavePresetOpen, setIsSavePresetOpen] = useState(false);
  
  const bpmChangeInterval = useRef<number | null>(null);

  const TIME_SIGNATURES: TimeSignature[] = ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8', '9/8', '12/8'];
  const SUBDIVISION_OPTIONS: { value: Subdivision, label: string, Icon: React.FC<any> }[] = [
    { value: '1n', label: 'Quarter', Icon: QuarterNoteIcon },
    { value: '2n', label: 'Eighth', Icon: EighthNoteIcon },
    { value: '3n', label: 'Triplet', Icon: TripletIcon },
    { value: '4n', label: 'Sixteenth', Icon: SixteenthNoteIcon }
  ];

  const handleBpmChange = (amount: number) => metronome.setBpm(prev => Math.max(40, Math.min(240, prev + amount)));
  const startBpmChange = (amount: number) => {
    handleBpmChange(amount);
    bpmChangeInterval.current = window.setInterval(() => { handleBpmChange(amount); }, 100);
  };
  const stopBpmChange = () => {
    if (bpmChangeInterval.current) { clearInterval(bpmChangeInterval.current); bpmChangeInterval.current = null; }
  };
  
  const handleSubdivisionClick = (value: Subdivision) => {
      if (value === '2n' && metronome.subdivision === '2n') {
          metronome.setIsSwingActive(!metronome.isSwingActive);
      } else {
          metronome.setSubdivision(value);
          metronome.setIsSwingActive(false);
      }
  };

  const handleBeatEmphasisChange = (beatIndex: number) => {
    if (metronome.isPlaying) return; // Prevent changes while playing for simplicity

    const newPattern = [...metronome.emphasisPattern];
    const currentEmphasis = newPattern[beatIndex];

    // Cycle through emphasis: regular -> accent -> silent -> regular
    if (currentEmphasis === 'regular') {
        newPattern[beatIndex] = 'accent';
    } else if (currentEmphasis === 'accent') {
        newPattern[beatIndex] = 'silent';
    } else { // 'silent'
        newPattern[beatIndex] = 'regular';
    }
    
    metronome.setEmphasisPattern(newPattern);
  };

  const handleSavePreset = (name: string) => {
    const newPreset: Omit<MetronomePreset, 'id'> = {
        name,
        bpm: metronome.bpm,
        timeSignature: metronome.timeSignature,
        subdivision: metronome.subdivision,
        emphasisPattern: metronome.emphasisPattern,
        isSwingActive: metronome.isSwingActive,
        sound: metronome.sound,
        volume: metronome.volume,
        isCountInEnabled: metronome.isCountInEnabled,
        trainerConfig: metronome.trainerConfig,
        silenceConfig: metronome.silenceConfig,
        autoStopConfig: metronome.autoStopConfig,
    };
    presets.savePreset(newPreset);
    setIsSavePresetOpen(false);
  };

  const currentPresetName = metronome.activePresetId 
    ? presets.presets.find(p => p.id === metronome.activePresetId)?.name ?? 'Custom Session'
    : 'Custom Session';
  
  useEffect(() => {
    const handleMouseUp = () => stopBpmChange();
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full sm:max-w-sm mx-auto">
        <BpmInputModal isOpen={isBpmModalOpen} onClose={() => setIsBpmModalOpen(false)} currentBpm={metronome.bpm} onSetBpm={metronome.setBpm}/>
        <SoundSelectionModal isOpen={isSoundModalOpen} onClose={() => setIsSoundModalOpen(false)} currentSound={metronome.sound} onSelectSound={metronome.setSound} onPreviewSound={metronome.playSoundPreview}/>
        <PresetManagerModal isOpen={isPresetManagerOpen} onClose={() => setIsPresetManagerOpen(false)} presets={presets.presets} onLoad={metronome.loadPreset} onDelete={presets.deletePreset} />
        <SavePresetModal isOpen={isSavePresetOpen} onClose={() => setIsSavePresetOpen(false)} onSave={handleSavePreset} />
       
        <div className="w-full bg-transparent text-slate-900 dark:text-slate-100 sm:rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
            
            {/* Preset Header */}
            <div className="flex justify-between items-center bg-black/5 dark:bg-black/20 -m-2 mb-2 p-2 px-4 rounded-t-lg">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate pr-2" title={currentPresetName}>{currentPresetName}</span>
                <div className="flex gap-2">
                    <button onClick={() => setIsSavePresetOpen(true)} className="text-xs font-bold text-cyan-600 dark:text-cyan-300 hover:text-cyan-500 dark:hover:text-cyan-200">Save</button>
                    <button onClick={() => setIsPresetManagerOpen(true)} className="text-xs font-bold text-cyan-600 dark:text-cyan-300 hover:text-cyan-500 dark:hover:text-cyan-200">Manage</button>
                </div>
            </div>

            <div className="flex justify-end items-center h-8">
                 <div className="relative">
                    <select value={metronome.timeSignature} onChange={(e) => metronome.setTimeSignature(e.target.value as TimeSignature)} className="appearance-none bg-transparent font-semibold text-slate-700 dark:text-slate-300 p-2 pr-8 rounded-full text-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none text-lg">
                        {TIME_SIGNATURES.map(ts => <option key={ts} value={ts} className="bg-white dark:bg-gray-800">{ts}</option>)}
                    </select>
                     <ChevronDownIcon className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-gray-400" />
                 </div>
            </div>

            <div className="relative h-64 w-64 mx-auto my-2 flex items-center justify-center">
                <BeatWheelVisualizer 
                    beatsPerMeasure={metronome.beatsPerMeasure} 
                    currentBeat={metronome.currentBeat} 
                    isPlaying={metronome.isPlaying} 
                    emphasisPattern={metronome.emphasisPattern}
                    onBeatClick={!metronome.isPlaying ? handleBeatEmphasisChange : undefined}
                />
                <div className="absolute text-center">
                    <button onClick={() => setIsBpmModalOpen(true)} className="font-mono text-7xl font-light text-slate-800 dark:text-gray-100 tracking-tighter p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors" aria-label={`Current tempo is ${metronome.bpm} BPM. Click to edit.`}>
                        {metronome.bpm}
                    </button>
                    <p className="text-lg text-slate-600 dark:text-gray-400 -mt-2">BPM</p>
                </div>
            </div>

             {!metronome.isPlaying && (
                <p className="text-center text-xs text-slate-500 dark:text-gray-400 -mt-2 mb-2 animate-fade-in">
                    Tap a beat to change its emphasis.
                </p>
            )}
            
            <div className="flex items-center gap-4">
                 <button onMouseDown={() => startBpmChange(-1)} onMouseUp={stopBpmChange} onMouseLeave={stopBpmChange} className="w-12 h-12 rounded-full font-bold text-3xl text-slate-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/20 dark:active:bg-white/20 transition-colors flex-shrink-0">-</button>
                 <button onClick={metronome.togglePlay} className="w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-400/50 bg-slate-200 dark:bg-gray-700 border-4 border-slate-300 dark:border-gray-600 text-cyan-600 dark:text-cyan-300 hover:border-cyan-500 dark:hover:border-cyan-500 active:scale-95 shadow-lg flex-shrink-0" aria-label={metronome.isPlaying ? "Pause metronome" : "Play metronome"}>
                    {metronome.isPlaying ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10 pl-2" />}
                </button>
                <button onMouseDown={() => startBpmChange(1)} onMouseUp={stopBpmChange} onMouseLeave={stopBpmChange} className="w-12 h-12 rounded-full font-bold text-3xl text-slate-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/20 dark:active:bg-white/20 transition-colors flex-shrink-0">+</button>
            </div>
            <input type="range" min="40" max="240" step="1" value={metronome.bpm} onChange={(e) => metronome.setBpm(parseInt(e.target.value, 10))} className="w-full h-3 bg-slate-300/80 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-400" aria-label="Tempo slider" />

            <div className="flex justify-between items-center gap-2 p-1.5 rounded-full bg-black/5 dark:bg-black/20">
                <button
                    onClick={!metronome.isPlaying ? metronome.tapTempo : undefined}
                    disabled={metronome.isPlaying}
                    className="px-5 py-2 rounded-full text-base font-semibold text-slate-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/40 transition-colors flex-1 flex items-center justify-center gap-2 group"
                >
                    <BeatIcon className="w-5 h-5 transition-transform duration-100 ease-in-out group-active:scale-125 group-active:text-cyan-600 dark:group-active:text-cyan-300" />
                    <span>Tap</span>
                </button>
                <div className="flex items-center p-1 rounded-full bg-slate-300/50 dark:bg-gray-700/50 flex-1 justify-center relative">
                    {SUBDIVISION_OPTIONS.map(({ value, label, Icon }) => (
                        <button key={value} onClick={() => handleSubdivisionClick(value)} className={`p-2 rounded-full transition-colors duration-200 ${metronome.subdivision === value ? 'bg-white dark:bg-gray-900 text-cyan-600 dark:text-cyan-300 shadow-md' : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-100'}`} aria-label={`Set subdivision to ${label} note`}>
                           <Icon className="w-7 h-7" />
                        </button>
                    ))}
                    {metronome.subdivision === '2n' && metronome.isSwingActive && <div className="absolute -bottom-3 text-xs font-bold text-cyan-600 dark:text-cyan-300">Swing</div>}
                </div>
                 <button onClick={() => setIsSoundModalOpen(true)} className="p-3 rounded-full text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-1 flex justify-center items-center" aria-label="Change metronome sound">
                    <SoundIcon className="w-7 h-7" />
                 </button>
            </div>
             
            <div className="flex justify-between items-center gap-4 pt-2">
                <button onClick={() => metronome.setIsCountInEnabled(!metronome.isCountInEnabled)} className={`flex-1 text-center py-2 rounded-full text-sm font-semibold transition-colors ${metronome.isCountInEnabled ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300' : 'bg-black/5 dark:bg-black/20 text-slate-600 dark:text-gray-400'}`}>
                    Count In
                </button>
                <button onClick={() => setIsTrainerOpen(!isTrainerOpen)} className={`flex-1 text-center py-2 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${isTrainerOpen ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300' : 'bg-black/5 dark:bg-black/20 text-slate-600 dark:text-gray-400'}`}>
                    <GraphIcon className="w-4 h-4" /> Trainer
                </button>
            </div>
            
            {isTrainerOpen && <TrainerPanel 
                trainerConfig={metronome.trainerConfig} setTrainerConfig={metronome.setTrainerConfig} 
                silenceConfig={metronome.silenceConfig} setSilenceConfig={metronome.setSilenceConfig}
                autoStopConfig={metronome.autoStopConfig} setAutoStopConfig={metronome.setAutoStopConfig}
            />}

            <div className="pt-2">
                <label htmlFor="volume-slider" className="sr-only">Volume</label>
                <input id="volume-slider" type="range" min="0" max="1" step="0.01" value={metronome.volume} onChange={(e) => metronome.setVolume(parseFloat(e.target.value))} className="w-full h-2 bg-slate-300/80 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-400" />
            </div>
        </div>
    </div>
  );
};
