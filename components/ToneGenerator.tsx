

import React, { useState, useEffect } from 'react';
import type { TuningSettings } from '../types';
import { stopSustainedNote } from '../services/audio';
import { ChromaticWheel } from './ChromaticWheel';
import { PianoKeyboard } from './PianoKeyboard';

interface ToneGeneratorProps {
  settings: TuningSettings;
  onKeyboardVisibleChange?: (isVisible: boolean) => void;
  onEnterGame?: () => void;
}

export const ToneGenerator: React.FC<ToneGeneratorProps> = ({ settings, onKeyboardVisibleChange, onEnterGame }) => {
  const [view, setView] = useState<'wheel' | 'keyboard'>('wheel');

  useEffect(() => {
    onKeyboardVisibleChange?.(view === 'keyboard');
    // Cleanup: stop any sustained note when the component unmounts (e.g., view changes)
    return () => {
      stopSustainedNote();
    };
  }, [view, onKeyboardVisibleChange]);
  
  const isHzMode = settings.preset === 'Hz (Manual)';
  if (isHzMode) {
      return null;
  }

  const isKeyboardActive = view === 'keyboard';

  return (
    <div className={`w-full flex flex-col items-center gap-4 transition-all duration-300
      ${isKeyboardActive
        ? 'py-0'
        : 'p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800'
      }`}
    >
        <div className="segmented-control">
            <button onClick={() => setView('wheel')} className={`transition-colors ${view === 'wheel' ? 'active' : ''}`}>Chromatic Wheel</button>
            <button onClick={() => setView('keyboard')} className={`transition-colors ${view === 'keyboard' ? 'active' : ''}`}>Piano Keyboard</button>
        </div>

        {view === 'wheel' ? (
            <ChromaticWheel settings={settings} />
        ) : (
            <PianoKeyboard 
                highlightNotes={[]} 
                settings={settings} 
                isToneGenerator 
                allowFullscreen 
                onEnterGame={onEnterGame} 
            />
        )}
    </div>
  );
};