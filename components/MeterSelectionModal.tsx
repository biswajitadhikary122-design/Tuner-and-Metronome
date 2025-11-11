import React, { useState } from 'react';
import { CloseIcon } from './Icons';
import { TIME_SIGNATURES_DATA } from '../constants';
import type { TimeSignature } from '../types';

interface MeterSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ts: TimeSignature) => void;
  current: TimeSignature;
}

type Tab = 'Meters' | '#/#';

export const MeterSelectionModal: React.FC<MeterSelectionModalProps> = ({ isOpen, onClose, onSelect, current }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Meters');
  
  if (!isOpen) return null;

  const handleSelect = (ts: TimeSignature) => {
    onSelect(ts);
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
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-slate-300/50 dark:border-slate-700/50 rounded-xl shadow-2xl p-4 sm:p-6 flex flex-col max-h-[80vh] w-full max-w-md animate-fade-in-up"
        >
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <div className="flex items-center p-1 rounded-full bg-slate-200 dark:bg-slate-800">
                {(['Meters', '#/#'] as Tab[]).map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                            activeTab === tab 
                            ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm' 
                            : 'text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Close">
              <CloseIcon className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            {activeTab === 'Meters' && (
                <div className="grid grid-cols-3 gap-2 text-center">
                    {TIME_SIGNATURES_DATA.map((column, colIndex) => (
                        <div key={colIndex} className="flex flex-col gap-2">
                            {column.map(ts => (
                                <button 
                                    key={ts}
                                    onClick={() => handleSelect(ts)}
                                    className={`p-3 rounded-lg text-base font-semibold transition-colors ${
                                        current === ts 
                                        ? 'bg-teal-500 text-white' 
                                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white'
                                    }`}
                                >
                                    {ts.replace(/ /g, '\u00A0')}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}
             {activeTab === '#/#' && (
                <div className="flex items-center justify-center h-full text-black/70 dark:text-white/70">
                    <p>Custom meter selection coming soon!</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};