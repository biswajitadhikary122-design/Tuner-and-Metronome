
import React from 'react';
import type { TuningSettings, InstrumentPreset, Temperament, NotationSystem } from '../types';
import { CloseIcon, ChevronDownIcon } from './Icons';
import { PRESET_CATEGORIES } from '../constants';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TuningSettings;
  onSettingsChange: (newSettings: TuningSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const handleA4Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, a4: parseFloat(e.target.value) });
  };

  const handleSharpFlatToggle = () => {
    onSettingsChange({ ...settings, useSharps: !settings.useSharps });
  };
  
  const handleSmoothingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, smoothing: parseFloat(e.target.value) });
  };

  const handlePresetChange = (preset: InstrumentPreset) => {
    onSettingsChange({ ...settings, preset });
  };

  const handleDebugToggle = () => {
    onSettingsChange({ ...settings, debugMode: !settings.debugMode });
  }

  const handleWaveformToggle = () => {
    onSettingsChange({ ...settings, debugWaveform: !settings.debugWaveform });
  }

  const handleTimbreVisualizerToggle = () => {
    onSettingsChange({ ...settings, timbreVisualizer: !settings.timbreVisualizer });
  }

  const handleVoiceFeedbackToggle = () => {
    onSettingsChange({ ...settings, voiceFeedback: !settings.voiceFeedback });
  };

  const handleTranspositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, transposition: parseInt(e.target.value, 10) });
  };
  const handleTemperamentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSettingsChange({ ...settings, temperament: e.target.value as Temperament });
  };
  const handleNotationSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSettingsChange({ ...settings, notationSystem: e.target.value as NotationSystem });
  };
  const handleToleranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onSettingsChange({ ...settings, tuningTolerance: parseFloat(e.target.value) });
  };
  const handleTargetFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, targetFrequency: parseFloat(e.target.value) });
  };


  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl border-l border-slate-200/80 dark:border-slate-700/50 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Close settings"
            >
              <CloseIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          <div className="space-y-8 flex-grow overflow-y-auto pr-2">
            {/* Instrument Preset */}
            <div>
              <label htmlFor="instrument-preset-select" className="block text-lg text-slate-700 dark:text-slate-300 mb-3">Instrument Profile</label>
              <div className="relative">
                  <select
                    id="instrument-preset-select"
                    value={settings.preset}
                    onChange={(e) => handlePresetChange(e.target.value as InstrumentPreset)}
                    className="w-full p-3 rounded-lg font-semibold border transition-colors duration-200 appearance-none
                               bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-200
                               focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    {PRESET_CATEGORIES.map(({ category, instruments }) => (
                        <optgroup key={category} label={category}>
                            {instruments.map((preset) => (
                                <option key={preset} value={preset}>
                                    {preset}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600 dark:text-slate-400">
                    <ChevronDownIcon className="w-5 h-5" />
                  </div>
              </div>
            </div>

             {/* Target Frequency (Conditional) */}
             {settings.preset === 'Hz (Manual)' && (
                <div>
                    <label htmlFor="target-freq-slider" className="block text-lg text-slate-700 dark:text-slate-300 mb-2">Target Frequency</label>
                    <div className="flex items-center gap-4">
                        <input
                        id="target-freq-slider"
                        type="range"
                        min="20"
                        max="5000"
                        step="0.5"
                        value={settings.targetFrequency || 440}
                        onChange={handleTargetFrequencyChange}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                         <input
                            type="number"
                            value={settings.targetFrequency?.toFixed(1) || '440.0'}
                            onChange={handleTargetFrequencyChange}
                            className="font-mono text-cyan-600 dark:text-cyan-400 w-24 text-center bg-transparent p-1 rounded-md border border-slate-300 dark:border-slate-700"
                        />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-500 mt-2">Set the exact frequency to tune against.</p>
                </div>
             )}

             {/* Tuning Tolerance */}
             <div>
              <label htmlFor="tolerance-slider" className="block text-lg text-slate-700 dark:text-slate-300 mb-2">Tuning Tolerance</label>
              <div className="flex items-center gap-4">
                <input
                  id="tolerance-slider"
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={settings.tuningTolerance}
                  onChange={handleToleranceChange}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="font-mono text-cyan-600 dark:text-cyan-400 w-20 text-center">±{settings.tuningTolerance.toFixed(1)} c</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-500 mt-2">Sets the "in-tune" range on the display.</p>
            </div>

             {/* Transposition */}
             <div>
              <label htmlFor="transposition-slider" className="block text-lg text-slate-700 dark:text-slate-300 mb-2">Transposition</label>
              <div className="flex items-center gap-4">
                <input
                  id="transposition-slider"
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={settings.transposition}
                  onChange={handleTranspositionChange}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="font-mono text-cyan-600 dark:text-cyan-400 w-20 text-center">{settings.transposition > 0 ? '+' : ''}{settings.transposition} st</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-500 mt-2">Adjust for transposing instruments (e.g., +2 for B♭ Trumpet).</p>
            </div>

            {/* Notation System */}
            <div>
              <label htmlFor="notation-select" className="block text-lg text-slate-700 dark:text-slate-300 mb-3">Notation System</label>
              <div className="relative">
                  <select
                    id="notation-select"
                    value={settings.notationSystem}
                    onChange={handleNotationSystemChange}
                    className="w-full p-3 rounded-lg font-semibold border transition-colors duration-200 appearance-none
                              bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-200
                              focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="English">English (C, D, E)</option>
                    <option value="Solfege (Fixed Do)">Solfege (Do, Re, Mi)</option>
                    <option value="Northern European">Northern European (C, D, E, H)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600 dark:text-slate-400">
                    <ChevronDownIcon className="w-5 h-5" />
                  </div>
              </div>
            </div>

            {/* Temperament */}
            <div>
              <label htmlFor="temperament-select" className="block text-lg text-slate-700 dark:text-slate-300 mb-3">Temperament</label>
              <div className="relative">
                  <select
                    id="temperament-select"
                    value={settings.temperament}
                    onChange={handleTemperamentChange}
                    className="w-full p-3 rounded-lg font-semibold border transition-colors duration-200 appearance-none
                              bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-200
                              focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="Equal">Equal Temperament</option>
                    <option value="Just" disabled>Just Intonation (Coming Soon)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600 dark:text-slate-400">
                    <ChevronDownIcon className="w-5 h-5" />
                  </div>
              </div>
            </div>


            {/* Sharps/Flats Toggle */}
            <div>
              <label className="block text-lg text-slate-700 dark:text-slate-300 mb-3">Accidentals</label>
              <div className="relative inline-block w-40 h-10">
                <button
                  onClick={handleSharpFlatToggle}
                  className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-700 p-1 flex items-center transition-colors"
                  aria-label={`Switch to ${settings.useSharps ? 'flats' : 'sharps'}`}
                >
                  <span className={`absolute left-0 w-1/2 h-full rounded-full bg-white dark:bg-slate-700 shadow-lg transition-transform duration-300 ease-in-out ${settings.useSharps ? 'translate-x-0' : 'translate-x-full'}`}></span>
                  <span className={`w-1/2 z-10 font-bold ${settings.useSharps ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400'}`}>Sharps (#)</span>
                  <span className={`w-1/2 z-10 font-bold ${!settings.useSharps ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400'}`}>Flats (♭)</span>
                </button>
              </div>
            </div>

             {/* Smoothing Strength */}
             <div>
              <label htmlFor="smoothing-slider" className="block text-lg text-slate-700 dark:text-slate-300 mb-2">Smoothing Strength</label>
              <div className="flex items-center gap-4">
                <input
                  id="smoothing-slider"
                  type="range"
                  min="0"
                  max="0.95"
                  step="0.05"
                  value={settings.smoothing}
                  onChange={handleSmoothingChange}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="font-mono text-cyan-600 dark:text-cyan-400 w-20 text-center">{settings.smoothing.toFixed(2)}</span>
              </div>
               <p className="text-sm text-slate-600 dark:text-slate-500 mt-2">Higher values provide a more stable reading but react slower.</p>
            </div>
            
             {/* Accessibility */}
             <div className="border-t border-slate-200 dark:border-slate-700/50 pt-6">
              <h3 className="text-xl text-slate-700 dark:text-slate-300 mb-4">Accessibility</h3>
                <div>
                  <label className="block text-lg text-slate-700 dark:text-slate-300 mb-3">Voice Feedback</label>
                  <div className="relative inline-block w-40 h-10">
                    <button
                      onClick={handleVoiceFeedbackToggle}
                      className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-700 p-1 flex items-center transition-colors"
                      aria-label={`Turn ${settings.voiceFeedback ? 'off' : 'on'} voice feedback`}
                    >
                      <span className={`absolute left-0 w-1/2 h-full rounded-full bg-white dark:bg-slate-700 shadow-lg transition-transform duration-300 ease-in-out ${settings.voiceFeedback ? 'translate-x-full' : 'translate-x-0'}`}></span>
                      <span className={`w-1/2 z-10 font-bold ${!settings.voiceFeedback ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Off</span>
                      <span className={`w-1/2 z-10 font-bold ${settings.voiceFeedback ? 'text-green-600 dark:text-green-300' : 'text-slate-500 dark:text-slate-400'}`}>On</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-500 mt-2">Announces "Sharp", "Flat", or "In Tune" (requires browser support).</p>
                </div>
            </div>

            {/* Debug Tools */}
            <div className="border-t border-slate-200 dark:border-slate-700/50 pt-6">
              <h3 className="text-xl text-slate-700 dark:text-slate-300 mb-4">Debug Tools</h3>
              <div className="space-y-6">
                 {/* Timbre Visualizer */}
                 <div>
                  <label className="block text-lg text-slate-700 dark:text-slate-300 mb-3">Timbre Orb</label>
                  <div className="relative inline-block w-40 h-10">
                    <button
                      onClick={handleTimbreVisualizerToggle}
                      className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-700 p-1 flex items-center transition-colors"
                      aria-label={`Turn ${settings.timbreVisualizer ? 'off' : 'on'} timbre visualizer`}
                    >
                      <span className={`absolute left-0 w-1/2 h-full rounded-full bg-white dark:bg-slate-700 shadow-lg transition-transform duration-300 ease-in-out ${settings.timbreVisualizer ? 'translate-x-full' : 'translate-x-0'}`}></span>
                      <span className={`w-1/2 z-10 font-bold ${!settings.timbreVisualizer ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Off</span>
                      <span className={`w-1/2 z-10 font-bold ${settings.timbreVisualizer ? 'text-sky-600 dark:text-sky-300' : 'text-slate-500 dark:text-slate-400'}`}>On</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-500 mt-2">Generative art that visualizes sound harmonics.</p>
                </div>
                 {/* Spectrum */}
                <div>
                  <label className="block text-lg text-slate-700 dark:text-slate-300 mb-3">Spectrum</label>
                  <div className="relative inline-block w-40 h-10">
                    <button
                      onClick={handleDebugToggle}
                      className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-700 p-1 flex items-center transition-colors"
                      aria-label={`Turn ${settings.debugMode ? 'off' : 'on'} spectrum visualizer`}
                    >
                      <span className={`absolute left-0 w-1/2 h-full rounded-full bg-white dark:bg-slate-700 shadow-lg transition-transform duration-300 ease-in-out ${settings.debugMode ? 'translate-x-full' : 'translate-x-0'}`}></span>
                      <span className={`w-1/2 z-10 font-bold ${!settings.debugMode ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Off</span>
                      <span className={`w-1/2 z-10 font-bold ${settings.debugMode ? 'text-fuchsia-600 dark:text-fuchsia-300' : 'text-slate-500 dark:text-slate-400'}`}>On</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-500 mt-2">Shows real-time audio spectrum (FFT).</p>
                </div>
                 {/* Waveform */}
                 <div>
                  <label className="block text-lg text-slate-700 dark:text-slate-300 mb-3">Waveform</label>
                  <div className="relative inline-block w-40 h-10">
                    <button
                      onClick={handleWaveformToggle}
                      className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-700 p-1 flex items-center transition-colors"
                      aria-label={`Turn ${settings.debugWaveform ? 'off' : 'on'} waveform visualizer`}
                    >
                      <span className={`absolute left-0 w-1/2 h-full rounded-full bg-white dark:bg-slate-700 shadow-lg transition-transform duration-300 ease-in-out ${settings.debugWaveform ? 'translate-x-full' : 'translate-x-0'}`}></span>
                      <span className={`w-1/2 z-10 font-bold ${!settings.debugWaveform ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Off</span>
                      <span className={`w-1/2 z-10 font-bold ${settings.debugWaveform ? 'text-purple-600 dark:text-purple-300' : 'text-slate-500 dark:text-slate-400'}`}>On</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-500 mt-2">Shows raw audio waveform (Time Domain).</p>
                </div>
              </div>
            </div>
          </div>
          
          <footer className="text-center text-slate-500 dark:text-slate-600 text-sm py-4 mt-auto">
            <p>Hybrid Tuner v1.0</p>
          </footer>
        </div>
      </div>
    </>
  );
};