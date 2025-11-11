
import React from 'react';

export const HeroLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className}>
        <defs>
            <linearGradient id="logo-body-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="accent-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
            <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        {/* Background Squircle */}
        <rect x="32" y="32" width="448" height="448" rx="96" fill="url(#logo-body-grad)" stroke="#334155" strokeWidth="4" />

        {/* Inner Dial Background */}
        <circle cx="256" cy="256" r="160" fill="#020617" opacity="0.5" />

        {/* Decorative Rings */}
        <circle cx="256" cy="256" r="120" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 8" opacity="0.5" />

        {/* Tuner Scale Markings */}
        <g strokeLinecap="round" strokeWidth="6">
            {/* Center (In Tune) */}
            <line x1="256" y1="110" x2="256" y2="130" stroke="#f43f5e" strokeWidth="8" />
            
            {/* Ticks Left */}
            <line x1="216" y1="116" x2="213" y2="135" stroke="#64748b" />
            <line x1="178" y1="132" x2="173" y2="150" stroke="#64748b" />
            <line x1="145" y1="158" x2="138" y2="175" stroke="#64748b" />

            {/* Ticks Right */}
            <line x1="296" y1="116" x2="299" y2="135" stroke="#64748b" />
            <line x1="334" y1="132" x2="339" y2="150" stroke="#64748b" />
            <line x1="367" y1="158" x2="374" y2="175" stroke="#64748b" />
        </g>

        {/* The Pendulum / Needle */}
        <g style={{ transformOrigin: '256px 360px' }}>
            <animateTransform 
                attributeName="transform" 
                type="rotate" 
                values="-30; 30; -30" 
                dur="2s" 
                repeatCount="indefinite" 
                calcMode="spline" 
                keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
            />
            
            {/* Rod */}
            <rect x="252" y="120" width="8" height="240" rx="4" fill="#94a3b8" />
            
            {/* Metronome Weight */}
            <rect x="240" y="260" width="32" height="48" rx="6" fill="url(#accent-grad)" filter="url(#glow-filter)" />
            <rect x="240" y="260" width="32" height="48" rx="6" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="2" />

            {/* Needle Tip */}
            <circle cx="256" cy="120" r="6" fill="#f43f5e" />
        </g>

        {/* Pivot Base */}
        <circle cx="256" cy="360" r="24" fill="#1e293b" stroke="#334155" strokeWidth="4" />
        <circle cx="256" cy="360" r="8" fill="#475569" />

        {/* Note Icons Floating */}
        <g opacity="0.2" fill="white">
             <g transform="translate(100, 350) scale(2) rotate(-15)">
                <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="6" cy="18" r="3" fill="currentColor"/>
                <circle cx="18" cy="16" r="3" fill="currentColor"/>
             </g>
        </g>
    </svg>
);
