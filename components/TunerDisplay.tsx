
import React, { useState, useEffect, useRef, SetStateAction } from 'react';
import { createPortal } from 'react-dom';
import { useSpring, animated } from '@react-spring/web';
import type { NoteDetails, TuningSettings } from '../types';
import { noteToFrequency } from '../services/pitch';
import { PitchStabilityGraph } from './PitchStabilityGraph';
import { usePitchStability } from '../hooks/usePitchStability';
import { useVoiceFeedback } from '../hooks/useVoiceFeedback';
import { playNote } from '../services/audio';
import { MusicNoteIcon, TuneIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';
import { ChromaticWheel } from './ChromaticWheel';


interface TunerDisplayProps {
  note: NoteDetails | null;
  confidence: number;
  settings: TuningSettings;
  onSettingsChange: React.Dispatch<SetStateAction<TuningSettings>>;
}

const PerfectlyInTuneEffect: React.FC<{ active: boolean }> = ({ active }) => {
  return createPortal(
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-500 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`absolute inset-x-0 bottom-0 h-screen bg-green-500/30 transition-transform ${
          active ? 'duration-[4000ms] ease-out' : 'duration-[1000ms] ease-in'
        }`}
        style={{
          transform: active ? 'translateY(0%)' : 'translateY(100%)',
        }}
      >
        <div
          className="absolute -top-1 left-0 w-full h-8 bg-no-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20'%3e%3cpath fill='%2322c55e4D' d='M0 10 Q 25 20, 50 10 T 100 10 L 100 20 L 0 20 Z'/%3e%3c/svg%3e")`,
            backgroundSize: '100px 100%',
            animation: 'wave-move 5s linear infinite',
          }}
        />
        <div
          className="absolute -top-1 left-0 w-full h-8 bg-no-repeat opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20'%3e%3cpath fill='%2322c55e4D' d='M0 10 Q 25 0, 50 10 T 100 10 L 100 20 L 0 20 Z'/%3e%3c/svg%3e")`,
            backgroundSize: '100px 100%',
            animation: 'wave-move 7s linear infinite reverse',
          }}
        />
      </div>
    </div>,
    document.body
  );
};

const Needle = ({ cents, noteActive, inTune }: { cents: number; noteActive: boolean; inTune: boolean }) => {
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const targetRotation = (clampedCents / 50) * 90;

  const { rotation, opacity } = useSpring({
    rotation: noteActive ? targetRotation : 0,
    opacity: noteActive ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 40 },
    delay: noteActive ? 0 : 300, // A small delay before fading out
  });

  let needleStrokeClass = 'stroke-cyan-500';
  let needleCoreClass = 'stroke-white';
  let emitterFillClass = 'fill-cyan-400';

  if (noteActive) {
    if (Math.abs(cents) <= 10) {
      needleStrokeClass = 'stroke-green-500';
      needleCoreClass = 'stroke-green-300';
      emitterFillClass = 'fill-green-400';
    } else {
      needleStrokeClass = 'stroke-red-500';
      needleCoreClass = 'stroke-red-300';
      emitterFillClass = 'fill-red-400';
    }
  }

  return (
    <animated.g
      transform={rotation.to(r => `rotate(${r} 200 200)`)}
      style={{ opacity: opacity }}
    >
      <defs>
        <filter id="laserGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {/* Glow */}
      <line
        x1="200"
        y1="200"
        x2="200"
        y2="35"
        strokeWidth="6"
        className={`${needleStrokeClass} transition-colors duration-200`}
        strokeLinecap="round"
        opacity="0.5"
        filter="url(#laserGlow)"
      />
      {/* Core */}
      <line
        x1="200"
        y1="200"
        x2="200"
        y2="35"
        strokeWidth="2"
        className={`${needleCoreClass} transition-colors duration-200`}
        strokeLinecap="round"
      />
       {/* Emitter */}
      <circle cx="200" cy="200" r="5" className={`${emitterFillClass} transition-colors duration-200`} />
      <circle cx="200" cy="200" r="2" className="fill-white" />
    </animated.g>
  );
};

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';
    const sweepFlag = endAngle > startAngle ? '1' : '0';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
};

