import React from 'react';
import type { MetronomePreset } from '../types';
import { CloseIcon, TrashIcon } from './Icons';

interface PresetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: MetronomePreset[];
  isLoading: boolean;
  onLoad: (preset: MetronomePreset) => void;
  onDelete: (id: string) => void;
}

export const PresetManagerModal: React.FC<PresetManagerModalProps> = ({ isOpen, onClose, presets, isLoading, onLoad, onDelete }) => {
  if (!isOpen) return null;

  const handleLoad = (preset: MetronomePreset) => {
    onLoad(preset);
    onClose();
  };
  
  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-slate-400/50 border-t-slate-400 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (presets.length === 0) {
      return (
         <div className="flex items-center justify-center h-full">
            <p className="text-black/70 dark:text-white/70">No saved presets yet.</p>
        </div>
      );
    }
    
    return presets.map(preset => (
        <div key={preset.id} className="bg-gray-200/50 dark:bg-gray-800/50 p-3 rounded-lg flex justify-between items-center animate-fade-in">
            <div>
                <p className="font-semibold text-black dark:text-white">{preset.name}</p>
                <p className="text-xs text-black/70 dark:text-white/70">{preset.bpm} BPM, {preset.timeSignature}</p>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => handleLoad(preset)}
                    className="px-4 py-1.5 text-sm font-bold bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
                >
                    Load
                </button>
                <button 
                    onClick={() => onDelete(preset.id)}
                    disabled={preset.isDefault}
                    className="p-2 text-black dark:text-white hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-black dark:disabled:hover:text-white"
                    aria-label={`Delete preset ${preset.name}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    ));
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in-fast"
        onClick={onClose}
      ></div>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-300/50 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 flex flex-col h-[60vh] w-full max-w-sm animate-fade-in-up"
        >
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-2xl font-semibold text-black dark:text-white">Manage Presets</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Close"
            >
              <CloseIcon className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-2">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};