import React, { useRef, useEffect } from 'react';
import type { NoteDetails, TuningSettings } from '../types';

interface PitchStabilityGraphProps {
  note: NoteDetails | null;
  settings: TuningSettings;
}

type TuningState = 'sharp' | 'flat' | 'in-tune';
type HistoryPoint = { cents: number; state: TuningState } | { break: true };

const HISTORY_SIZE = 300;
const CENTS_RANGE = 35; // y-axis will be +/- 35 cents

export const PitchStabilityGraph: React.FC<PitchStabilityGraphProps> = ({ note, settings }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<HistoryPoint[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastNoteNameRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = settings.darkMode;
    const COLORS = {
      sharp: '#d946ef', // fuchsia-500
      inTune: '#10b981', // emerald-500
      flat: '#ef4444', // red-500
      grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      text: isDark ? '#94a3b8' : '#64748b', // slate-400 / slate-500
    };

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }
      
      const width = rect.width;
      const height = rect.height;
      const yCenter = height / 2;
      const pixelsPerCent = (height / 2) / CENTS_RANGE;

      // --- Update History ---
      const currentNoteId = note ? `${note.name}${note.octave}` : null;
      if (note && currentNoteId) {
        let currentState: TuningState;
        if (note.cents > 10) currentState = 'sharp';
        else if (note.cents < -10) currentState = 'flat';
        else currentState = 'in-tune';
        
        if (lastNoteNameRef.current !== currentNoteId) {
             historyRef.current.push({ break: true });
        }
        
        historyRef.current.push({ cents: note.cents, state: currentState });
        lastNoteNameRef.current = currentNoteId;
      } else {
        lastNoteNameRef.current = null;
      }
      
      if (historyRef.current.length > HISTORY_SIZE) {
        historyRef.current.shift();
      }

      // --- Drawing ---
      ctx.clearRect(0, 0, width, height);

      // Draw Grid & Labels
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      ctx.font = `10px sans-serif`;
      ctx.fillStyle = COLORS.text;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      [-30, -20, -10, 10, 20, 30].forEach(cents => {
        const y = yCenter - cents * pixelsPerCent;
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        
        let textY = y - 6; // Default to be above the line
        if (cents >= 10) {
          textY = y + 6; // Move positive numbers down, below the line
        }

        ctx.fillText(cents > 0 ? `+${cents}` : String(cents), width - 5, textY);
      });
      
      // In-tune zone
      const tolerancePixels = 10 * pixelsPerCent;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(0, yCenter - tolerancePixels, width, tolerancePixels * 2);
      
      // Center line
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, yCenter);
      ctx.lineTo(width, yCenter);
      ctx.stroke();
      
      // --- Draw Pitch History Trace ---
      const step = width / HISTORY_SIZE;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      let currentSegment: { points: {x: number, y: number}[], state: TuningState } | null = null;
      const segments: typeof currentSegment[] = [];

      for (let i = 0; i < historyRef.current.length; i++) {
          const point = historyRef.current[i];
          if ('break' in point) {
              if (currentSegment) segments.push(currentSegment);
              currentSegment = null;
              continue;
          }
          const p = { x: i * step, y: yCenter - point.cents * pixelsPerCent };
          if (!currentSegment || currentSegment.state !== point.state) {
              if (currentSegment) segments.push(currentSegment);
              currentSegment = { points: [p], state: point.state };
          } else {
              currentSegment.points.push(p);
          }
      }
      if (currentSegment) segments.push(currentSegment);

      segments.forEach(seg => {
          if (!seg || seg.points.length < 2) return;
          const color = COLORS[seg.state];
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(seg.points[0].x, seg.points[0].y);
          for (let i = 0; i < seg.points.length - 1; i++) {
              const p1 = seg.points[i];
              const p2 = seg.points[i+1];
              const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
              ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
          }
          const last = seg.points[seg.points.length - 1];
          const secondLast = seg.points[seg.points.length - 2];
          ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
          ctx.stroke();
      });
      ctx.shadowBlur = 0;

      // Draw "Now" cursor
      const lastDataPoint = historyRef.current[historyRef.current.length - 1];
      if (lastDataPoint && !('break' in lastDataPoint)) {
          const i = historyRef.current.length - 1;
          const x = i * step;
          const y = yCenter - lastDataPoint.cents * pixelsPerCent;
          const color = COLORS[lastDataPoint.state];
          
          const pulseRadius = 6 + Math.sin(performance.now() / 200) * 1.5;
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;

          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
      }

      animationFrameIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [note, settings]);

  return (
    <div className="w-full h-40 relative flex flex-col p-4">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Pitch Stability</h3>
        <div className="flex-grow relative">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    </div>
  );
};
