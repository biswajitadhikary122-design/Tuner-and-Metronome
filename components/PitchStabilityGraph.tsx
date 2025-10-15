import React, { useRef, useEffect } from 'react';
import type { NoteDetails } from '../types';
import { useSpring, animated } from '@react-spring/web';

interface PitchStabilityGraphProps {
  note: NoteDetails | null;
  stabilityScore: number;
  feedback: string;
}

const HISTORY_SIZE = 200; // Number of data points to show on the graph

export const PitchStabilityGraph: React.FC<PitchStabilityGraphProps> = ({ note, stabilityScore, feedback }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const centsHistoryRef = useRef<number[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const prevNoteWasNull = useRef(!note);

  const { score } = useSpring({
    score: stabilityScore,
    config: { mass: 1, tension: 120, friction: 40 },
  });

  useEffect(() => {
    // If transitioning from no note to a note, clear history to start fresh.
    if (note && prevNoteWasNull.current) {
      centsHistoryRef.current = [];
    }
    prevNoteWasNull.current = !note;

    // If there is no note, stop the animation. The cleanup from the last render
    // will have cancelled the animation frame, freezing the graph.
    if (!note) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to match display size for high-res rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }


    const draw = () => {
        const { width, height } = canvas;
        const scaledWidth = width / dpr;
        const scaledHeight = height / dpr;

        // Add new data point (note is guaranteed to be non-null here)
        centsHistoryRef.current.push(note.cents);
        if (centsHistoryRef.current.length > HISTORY_SIZE) {
            centsHistoryRef.current.shift();
        }

        // Clear canvas with a dark background
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; // Tailwind slate-900 with alpha
        ctx.fillRect(0, 0, scaledWidth, scaledHeight);

        // --- Draw Grid ---
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)'; // slate-700
        ctx.lineWidth = 1;
        // Center line (0 cents)
        ctx.beginPath();
        ctx.moveTo(0, scaledHeight / 2);
        ctx.lineTo(scaledWidth, scaledHeight / 2);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)'; // green-500
        ctx.stroke();
        
        // Cents lines (+/- 25)
        ctx.beginPath();
        ctx.moveTo(0, scaledHeight / 4);
        ctx.lineTo(scaledWidth, scaledHeight / 4);
        ctx.moveTo(0, scaledHeight * 3 / 4);
        ctx.lineTo(scaledWidth, scaledHeight * 3 / 4);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // red-500
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);


        // --- Draw Pitch Line ---
        if (centsHistoryRef.current.length > 1) {
            // Gradient for the line color
            const gradient = ctx.createLinearGradient(0, 0, 0, scaledHeight);
            gradient.addColorStop(0, '#ef4444');    // red-500
            gradient.addColorStop(0.25, '#facc15'); // yellow-400
            gradient.addColorStop(0.5, '#22c55e');  // green-500
            gradient.addColorStop(0.75, '#facc15');
            gradient.addColorStop(1, '#ef4444');
            ctx.strokeStyle = gradient;

            ctx.lineWidth = 2.5;
            ctx.shadowColor = 'rgba(74, 222, 128, 0.7)'; // green-400
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            
            const step = scaledWidth / HISTORY_SIZE;
            
            for (let i = 0; i < centsHistoryRef.current.length; i++) {
                const cents = Math.max(-50, Math.min(50, centsHistoryRef.current[i]));
                const y = (scaledHeight / 2) - (cents / 50) * (scaledHeight / 2);
                const x = i * step;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    // Use quadratic curve for smoothing
                    const prevX = (i - 1) * step;
                    const prevY = (scaledHeight / 2) - (Math.max(-50, Math.min(50, centsHistoryRef.current[i - 1])) / 50) * (scaledHeight / 2);
                    const cpX = (prevX + x) / 2;
                    ctx.quadraticCurveTo(prevX, prevY, cpX, y);
                }
            }
            ctx.stroke();
            
            // Reset shadow for other elements
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }

        animationFrameIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [note]);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full h-24 bg-slate-900 rounded-lg shadow-inner overflow-hidden relative">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute top-2 left-3 text-white font-mono text-sm opacity-70">
            <p>±50 cents</p>
        </div>
      </div>
      <div className="flex justify-between items-center w-full px-2">
        <div className="text-left">
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest">Stability</p>
            <animated.p className="text-2xl font-mono text-cyan-600 dark:text-cyan-300">
                {score.to(s => `${s.toFixed(0)}%`)}
            </animated.p>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold text-center flex-1 min-h-[2.5rem]">
            {feedback}
        </p>
      </div>
    </div>
  );
};