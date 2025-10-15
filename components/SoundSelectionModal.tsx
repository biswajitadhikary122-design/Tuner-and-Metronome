import React from 'react';
import type { MetronomeSound } from '../types';
import { CloseIcon } from './Icons';

interface SoundSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSound: MetronomeSound;
  onSelectSound: (sound: MetronomeSound) => void;
  onPreviewSound: (sound: MetronomeSound) => void;
}

const SOUND_OPTIONS: MetronomeSound[] = ['Click', 'Woodblock', 'Beep', 'Kick', 'Hi-Hat', 'Cowbell', 'Tick', 'Tock', 'Bell', 'Ping', 'Clave', 'Rimshot', 'Shaker', 'Triangle', 'Marimba'];

export const SoundSelectionModal: React.FC<SoundSelectionModalProps> = ({ isOpen, onClose, currentSound, onSelectSound, onPreviewSound }) => {
  if (!isOpen) {
    return null;
  }

  const handleSelect = (sound: MetronomeSound) => {
    onSelectSound(sound);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in-fast"
        onClick={onClose}
      ></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm animate-fade-in-up">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-300/50 dark:border-gray-700/50 rounded-xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Select Sound</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Close"
            >
              <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {SOUND_OPTIONS.map((sound) => (
              <div key={sound} className="flex flex-col gap-2">
                <button
                  onClick={() => onPreviewSound(sound)}
                  className={`w-full aspect-square rounded-lg text-lg font-semibold border-2 transition-all duration-200 flex justify-center items-center active:scale-95
                    ${
                      currentSound === sound
                        ? 'bg-cyan-500/20 dark:bg-cyan-500/30 border-cyan-500 dark:border-cyan-400 text-cyan-700 dark:text-cyan-300'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200/80 dark:hover:bg-gray-700/50'
                    }`}
                >
                  {sound}
                </button>
                <button 
                  onClick={() => handleSelect(sound)}
                  className="w-full text-center text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};