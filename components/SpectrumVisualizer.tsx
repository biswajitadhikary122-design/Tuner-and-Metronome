import React, { useRef, useEffect } from 'react';

interface SpectrumVisualizerProps {
  spectrum: Float32Array;
}

// Renders a subset of the bins for clarity, focusing on the musically relevant range
const BINS_TO_RENDER = 512; 

export const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = ({ spectrum }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    const { width, height } = canvas;
    context.clearRect(0, 0, width, height);

    const barWidth = width / BINS_TO_RENDER;
    
    // Create a gradient for the bars
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#a5b4fc'); // indigo-300
    gradient.addColorStop(0.5, '#5eead4'); // teal-300
    gradient.addColorStop(1, '#0d9488'); // teal-700
    
    context.fillStyle = gradient;

    for (let i = 0; i < BINS_TO_RENDER; i++) {
      // The values are in dB, from -100 (silence) to 0 (max)
      const dbValue = spectrum[i];
      
      // Normalize the dB value to a 0-1 range. Clamp at -100dB.
      const normalized = (dbValue + 100) / 100;
      const barHeight = Math.max(0, normalized * height);

      const x = i * barWidth;
      const y = height - barHeight;

      context.fillRect(x, y, barWidth, barHeight);
    }
  }, [spectrum]);

  return (
    <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/70 dark:border-slate-700/50 rounded-lg p-2 shadow-inner">
        <canvas ref={canvasRef} width="340" height="100" className="w-full h-24 rounded"></canvas>
        <p className="text-center text-xs text-black/70 dark:text-white/70 mt-1">Frequency Spectrum (FFT)</p>
    </div>
  );
};