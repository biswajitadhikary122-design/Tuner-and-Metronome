
import React, { useEffect, useRef } from 'react';
import type { TuningSettings, InstrumentPreset, Temperament } from '../types';
import { CloseIcon, ChevronDownIcon } from './Icons';
import { PRESET_CATEGORIES } from '../constants';
import { TranspositionSettings } from './TranspositionSettings';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TuningSettings;
  onSettingsChange: (newSettings: TuningSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleToleranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onSettingsChange({ ...settings, tuningTolerance: parseFloat(e.target.value) });
  };
  const handleTargetFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, targetFrequency: parseFloat(e.target.value) });
  };
  const handleDebugWaveformToggle = () => {
      onSettingsChange({ ...settings, debugWaveform: !settings.debugWaveform });
  };


  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-l border-slate-200/80 dark:border-slate-800 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-800 flex-shrink-0 bg-white/50 dark:bg-slate-900/50">
            <h2 id="settings-title" className="text-2xl font-bold text-black dark:text-white">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Close settings"
            >
              <CloseIcon className="w-6 h-6 text-black dark:text-white" />
            </button>
          </header>

          <div className="flex-grow p-5 overflow-y-auto space-y-8 text-black dark:text-white custom-scrollbar" ref={scrollRef}>
            
            {/* Main Transposition Interface */}
            <section className="-mx-2">
                <TranspositionSettings settings={settings} onSettingsChange={onSettingsChange} onClose={onClose} />
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Tuning Standard */}
            <section className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Instrument Range</label>
                
                {/* Tuning Preset */}
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Optimization Preset</label>
                    <div className="relative">
                        <select
                            value={settings.preset}
                            onChange={(e) => handlePresetChange(e.target.value as InstrumentPreset)}
                            className="w-full p-3 rounded-xl font-semibold border transition-colors duration-200 appearance-none
                                       bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700
                                       focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                            <ChevronDownIcon className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 px-1">Optimizes pitch detection range for specific instruments.</p>
                </div>
                
                {/* Hz (Manual) Mode Setting */}
                {settings.preset === 'Hz (Manual)' && (
                    <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                        <label htmlFor="targetFrequency" className="block text-sm font-bold text-teal-800 dark:text-teal-300 mb-2">
                            Target Frequency ({settings.targetFrequency?.toFixed(2) ?? '440.00'} Hz)
                        </label>
                        <input
                            id="targetFrequency"
                            type="range"
                            min="20"
                            max="5000"
                            step="0.1"
                            value={settings.targetFrequency || 440}
                            onChange={handleTargetFrequencyChange}
                            className="w-full h-2 bg-teal-200 dark:bg-teal-900 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:accent-teal-400"
                        />
                    </div>
                )}
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Display Options */}
            <section className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Display Options</label>
                <div className="grid grid-cols-1 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Accidentals Preference</label>
                        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={handleSharpFlatToggle}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!settings.useSharps ? 'bg-white dark:bg-slate-600 shadow-sm text-black dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                            >
                                ♭ Flat
                            </button>
                            <button
                                onClick={handleSharpFlatToggle}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${settings.useSharps ? 'bg-white dark:bg-slate-600 shadow-sm text-black dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                            >
                                ♯ Sharp
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Advanced Settings */}
            <section className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Advanced</label>
                 <div>
                    <div className="flex justify-between mb-1.5">
                        <label htmlFor="tolerance" className="text-sm font-medium text-slate-700 dark:text-slate-300">Tuning Tolerance</label>
                        <span className="text-sm font-bold">±{settings.tuningTolerance} cents</span>
                    </div>
                    <input
                        id="tolerance"
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={settings.tuningTolerance}
                        onChange={handleToleranceChange}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                </div>
                 <div>
                    <div className="flex justify-between mb-1.5">
                        <label htmlFor="smoothing" className="text-sm font-medium text-slate-700 dark:text-slate-300">Needle Smoothing</label>
                        <span className="text-sm font-bold">{(settings.smoothing * 100).toFixed(0)}%</span>
                    </div>
                    <input
                        id="smoothing"
                        type="range"
                        min="0"
                        max="0.95"
                        step="0.05"
                        value={settings.smoothing}
                        onChange={handleSmoothingChange}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Debugging */}
            <section className="space-y-4 pb-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Debugging</label>
                <div className="flex items-center justify-between">
                    <label htmlFor="debugModeToggle" className="font-medium text-slate-700 dark:text-slate-300 text-sm">Show Spectrum (FFT)</label>
                    <button
                        id="debugModeToggle"
                        role="switch"
                        aria-checked={settings.debugMode}
                        onClick={handleDebugToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-900 ${settings.debugMode ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.debugMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="waveformToggle" className="font-medium text-slate-700 dark:text-slate-300 text-sm">Show Waveform</label>
                    <button id="waveformToggle" role="switch" aria-checked={!!settings.debugWaveform} onClick={handleDebugWaveformToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-900 ${settings.debugWaveform ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.debugWaveform ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};
