import React, { useRef, useEffect } from 'react';

interface WaveformVisualizerProps {
  waveform: Float32Array;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ waveform }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    const { width, height } = canvas;
    context.clearRect(0, 0, width, height);

    context.lineWidth = 2;
    context.strokeStyle = '#6366f1'; // indigo-500

    context.beginPath();

    const sliceWidth = width * 1.0 / waveform.length;
    let x = 0;

    for (let i = 0; i < waveform.length; i++) {
      // The value is amplitude from -1.0 to 1.0
      const v = waveform[i];
      const y = (v * height / 2) + (height / 2);

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }

      x += sliceWidth;
    }

    context.lineTo(width, height / 2);
    context.stroke();

  }, [waveform]);

  return (
    <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/70 dark:border-slate-700/50 rounded-lg p-2 shadow-inner">
        <canvas ref={canvasRef} width="340" height="100" className="w-full h-24 rounded"></canvas>
        <p className="text-center text-xs text-black/70 dark:text-white/70 mt-1">Audio Waveform (Time Domain)</p>
    </div>
  );
};