const TunerGauge = ({ cents, noteActive, inTune, settings }: { cents: number; noteActive: boolean; inTune: boolean; settings: TuningSettings }) => {
    const radius = 180;
    const center = { x: 200, y: 200 };
    const ticks = [];
    const labels = [];

    const centsToAngle = (c: number) => (c / 50) * 90;

    const tolerance = settings.tuningTolerance;
    const isFlat = noteActive && cents < -tolerance;
    const isInTune = noteActive && Math.abs(cents) <= tolerance;
    const isSharp = noteActive && cents > tolerance;

    for (let i = -50; i <= 50; i++) {
        const angle = centsToAngle(i);
        const isTen = i % 10 === 0;
        const tickLength = isTen ? 15 : 8;
        const p1 = polarToCartesian(center.x, center.y, radius, angle);
        const p2 = polarToCartesian(center.x, center.y, radius - tickLength, angle);

        ticks.push(
            <line
                key={`tick-${i}`}
                x1={p1.x} y1={p1.y}
                x2={p2.x} y2={p2.y}
                className={`stroke-current ${isTen ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'}`}
                strokeWidth={isTen ? 2 : 1}
            />
        );

        if (isTen) {
            const p3 = polarToCartesian(center.x, center.y, radius - 30, angle);
            labels.push(
                <text
                    key={`label-${i}`}
                    x={p3.x}
                    y={p3.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-sm font-mono fill-current text-slate-700 dark:text-slate-400"
                >
                    {i !== 0 ? i : '0'}
                </text>
            );
        }
    }

    const inTuneRangeAngle = centsToAngle(settings.tuningTolerance);
    
    // Fixed angles for edge lights as per user request
    const redArcStartSharp = centsToAngle(10);
    const redArcEndSharp = centsToAngle(50);
    const redArcStartFlat = centsToAngle(-50);
    const redArcEndFlat = centsToAngle(-10);
    const greenArcStart = centsToAngle(-10);
    const greenArcEnd = centsToAngle(10);

    const labelBaseStyle = "text-xs font-bold uppercase tracking-widest transition-all duration-300";
    const inactiveLabelStyle = "fill-slate-500 dark:fill-slate-600";

    return (
        <svg viewBox="0 0 400 220" className="w-full h-full">
            <defs>
                <radialGradient id="glassGradient" cx="50%" cy="50%" r="60%" fx="50%" fy="50%">
                    <stop offset="0%" className="stop-slate-50/10 dark:stop-slate-900/10" />
                    <stop offset="100%" className="stop-slate-200/20 dark:stop-slate-600/20" />
                </radialGradient>
                 <filter id="edgeGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
                </filter>
                {/* Invisible paths for text */}
                <path id="flatPath" d={describeArc(200, 200, radius + 18, -65, -25)} fill="none" />
                <path id="inTunePath" d={describeArc(200, 200, radius + 18, -20, 20)} fill="none" />
                <path id="sharpPath" d={describeArc(200, 200, radius + 18, 25, 65)} fill="none" />
            </defs>

            {/* Arc Labels */}
            <text className={labelBaseStyle}>
                <textPath href="#flatPath" startOffset="50%" textAnchor="middle" className={isFlat ? 'fill-red-500' : inactiveLabelStyle} style={{ filter: isFlat ? 'url(#edgeGlow)' : 'none', textShadow: isFlat ? '0 0 8px currentColor' : 'none' }}>
                    Flat
                </textPath>
            </text>
            <text className={labelBaseStyle}>
                <textPath href="#inTunePath" startOffset="50%" textAnchor="middle" className={isInTune ? 'fill-green-500' : inactiveLabelStyle} style={{ filter: isInTune ? 'url(#edgeGlow)' : 'none', textShadow: isInTune ? '0 0 8px currentColor' : 'none' }}>
                    In Tune
                </textPath>
            </text>
            <text className={labelBaseStyle}>
                <textPath href="#sharpPath" startOffset="50%" textAnchor="middle" className={isSharp ? 'fill-red-500' : inactiveLabelStyle} style={{ filter: isSharp ? 'url(#edgeGlow)' : 'none', textShadow: isSharp ? '0 0 8px currentColor' : 'none' }}>
                    Sharp
                </textPath>
            </text>

            {/* Glassy Background */}
            <path d={describeArc(200, 200, 190, -90, 90)} className="fill-transparent" />
            <path d={describeArc(200, 200, 180, -90, 90)} 
                  className="stroke-slate-200 dark:stroke-slate-700/50" 
                  fill="transparent" 
                  strokeWidth="1" />

            {/* Ticks and Labels */}
            <g transform="translate(0, 0)">
                {ticks}
                {labels}
            </g>

            {/* Edge Lights */}
            {/* Red FLAT indicator */}
            <g style={{ opacity: isFlat ? 1 : 0, transition: 'opacity 300ms ease-in-out' }}>
                <path d={describeArc(200, 200, radius + 5, redArcStartFlat, redArcEndFlat)} className="fill-none stroke-red-500" strokeWidth="6" strokeLinecap="round" filter="url(#edgeGlow)" opacity="0.7"/>
                <path d={describeArc(200, 200, radius + 5, redArcStartFlat, redArcEndFlat)} className="fill-none stroke-red-500" strokeWidth="2" strokeLinecap="round"/>
            </g>
            {/* Red SHARP indicator */}
            <g style={{ opacity: isSharp ? 1 : 0, transition: 'opacity 300ms ease-in-out' }}>
                <path d={describeArc(200, 200, radius + 5, redArcStartSharp, redArcEndSharp)} className="fill-none stroke-red-500" strokeWidth="6" strokeLinecap="round" filter="url(#edgeGlow)" opacity="0.7"/>
                <path d={describeArc(200, 200, radius + 5, redArcStartSharp, redArcEndSharp)} className="fill-none stroke-red-500" strokeWidth="2" strokeLinecap="round"/>
            </g>
            {/* Green IN TUNE indicator */}
            <g style={{ opacity: isInTune ? 1 : 0, transition: 'opacity 300ms ease-in-out' }}>
                <path d={describeArc(200, 200, radius + 5, greenArcStart, greenArcEnd)} className="fill-none stroke-green-500" strokeWidth="6" strokeLinecap="round" filter="url(#edgeGlow)" opacity="0.7"/>
                <path d={describeArc(200, 200, radius + 5, greenArcStart, greenArcEnd)} className="fill-none stroke-green-500" strokeWidth="2" strokeLinecap="round"/>
            </g>

            {/* In-tune indicator on the scale */}
            <path
                d={describeArc(200, 200, radius + 2, -inTuneRangeAngle, inTuneRangeAngle)}
                className={`fill-none transition-colors duration-200 ${noteActive && inTune ? 'stroke-green-500' : 'stroke-slate-300 dark:stroke-slate-600'}`}
                strokeWidth="4"
                strokeLinecap="round"
            />

            {/* Needle */}
            <Needle cents={cents} noteActive={noteActive} inTune={inTune} />
        </svg>
    );
};

export const TunerDisplay: React.FC<TunerDisplayProps> = ({ note, confidence, settings, onSettingsChange }) => {
  const [targetFrequency, setTargetFrequency] = useState<number | null>(null);
  const [isToneGeneratorOpen, setIsToneGeneratorOpen] = useState<boolean>(false);
  const a4ChangeIntervalRef = useRef<number | null>(null);

  const { stabilityScore, feedback } = usePitchStability(note, confidence);
  useVoiceFeedback(note, confidence, settings);

  useEffect(() => {
    if (settings.preset === 'Hz (Manual)') {
        setTargetFrequency(settings.targetFrequency || 440);
    } else if (note) {
      const freq = noteToFrequency(note.name as string, note.octave as number, settings);
      setTargetFrequency(freq > 0 ? freq : null);
    } else {
      setTargetFrequency(null);
    }
  }, [note, settings]);

  const cents = note?.cents ?? 0;
  const isHzMode = settings.preset === 'Hz (Manual)';
  const noteName = note?.name ?? (isHzMode ? (settings.targetFrequency || 440).toFixed(1) : '-');
  const octave = note?.octave ?? (isHzMode ? 'Hz' : '');
  const frequency = note?.frequency.toFixed(1) ?? '0.0';
  const noteActive = note !== null;
  const inTune = noteActive && confidence > 0.9 && Math.abs(cents) <= settings.tuningTolerance;

  const noteGlowStyle: React.CSSProperties = noteActive ? {
      textShadow: `0 0 15px ${inTune ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.6)'}`
  } : {};

  const handlePlayReferenceTone = () => {
    const freqToPlay = isHzMode ? settings.targetFrequency : targetFrequency;
    if (freqToPlay) {
        playNote(freqToPlay, 1.0);
    }
  };

  const handleA4Change = (amount: number) => {
    onSettingsChange(prevSettings => {
      const newA4 = parseFloat(Math.max(430, Math.min(450, prevSettings.a4 + amount)).toFixed(1));
      if (newA4 === prevSettings.a4) return prevSettings;
      return { ...prevSettings, a4: newA4 };
    });
  };

  const startA4Change = (amount: number) => {
    handleA4Change(amount);
    a4ChangeIntervalRef.current = window.setInterval(() => {
      handleA4Change(amount);
    }, 100);
  };

  const stopA4Change = () => {
    if (a4ChangeIntervalRef.current) {
      clearInterval(a4ChangeIntervalRef.current);
      a4ChangeIntervalRef.current = null;
    }
  };

  useEffect(() => {
    const handleMouseUp = () => stopA4Change();
    const handleTouchEnd = () => stopA4Change();

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
      stopA4Change();
    };
  }, []);
  
  const absCents = Math.abs(cents);
  let centsColorClass = 'text-slate-500';
  if (noteActive) {
      if (absCents <= settings.tuningTolerance) {
          centsColorClass = 'text-green-600 dark:text-green-400';
      } else if (absCents <= 25) {
          centsColorClass = 'text-yellow-600 dark:text-yellow-400';
      } else {
          centsColorClass = 'text-red-600 dark:text-red-400';
      }
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-sm sm:max-w-lg md:max-w-xl">
      <PerfectlyInTuneEffect active={inTune} />
      
      <div className="relative w-full">
        <div className="w-full aspect-[4/3] -mt-10">
          <TunerGauge cents={cents} noteActive={noteActive} inTune={inTune} settings={settings} />
        </div>
      </div>
      
      <div className="w-full max-w-xs flex flex-col items-center gap-2 -mt-16">
        {/* Note display */}
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="flex items-baseline transition-opacity duration-200" style={{ opacity: noteActive ? 1 : 0.2 }}>
              <animated.span 
                className="text-7xl sm:text-8xl font-light text-slate-800 dark:text-slate-200 transition-all duration-200" 
                style={{ ...noteGlowStyle, fontVariantNumeric: 'tabular-nums' }}
              >
                {noteName}
              </animated.span>
              <span className="text-3xl sm:text-4xl font-light text-slate-500 dark:text-slate-400 -ml-1">
                {octave}
              </span>
            </div>
            <button 
                onClick={handlePlayReferenceTone}
                disabled={!noteActive && !isHzMode}
                className="p-2 ml-2 rounded-full text-slate-500 dark:text-slate-500 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 pointer-events-auto disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Play reference tone"
            >
                <MusicNoteIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Cents display */}
        <div className="h-8 flex items-center justify-center">
          {noteActive && (
            <div className="transition-opacity duration-200" style={{ opacity: noteActive ? 1 : 0 }}>
              <p className={`font-mono text-2xl font-semibold transition-colors duration-200 ${centsColorClass}`}>
                {cents >= 0 ? '+' : ''}{cents.toFixed(1)}
                <span className="text-lg ml-1">cents</span>
              </p>
            </div>
          )}
        </div>
        
        {/* A4 and Freq Display */}
        <div className="w-full flex items-stretch justify-center gap-4 pt-2">
            {/* A4 Calibration Box */}
            <div className="flex-1 flex items-stretch py-3 px-2 rounded-xl bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/50">
                <div className="w-2/3 flex flex-col items-center justify-center pr-2">
                    <p className="font-mono text-sm text-slate-600 dark:text-slate-400">A4</p>
                    <p className="font-mono text-3xl font-bold text-slate-700 dark:text-slate-200 tracking-tighter">
                        {settings.a4.toFixed(1)}
                    </p>
                </div>
                <div className="w-1/3 flex flex-col items-center justify-center gap-1 border-l border-slate-300/50 dark:border-slate-600/50 pl-2">
                    <button
                        onMouseDown={() => startA4Change(0.5)}
                        onMouseUp={stopA4Change}
                        onMouseLeave={stopA4Change}
                        onTouchStart={() => startA4Change(0.5)}
                        onTouchEnd={stopA4Change}
                        className="p-1 w-full flex justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        aria-label="Increase A4 frequency"
                    >
                        <ChevronUpIcon className="w-5 h-5" />
                    </button>
                    <button
                        onMouseDown={() => startA4Change(-0.5)}
                        onMouseUp={stopA4Change}
                        onMouseLeave={stopA4Change}
                        onTouchStart={() => startA4Change(-0.5)}
                        onTouchEnd={stopA4Change}
                        className="p-1 w-full flex justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        aria-label="Decrease A4 frequency"
                    >
                        <ChevronDownIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Frequency Box */}
            <div className="flex-1 flex flex-col justify-center items-center py-2 px-3 rounded-xl bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/50">
                <p className="font-mono text-sm text-slate-600 dark:text-slate-400">Frequency</p>
                <p className={`font-mono text-2xl font-semibold transition-colors duration-200 ${noteActive ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500'}`}>
                    {frequency}
                    <span className="text-sm ml-1">Hz</span>
                </p>
            </div>
        </div>
      </div>

      <div className="mt-6 w-full flex flex-col items-center gap-2">
        <PitchStabilityGraph note={note} stabilityScore={stabilityScore} feedback={feedback} />
        {!isHzMode && 
            <>
                <button onClick={() => setIsToneGeneratorOpen(!isToneGeneratorOpen)} className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors p-2 rounded-lg">
                    <TuneIcon className="w-5 h-5" />
                    {isToneGeneratorOpen ? 'Close' : 'Open'} Reference Tone Generator
                </button>
                {isToneGeneratorOpen && <ChromaticWheel settings={settings} />}
            </>
        }
      </div>
    </div>
  );
};
