
import React, { useRef, useEffect } from 'react';
import type { NoteDetails } from '../types';

interface TimbreVisualizerProps {
  spectrum: Float32Array;
  confidence: number;
  note: NoteDetails | null;
}

const PARTICLE_COUNT = 200;
const BINS_FOR_TIMBRE = 512; // Bins to analyze for timbre calculation

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  baseColor: { h: number; s: number; l: number };

  constructor(x: number, y: number, color: { h: number; s: number; l: number }) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.size = Math.random() * 3 + 1;
    this.maxLife = Math.random() * 50 + 50;
    this.life = this.maxLife;
    this.baseColor = color;
  }

  update(
    ctx: CanvasRenderingContext2D,
    attraction: number,
    chaos: number
  ) {
    // Move towards center
    const dx = ctx.canvas.width / 2 - this.x;
    const dy = ctx.canvas.height / 2 - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this.vx += (dx / dist) * attraction * (1 - chaos);
    this.vy += (dy / dist) * attraction * (1 - chaos);
    
    // Add chaos
    this.vx += (Math.random() - 0.5) * chaos;
    this.vy += (Math.random() - 0.5) * chaos;

    // Apply friction
    this.vx *= 0.95;
    this.vy *= 0.95;

    this.x += this.vx;
    this.y += this.vy;

    this.life--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const opacity = this.life / this.maxLife;
    ctx.fillStyle = `hsla(${this.baseColor.h}, ${this.baseColor.s}%, ${this.baseColor.l}%, ${opacity * 0.8})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const TimbreVisualizer: React.FC<TimbreVisualizerProps> = ({ spectrum, confidence, note }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  const propsRef = useRef({ spectrum, confidence, note });
  propsRef.current = { spectrum, confidence, note };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const { spectrum, confidence, note } = propsRef.current;
      const { width, height } = ctx.canvas;

      // Calculate timbre properties
      let spectralCentroid = 0;
      let totalAmplitude = 0;
      for (let i = 0; i < BINS_FOR_TIMBRE; i++) {
        const amp = Math.pow(10, spectrum[i] / 20); // dB to linear
        if (isFinite(amp)) {
            spectralCentroid += i * amp;
            totalAmplitude += amp;
        }
      }
      if (totalAmplitude > 0) {
        spectralCentroid /= totalAmplitude;
      }
      // Normalize centroid to a 0-1 brightness value
      const brightness = Math.min(1, spectralCentroid / (BINS_FOR_TIMBRE * 0.3));

      // Map brightness to hue. 180 (cyan) for bright, 300 (magenta) for warm.
      const hue = 180 + (1 - brightness) * 120;
      const color = { h: hue, s: 90, l: 65 };

      // Control system dynamics based on confidence
      const isStable = note !== null && confidence > 0.9;
      const attraction = isStable ? 0.1 : 0.02;
      const chaos = 1 - Math.pow(confidence, 2); // More chaos with lower confidence
      const emissionRate = isStable ? confidence * 4 : 1;

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // Fading trail effect
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      // Add new particles
      if (particlesRef.current.length < PARTICLE_COUNT && Math.random() < 0.5) {
        for(let i = 0; i < emissionRate; i++) {
            particlesRef.current.push(new Particle(width / 2, height / 2, color));
        }
      }

      // Update and draw particles
      particlesRef.current.forEach((p, i) => {
        p.update(ctx, attraction, chaos);
        p.draw(ctx);
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      });

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      particlesRef.current = []; // Clear particles on unmount
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none opacity-50">
        <canvas ref={canvasRef} width={400} height={400} />
    </div>
  );
};