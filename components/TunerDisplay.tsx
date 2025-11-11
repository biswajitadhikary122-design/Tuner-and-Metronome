
import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { NoteDetails, TuningSettings } from '../types';

// Helper function to convert polar to cartesian coordinates for SVG arcs/ticks
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

// New helper for describing a curved path for text or arcs
const describeArcPath = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';
    const sweepFlag = endAngle > startAngle ? '1' : '0';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
};


export const TunerDisplay: React.FC<{
    note: NoteDetails | null;
    confidence: number;
    settings: TuningSettings;
    spectrum: Float32Array | null;
}> = ({ note, confidence, settings }) => {
    const noteActive = note !== null;
    const cents = note?.cents ?? 0;
    const inTune = noteActive && Math.abs(cents) <= settings.tuningTolerance;
    const idleColor = settings.darkMode ? '#FFFFFF' : '#000000';
    
    // --- Light segment visibility logic ---
    const isFlatRange = noteActive && cents < -10;
    const isInTuneRange = noteActive && Math.abs(cents) <= 10;
    const isSharpRange = noteActive && cents > 10;
    

    // --- Color Logic ---
    let textColor = idleColor;
    let textShadow = 'none';
    const inTuneColor = '#10b981'; // emerald-500
    const offTuneColor = '#ef4444'; // red-500

    if (noteActive) {
        if (isInTuneRange) {
            textColor = inTuneColor;
            textShadow = `0 0 15px ${inTuneColor}80`;
        } else {
            textColor = offTuneColor;
            textShadow = `0 0 15px ${offTuneColor}80`;
        }
    }


    // --- SVG Drawing Logic ---
    const centerX = 200;
    const centerY = 220;
    const radius = 180;
    const textPathRadius = 195; // Moved text inward
    const numberRadius = 150;
    const angleRange = 90;
    
    // Convert cent values to angles for arc paths
    // Formula: angle = -90 (center) + (cents / 50) * angleRange
    const flatPath = describeArcPath(centerX, centerY, textPathRadius, -90 + (-30.5 / 50 * angleRange), -90 + (-20 / 50 * angleRange));
    const sharpPath = describeArcPath(centerX, centerY, textPathRadius, -90 + (20 / 50 * angleRange), -90 + (30.5 / 50 * angleRange));
    const inTunePath = describeArcPath(centerX, centerY, 195, -90 + (-10 / 50 * angleRange), -90 + (10 / 50 * angleRange));

    // In-tune marker arc
    const inTuneMarkerArc = describeArcPath(centerX, centerY, 182, -90 - (settings.tuningTolerance/50 * angleRange), -90 + (settings.tuningTolerance/50 * angleRange));
    
    // Paths for the segmented string light
    const stringLightRadius = 185;
    const flatLightPath = describeArcPath(centerX, centerY, stringLightRadius, -180, -90 + (-10 / 50 * angleRange));
    const inTuneLightPath = describeArcPath(centerX, centerY, stringLightRadius, -90 + (-10 / 50 * angleRange), -90 + (10 / 50 * angleRange));
    const sharpLightPath = describeArcPath(centerX, centerY, stringLightRadius, -90 + (10 / 50 * angleRange), 0);


    // --- Needle Animation ---
    const rotationDegrees = noteActive ? Math.max(-angleRange, Math.min(angleRange, (cents / 50) * angleRange)) : -90;
    const { transform, color } = useSpring({
        transform: `rotate(${rotationDegrees}deg)`,
        color: noteActive ? (isInTuneRange ? inTuneColor : offTuneColor) : idleColor,
        config: noteActive
            ? { tension: 350, friction: 30 }
            : { mass: 1, tension: 180, friction: 14 }, // Bouncy spring for gravity fall
    });


    return (
        <div className={`relative w-full flex flex-col justify-start items-center animate-fade-in`}>
            <div className="relative w-full max-w-lg" style={{ aspectRatio: '1 / 0.9' }}>
                <svg viewBox="0 0 400 360" className="w-full h-full overflow-visible">
                    <defs>
                        <path id="flat-path" d={flatPath} fill="none"/>
                        <path id="sharp-path" d={sharpPath} fill="none"/>
                        <path id="in-tune-path" d={inTunePath} fill="none"/>
                        {/* Add glow filters */}
                        <filter id="glow-green">
                            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#10b981" />
                        </filter>
                        <filter id="glow-red">
                            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ef4444" />
                        </filter>
                    </defs>
                    

                    {/* Segmented String light */}
                    <path
                        d={flatLightPath}
                        fill="none"
                        stroke={isFlatRange ? offTuneColor : 'transparent'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        filter={isFlatRange ? 'url(#glow-red)' : 'none'}
                        className="transition-all duration-200"
                    />
                     <path
                        d={inTuneLightPath}
                        fill="none"
                        stroke={isInTuneRange ? inTuneColor : 'transparent'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        filter={isInTuneRange ? 'url(#glow-green)' : 'none'}
                        className="transition-all duration-200"
                    />
                     <path
                        d={sharpLightPath}
                        fill="none"
                        stroke={isSharpRange ? offTuneColor : 'transparent'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        filter={isSharpRange ? 'url(#glow-red)' : 'none'}
                        className="transition-all duration-200"
                    />
                    
                    {/* Static Gauge Elements */}
                    <g className="fill-black dark:fill-white stroke-black dark:stroke-white text-black dark:text-white">
                        <path
                            d={describeArcPath(centerX, centerY, radius, -180, 0)}
                            fill="none"
                            strokeWidth="1"
                        />

                        {/* Ticks and Labels */}
                        {Array.from({ length: 101 }, (_, i) => {
                            const c = i - 50;
                            const angle = -90 + (c / 50) * angleRange;
                            const isMajorTick = c % 10 === 0;
                            const isMediumTick = c % 5 === 0;
                            
                            let tickLength = 4;
                            if (isMediumTick) tickLength = 8;
                            if (isMajorTick) tickLength = 12;

                            const start = polarToCartesian(centerX, centerY, radius, angle);
                            const end = polarToCartesian(centerX, centerY, radius - tickLength, angle);

                            return (
                                <g key={`tick-${c}`}>
                                    <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} strokeWidth={isMajorTick ? 1.5 : 1} />
                                    {isMajorTick && c !== 0 && (
                                        <text
                                            {...polarToCartesian(centerX, centerY, numberRadius, angle)}
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            fontSize="14"
                                            fontWeight="semibold"
                                        >
                                            {c}
                                        </text>
                                    )}
                                     {isMajorTick && c === 0 && (
                                        <>
                                        <circle {...polarToCartesian(centerX, centerY, radius - tickLength - 5, angle)} r="3" fill="currentColor"/>
                                        <text {...polarToCartesian(centerX, centerY, numberRadius, angle)} textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="semibold">0</text>
                                        </>
                                    )}
                                </g>
                            );
                        })}
                        
                         <path
                            d={inTuneMarkerArc}
                            fill="none"
                            strokeWidth="4"
                            strokeLinecap="round"
                            className={`transition-colors duration-200 ${
                                inTune 
                                ? 'stroke-green-500' 
                                : 'stroke-black dark:stroke-white'
                            }`}
                        />
                    </g>
                    
                    {/* Dynamic Text Labels */}
                    <g fontSize="14" fontWeight="bold" letterSpacing="5" className="transition-colors duration-200">
                        <text
                            filter={isFlatRange ? 'url(#glow-red)' : 'none'}
                            className={isFlatRange ? 'fill-red-500' : 'fill-black dark:fill-white'}
                        >
                            <textPath href="#flat-path" startOffset="50%" textAnchor="middle">FLAT</textPath>
                        </text>
                        <text
                            filter={isSharpRange ? 'url(#glow-red)' : 'none'}
                            className={isSharpRange ? 'fill-red-500' : 'fill-black dark:fill-white'}
                        >
                            <textPath href="#sharp-path" startOffset="50%" textAnchor="middle">SHARP</textPath>
                        </text>
                        <text
                            filter={isInTuneRange ? 'url(#glow-green)' : 'none'}
                            className={isInTuneRange ? 'fill-green-500' : 'fill-black dark:fill-white'}
                        >
                            <textPath href="#in-tune-path" startOffset="50%" textAnchor="middle">IN TUNE</textPath>
                        </text>
                    </g>
                    
                    {/* Animated Needle */}
                    <animated.g style={{ transform, transformOrigin: `${centerX}px ${centerY}px` }}>
                        <animated.path
                            d={`M ${centerX} ${centerY - 8} L ${centerX} ${centerY - 130}`}
                            strokeWidth="3"
                            strokeLinecap="round"
                            style={{ stroke: color }}
                        />
                        <animated.circle cx={centerX} cy={centerY} r="6" style={{ fill: color }} />
                    </animated.g>
                </svg>
            </div>
            
            <div
                className="absolute w-full top-[62%] flex flex-col items-center pointer-events-none text-center"
            >
                <div
                    className="font-sans font-bold transition-opacity duration-200"
                    style={{
                        fontSize: 'clamp(3rem, 15vw, 8rem)',
                        lineHeight: 1.1,
                        opacity: noteActive ? 1 : 0.2,
                        color: textColor,
                        textShadow: textShadow,
                        transition: 'color 0.2s ease-in-out, text-shadow 0.2s ease-in-out',
                    }}
                >
                    <span className="relative">
                        {note?.name ?? '-'}
                        <sup className="font-semibold align-super" style={{ fontSize: '40%' }}>
                            {note?.octave}
                        </sup>
                    </span>
                </div>
                 <animated.p
                    className="font-mono text-xl sm:text-2xl transition-opacity duration-200"
                    style={{
                        opacity: noteActive ? 1 : 0,
                        color: textColor,
                        transition: 'color 0.2s ease-in-out',
                    }}
                >
                    {cents.toFixed(1)} cents
                </animated.p>
            </div>
        </div>
    );
};
