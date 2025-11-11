import React from 'react';
import { useSpring, animated } from '@react-spring/web';

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, onToggle }) => {
  const properties = {
    dark: {
      // moon properties
      thumbBg: 'hsl(233, 33%, 88%)',
      trackBg: 'hsl(240, 40%, 20%)',
      sunRaysOpacity: 0,
      moonMaskCx: '10',
      moonMaskCy: '0',
      rotation: -90,
    },
    light: {
      // sun properties
      thumbBg: 'hsl(45, 95%, 65%)',
      trackBg: 'hsl(198, 93%, 75%)',
      sunRaysOpacity: 1,
      moonMaskCx: '25',
      moonMaskCy: '0',
      rotation: 0,
    },
    springConfig: { mass: 4, tension: 250, friction: 35 },
  };

  const { thumbBg, trackBg, sunRaysOpacity, moonMaskCx, moonMaskCy, rotation } = useSpring({
    ...(darkMode ? properties.dark : properties.light),
    config: properties.springConfig,
  });

  const thumbSpring = useSpring({
    transform: darkMode ? 'translateX(24px)' : 'translateX(0px)',
    config: properties.springConfig,
  });

  return (
    <animated.button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={darkMode}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative inline-flex items-center rounded-full w-14 h-8 p-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 shadow-inner"
      style={{ backgroundColor: trackBg }}
    >
      <animated.span
        className="h-6 w-6 rounded-full shadow-lg flex items-center justify-center overflow-hidden"
        style={{
          ...thumbSpring,
          backgroundColor: thumbBg,
        }}
      >
        <animated.svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="currentColor"
          style={{
            transform: rotation.to(r => `rotate(${r}deg)`),
            color: darkMode ? 'hsl(240, 40%, 20%)' : 'white',
          }}
        >
          <mask id="moon-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <animated.circle cx={moonMaskCx} cy={moonMaskCy} r="8" fill="black" />
          </mask>

          <animated.circle
            cx="12"
            cy="12"
            r="5"
            fill="currentColor"
            mask="url(#moon-mask)"
          />

          {/* Sun rays */}
          <animated.g stroke="currentColor" style={{ opacity: sunRaysOpacity }}>
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </animated.g>
        </animated.svg>
      </animated.span>
    </animated.button>
  );
};
