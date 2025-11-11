import React from 'react';
import { CloseIcon } from './Icons';
import { SUBDIVISIONS_DATA } from '../constants';
import type { Subdivision } from '../types';

interface SubdivisionSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (subdivision: Subdivision) => void;
  current: Subdivision;
}

export const SubdivisionSelectionModal: React.FC<SubdivisionSelectionModalProps> = ({ isOpen, onClose, onSelect, current }) => {
  if (!isOpen) return null;

  const handleSelect = (subdivision: Subdivision) => {
    onSelect(subdivision);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 animate-fade-in-fast" onClick={onClose}></div>
       <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-slate-300/50 dark:border-slate-700/50 rounded-xl shadow-2xl p-4 sm:p-6 flex flex-col max-h-[80vh] w-full max-w-sm animate-fade-in-up"
        >
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-2xl font-semibold text-black dark:text-white">Select Subdivision</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Close">
              <CloseIcon className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto -mr-2 pr-2">
            <div className="grid grid-cols-2 gap-3">
                {SUBDIVISIONS_DATA.map(({ id, Icon, name }) => (
                    <button 
                        key={id}
                        onClick={() => handleSelect(id)}
                        className={`w-full p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors aspect-video ${
                            current === id
                            ? 'bg-teal-500'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <Icon className={`w-auto h-10 ${current === id ? 'text-white' : 'text-black dark:text-white'}`} />
                        <span className={`text-xs font-semibold text-center truncate ${current === id ? 'text-white' : 'text-black dark:text-white'}`}>
                            {name}
                        </span>
                    </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};