
import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { TuningSettings, NotationSystem } from '../types';
import { INSTRUMENT_DATA, NOTATION_MAPS, NOTE_NAMES_FLAT } from '../services/data';
import { ChevronUpIcon, ChevronDownIcon } from './Icons';

interface TranspositionSettingsProps {
  settings: TuningSettings;
  onSettingsChange: (newSettings: TuningSettings) => void;
  onClose?: () => void;
}

// Quick keys configuration
const QUICK_KEYS = [
    { label: 'C', offset: 0 },
    { label: 'B♭', offset: -2 },
    { label: 'E♭', offset: 3 },
    { label: 'F', offset: 5 },
];

const ITEM_HEIGHT = 56; // Height of each scroll item in pixels

export const TranspositionSettings: React.FC<TranspositionSettingsProps> = ({ settings, onSettingsChange, onClose }) => {
  const semitoneScrollRef = useRef<HTMLDivElement>(null);
  const instrumentScrollRef = useRef<HTMLDivElement>(null);
  const [isInteractingWith, setIsInteractingWith] = useState<'semitone' | 'instrument' | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  // --- Data Preparation ---

  // 1. Semitone List Data (-12 to +12 covers most)
  const semitoneRows = useMemo(() => {
      const rows = [];
      for (let i = -15; i <= 15; i++) {
          const offset = i;
          const index = (offset % 12 + 12) % 12;
          let relativeOffset = index;
          if (relativeOffset > 6) relativeOffset -= 12;
          
          const name = NOTE_NAMES_FLAT[index];
          // Displaying absolute offset from Concert C
          const offsetLabel = offset === 0 ? '+0' : (offset > 0 ? `+${offset}` : `${offset}`);
          
          rows.push({
              id: offset,
              label: name,
              subLabel: `(${offsetLabel})`, 
              value: offset
          });
      }
      return rows;
  }, []);

  // 2. Instrument List Data (Flattened and Sorted)
  const instrumentRows = useMemo(() => {
      const allInstruments = Object.values(INSTRUMENT_DATA).map(inst => ({
          id: inst.name,
          name: inst.name,
          // Calculate total semitone offset (interval + octave shift)
          totalOffset: inst.offset + (inst.octave * 12),
      }));

      // Add a generic "Concert Instruments" item if not present
      if (!allInstruments.find(i => i.totalOffset === 0 && i.name.includes('Concert'))) {
          allInstruments.push({ id: 'Concert Instruments', name: 'Concert Instruments', totalOffset: 0 });
      }

      // Sort by Offset first (ascending), then Name
      allInstruments.sort((a, b) => {
          if (a.totalOffset !== b.totalOffset) return a.totalOffset - b.totalOffset;
          return a.name.localeCompare(b.name);
      });

      return allInstruments;
  }, []);


  // --- Sync Logic ---
  const currentOffset = settings.transposition; 

  // Scroll to position based on current settings (Source of Truth)
  useEffect(() => {
      // 1. Sync Semitone Wheel
      if (semitoneScrollRef.current && isInteractingWith !== 'semitone') {
          const rowIndex = semitoneRows.findIndex(r => r.value === currentOffset);
          if (rowIndex !== -1) {
              semitoneScrollRef.current.scrollTo({ top: rowIndex * ITEM_HEIGHT, behavior: 'smooth' });
          }
      }

      // 2. Sync Instrument Wheel
      if (instrumentScrollRef.current && isInteractingWith !== 'instrument') {
          let instIndex = -1;
          
          // If specific instrument key is saved, prioritize that
          if (settings.selectedInstrumentKey) {
             instIndex = instrumentRows.findIndex(r => r.name === settings.selectedInstrumentKey);
          }
          
          // Fallback: Find first instrument with this offset
          if (instIndex === -1) {
             instIndex = instrumentRows.findIndex(r => r.totalOffset === currentOffset);
          }

          if (instIndex !== -1) {
              instrumentScrollRef.current.scrollTo({ top: instIndex * ITEM_HEIGHT, behavior: 'smooth' });
          }
      }
  }, [currentOffset, settings.selectedInstrumentKey, isInteractingWith, semitoneRows, instrumentRows]);


  // --- Scroll Handlers ---

  const handleScroll = (type: 'semitone' | 'instrument') => {
      // Clear timeout if scrolling continues
      if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
      }

      if (isInteractingWith !== type) {
          setIsInteractingWith(type);
      }

      // Set a timeout to detect "stop" scrolling
      scrollTimeoutRef.current = window.setTimeout(() => {
          handleScrollStop(type);
      }, 150); // 150ms debounce to detect stop
  };

  const handleScrollStop = (type: 'semitone' | 'instrument') => {
      let newTransposition = currentOffset;
      let newInstrumentKey = settings.selectedInstrumentKey;

      if (type === 'semitone' && semitoneScrollRef.current) {
          const scrollTop = semitoneScrollRef.current.scrollTop;
          const index = Math.round(scrollTop / ITEM_HEIGHT);
          const item = semitoneRows[index];
          
          if (item) {
              newTransposition = item.value;
              
              const matchingInst = instrumentRows.find(r => r.totalOffset === item.value);
              newInstrumentKey = matchingInst ? matchingInst.name : ''; 
          }
      } else if (type === 'instrument' && instrumentScrollRef.current) {
          const scrollTop = instrumentScrollRef.current.scrollTop;
          const index = Math.round(scrollTop / ITEM_HEIGHT);
          const item = instrumentRows[index];

          if (item) {
              newTransposition = item.totalOffset;
              newInstrumentKey = item.name;
          }
      }
      
      // Apply changes
      if (newTransposition !== settings.transposition || newInstrumentKey !== settings.selectedInstrumentKey) {
          onSettingsChange({
              ...settings,
              transposition: newTransposition,
              selectedInstrumentKey: newInstrumentKey
          });
      }
      
      // Release interaction lock to allow the other wheel to snap to the new value
      setIsInteractingWith(null);
  };

  const handleQuickKey = (offset: number) => {
      // Find generic match
      const match = instrumentRows.find(r => r.totalOffset === offset);
      onSettingsChange({
          ...settings,
          transposition: offset,
          selectedInstrumentKey: match ? match.name : ''
      });
  };

  // --- Other Controls ---
  const adjustA4 = (delta: number) => {
      const newA4 = parseFloat((settings.a4 + delta).toFixed(1));
      if (newA4 >= 420 && newA4 <= 460) {
          onSettingsChange({ ...settings, a4: newA4 });
      }
  };

  const cycleNotation = () => {
      const systems = Object.keys(NOTATION_MAPS) as NotationSystem[];
      const idx = systems.indexOf(settings.notationSystem);
      const next = systems[(idx + 1) % systems.length];
      onSettingsChange({ ...settings, notationSystem: next });
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 select-none relative">
      
      {/* Header */}
      <div className="px-5 py-4 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20 flex-shrink-0">
          <h2 className="text-lg font-bold tracking-tight">Transposition</h2>
          {onClose && (
            <button onClick={onClose} className="text-teal-500 font-bold text-sm hover:text-teal-600 dark:hover:text-teal-400 transition-colors uppercase tracking-wide">
                Done
            </button>
          )}
      </div>

      {/* Quick Keys */}
      <div className="flex gap-2 p-4 bg-white dark:bg-slate-900 z-20 flex-shrink-0 border-b border-slate-100 dark:border-slate-800/50">
        {QUICK_KEYS.map((k) => {
            const isActive = currentOffset === k.offset;
            return (
                <button
                    key={k.label}
                    onClick={() => handleQuickKey(k.offset)}
                    className={`flex-1 py-2.5 rounded-xl text-lg font-bold transition-all duration-200 border ${
                        isActive 
                        ? 'bg-teal-500 border-teal-500 text-white shadow-md shadow-teal-500/20' 
                        : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    {k.label}
                </button>
            );
        })}
      </div>

      {/* Dual Wheel Area */}
      <div className="relative flex-grow flex overflow-hidden bg-white dark:bg-slate-900">
          
          {/* Selection Highlight Bar */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[56px] bg-slate-100 dark:bg-slate-800 pointer-events-none z-0 mx-0" />

          {/* Gradients for depth - Light/Dark aware */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 pointer-events-none z-20" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 pointer-events-none z-20" />

          {/* LEFT WHEEL: Semitones */}
          <div className="w-1/3 h-full relative z-10 border-r border-slate-100 dark:border-slate-800">
              <div 
                ref={semitoneScrollRef}
                onScroll={() => handleScroll('semitone')}
                className="h-full overflow-y-auto custom-scrollbar snap-y snap-mandatory no-scrollbar py-[calc(50%-28px)]"
              >
                  {semitoneRows.map((row) => {
                      const isSelected = currentOffset === row.value; 
                      
                      return (
                          <div
                            key={row.id}
                            className={`snap-center h-[56px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${isSelected ? 'opacity-100 scale-105' : 'opacity-40 scale-95'}`}
                            onClick={() => {
                                if (semitoneScrollRef.current) semitoneScrollRef.current.scrollTo({ top: semitoneRows.indexOf(row) * ITEM_HEIGHT, behavior: 'smooth' });
                                handleQuickKey(row.value);
                            }}
                          >
                              <span className="text-2xl font-bold text-slate-900 dark:text-white">{row.label}</span>
                              <span className="text-base font-mono text-slate-400 dark:text-slate-500">{row.subLabel}</span>
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* RIGHT WHEEL: Instruments */}
          <div className="w-2/3 h-full relative z-10">
              <div 
                ref={instrumentScrollRef}
                onScroll={() => handleScroll('instrument')}
                className="h-full overflow-y-auto custom-scrollbar snap-y snap-mandatory no-scrollbar py-[calc(50%-28px)]"
              >
                  {instrumentRows.map((row, i) => {
                      const isSelected = currentOffset === row.totalOffset && (settings.selectedInstrumentKey === row.name || (!settings.selectedInstrumentKey && i === 0));
                      const isOffsetMatch = currentOffset === row.totalOffset;
                      
                      return (
                          <div
                            key={`${row.id}-${i}`}
                            className={`snap-center h-[56px] flex items-center px-6 cursor-pointer transition-all duration-200 ${isOffsetMatch ? 'opacity-100' : 'opacity-40'}`}
                            onClick={() => {
                                 if (instrumentScrollRef.current) instrumentScrollRef.current.scrollTo({ top: i * ITEM_HEIGHT, behavior: 'smooth' });
                                 onSettingsChange({ ...settings, transposition: row.totalOffset, selectedInstrumentKey: row.name });
                            }}
                          >
                              <span className={`text-lg font-medium truncate w-full text-left ${isSelected ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'}`}>{row.name}</span>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-200 dark:border-slate-800 z-20 grid grid-cols-2 gap-4 flex-shrink-0">
          {/* A4 Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center relative group overflow-hidden min-h-[100px] shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Concert A Ref</div>
              <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{settings.a4.toFixed(0)}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Hz</span>
              </div>
              <button className="absolute left-0 top-0 bottom-0 w-1/3 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 active:bg-slate-200 dark:active:bg-white/10 flex items-center justify-center transition-colors" onClick={() => adjustA4(-1)}>
                  <ChevronDownIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400" />
              </button>
              <button className="absolute right-0 top-0 bottom-0 w-1/3 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 active:bg-slate-200 dark:active:bg-white/10 flex items-center justify-center transition-colors" onClick={() => adjustA4(1)}>
                  <ChevronUpIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400" />
              </button>
          </div>

          {/* Notation Panel */}
          <button 
            onClick={cycleNotation}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-100 dark:active:bg-slate-700 transition-colors min-h-[100px] shadow-sm"
          >
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Notation System</div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white truncate w-full text-center px-2">
                  {settings.notationSystem.split(' ')[0]}
              </span>
          </button>
      </div>
    </div>
  );
};
