import React from 'react';
import type { MetronomePreset } from '../types';
import { CloseIcon, TrashIcon } from './Icons';

interface PresetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: MetronomePreset[];
  onLoad: (preset: MetronomePreset) => void;
  onDelete: (id: string) => void;
}

export const PresetManagerModal: React.FC<PresetManagerModalProps> = ({ isOpen, onClose, presets, onLoad, onDelete }) => {
  if (!isOpen) return null;

  const handleLoad = (preset: MetronomePreset) => {
    onLoad(preset);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in-fast"
        onClick={onClose}
      ></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm animate-fade-in-up">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-300/50 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 flex flex-col h-[60vh]">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Manage Presets</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Close"
            >
              <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-2">
            {presets.length > 0 ? (
                presets.map(preset => (
                    <div key={preset.id} className="bg-gray-200/50 dark:bg-gray-800/50 p-3 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{preset.name}</p>
                            <p className="text-xs text-gray-500">{preset.bpm} BPM, {preset.timeSignature}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleLoad(preset)}
                                className="px-4 py-1.5 text-sm font-bold bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-colors"
                            >
                                Load
                            </button>
                            <button 
                                onClick={() => onDelete(preset.id)}
                                className="p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                aria-label={`Delete preset ${preset.name}`}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No saved presets yet.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};