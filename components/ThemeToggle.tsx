
import React from 'react';
import { useTransition, animated } from '@react-spring/web';
import { SunIcon, MoonIcon } from './Icons';

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, onToggle }) => {
  const transitions = useTransition(darkMode, {
    from: { opacity: 0, transform: 'scale(0.8) rotate(-90deg)' },
    enter: { opacity: 1, transform: 'scale(1) rotate(0deg)' },
    leave: { opacity: 0, transform: 'scale(0.8) rotate(90deg)' },
    config: { tension: 300, friction: 20 },
    exitBeforeEnter: true,
  });

  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 relative w-10 h-10 flex items-center justify-center"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {transitions((style, item) =>
        item ? (
          <animated.div style={style} className="absolute inset-0 flex items-center justify-center">
            <SunIcon className="w-6 h-6 text-yellow-500" />
          </animated.div>
        ) : (
          <animated.div style={style} className="absolute inset-0 flex items-center justify-center">
            <MoonIcon className="w-6 h-6 text-slate-400" />
          </animated.div>
        )
      )}
    </button>
  );
};
