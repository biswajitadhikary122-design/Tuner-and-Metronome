import React from 'react';

export type IconProps = React.SVGProps<SVGSVGElement>;

export const GeminiIcon: React.FC<IconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="url(#gemini-icon-gradient)"
    {...props}
  >
    <defs>
      <linearGradient id="gemini-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4285F4"/>
        <stop offset="50%" stopColor="#34A853"/>
        <stop offset="75%" stopColor="#FBBC05"/>
        <stop offset="100%" stopColor="#EA4335"/>
      </linearGradient>
    </defs>
    <path d="M12 2L15.09 8.91L22 12L15.09 15.09L12 22L8.91 15.09L2 12L8.91 8.91L12 2Z"/>
  </svg>
));


export const MicIcon: React.FC<IconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
));

export const SettingsIcon: React.FC<IconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19.43,12.98c-0.04-0.34-0.07-0.68-0.07-1.02s0.03-0.68,0.07-1.02l2.11-1.63c0.2-0.15,0.25-0.42,0.12-0.64 l-2-3.46c-0.12-0.22-0.39-0.3-0.61-0.22l-2.49,1c-0.52-0.4-1.08-0.73-1.69-0.98l-0.38-2.65C14.46,2.18,14.25,2,14,2h-4 c-0.25,0-0.46,0.18-0.49,0.42L9.13,5.07c-0.61,0.25-1.17,0.59-1.69,0.98l-2.49-1c-0.22-0.08-0.49,0-0.61,0.22l-2,3.46 c-0.13,0.22-0.07,0.49,0.12,0.64l2.11,1.63c0.04,0.34,0.07,0.68,0.07,1.02s-0.03,0.68-0.07,1.02l-2.11,1.63 c-0.2,0.15-0.25,0.42-0.12,0.64l2,3.46c0.12,0.22,0.39,0.3,0.61,0.22l2.49-1c0.52,0.4,1.08,0.73,1.69,0.98l0.38,2.65 C9.54,21.82,9.75,22,10,22h4c0.25,0,0.46-0.18,0.49-0.42l0.38-2.65c0.61-0.25,1.17-0.59,1.69-0.98l2.49,1 c0.22,0.08,0.49,0,0.61,0.22l2-3.46c0.13,0.22,0.07,0.49-0.12-0.64L19.43,12.98z M12,15c-1.66,0-3-1.34-3-3s1.34-3,3-3 s3,1.34,3,3S13.66,15,12,15z" />
  </svg>
));


export const CloseIcon: React.FC<IconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
));

export const PlayIcon: React.FC<IconProps> = React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 3l12 9-12 9z"></path>
    </svg>
  ));
  
  export const PauseIcon: React.FC<IconProps> = React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 4h4v16H6zM14 4h4v16h-4z"></path>
    </svg>
  ));

  export const ChevronDownIcon: React.FC<IconProps> = React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ));

  export const ChevronUpIcon: React.FC<IconProps> = React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  ));

  export const ChevronLeftIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ));
  
  export const ChevronRightIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ));

  export const ExpandIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m21 21-6-6m6 6v-4m0 4h-4" />
        <path d="M3 3l6 6m-6-6v4m0-4h4" />
    </svg>
  ));

export const RecordIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" {...props}>
    <circle cx="12" cy="12" r="7" />
  </svg>
));


export const PianoIcon: React.FC<IconProps> = React.memo((props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24"
        fill="currentColor"
        {...props}
    >
        <path d="M19,2H5A3,3,0,0,0,2,5V15a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V5A3,3,0,0,0,19,2ZM9,16H7V10H9Zm4,0H11V10h2Zm4,0H15V10h2Zm0-8H15V5h2Zm-4,0H11V5h2ZM9,8H7V5H9Z" />
    </svg>
));


export const FretboardIcon: React.FC<IconProps> = React.memo((props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24"
        fill="currentColor"
        {...props}
    >
        <path d="M18,10a1,1,0,0,0-1-1H4.41l2.3-2.29a1,1,0,1,0-1.42-1.42l-4,4a1,1,0,0,0,0,1.42l4,4a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L4.41,11H17A1,1,0,0,0,18,10Zm-3.71,6.29a1,1,0,0,0-1.42,1.42l2.3,2.29H4a1,1,0,0,0,0,2H15.17l-2.29,2.29a1,1,0,1,0,1.42,1.42l4-4a1,1,0,0,0,0-1.42Z" />
    </svg>
));


export const TargetIcon: React.FC<IconProps> = React.memo((props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24"
        fill="currentColor"
        {...props}
    >
        <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Zm0-5a3,3,0,1,1,3-3A3,3,0,0,1,12,15Z" />
    </svg>
));


export const GuitarIcon: React.FC<IconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 12c-3.87 0-7-3.13-7-7 0-2.05.88-3.9 2.3-5.22" />
    <path d="M12 12c3.87 0 7-3.13 7-7 0-2.05-.88-3.9-2.3-5.22" />
    <path d="M12 12v10" />
    <path d="M7 22h10" />
    <path d="M6 12H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2" />
    <path d="M18 12h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
  </svg>
));

export const SitarIcon: React.FC<IconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="currentColor"
    {...props}
  >
    <defs>
      <linearGradient id="sitarGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <path
      fill="url(#sitarGrad)"
      d="M17.83,2.17a1,1,0,0,0-1.41,0L13.5,5.09,9.21,9.38,3.75,8.1A1.74,1.74,0,0,0,2,9.85c0,1.35,1.34,2.2,2.83,2.4,1.45.2,2.53-.19,2.53-.19l.71-.24,3.18,3.18a3.59,3.59,0,0,0,1-.13c-2.43,2.44-5.32,5-3.6,6.71s4.27-1.17,6.71-3.6a3.59,3.59,0,0,0-.13,1l3.18,3.18-.24.71s-.39,1.08-.19,2.53c.2,1.49,1.05,2.83,2.4,2.83a1.74,1.74,0,0,0,1.75-1.75L14.62,14.79l4.29-4.29,2.92-2.92a1,1,0,0,0,0-1.41Z"
    />
    <path
      fill="currentColor"
      d="M19.94,5.65,18.35,4.06,14.21,8.2,8.2,14.21l-1.59-1.59a1,1,0,0,0-1.41,1.41L6.8,15.62,15.62,6.8l1.59-1.59,2.73,2.73Z"
      opacity="0.2"
    />
  </svg>
));

export const StopIcon: React.FC<IconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="6" y="6" width="12" height="12"></rect>
  </svg>
));

export const TrashIcon: React.FC<IconProps> = React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
));

export const SendIcon: React.FC<IconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
));

export const GraphIcon: React.FC<IconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
));

export const TunerLogoIcon: React.FC<IconProps> = React.memo((props) => (
    <svg viewBox="0 0 65 80" {...props}>
        <defs>
            <linearGradient id="tuner-body-3d-icon" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#f9fafb" />
                <stop offset="50%" stopColor="#e5e7eb" />
                <stop offset="100%" stopColor="#9ca3af" />
            </linearGradient>
            <linearGradient id="tuner-screen-3d-icon" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
        </defs>
        <g>
            <rect x="0" y="0" width="60" height="60" rx="12" fill="url(#tuner-body-3d-icon)" stroke="#4b5563" strokeWidth="0.5" />
            <rect x="5" y="5" width="50" height="50" rx="7" fill="#18181b" />
            <rect x="7" y="7" width="46" height="30" rx="5" fill="url(#tuner-screen-3d-icon)" />
            <path d="M 15 22 A 15 10 0 0 1 45 22" strokeWidth="2" stroke="#6b7280" fill="none" />
            <path d="M 15 22 A 15 10 0 0 1 30 12" strokeWidth="2" stroke="#67e8f9" fill="none" />
            <path d="M 30 12 A 15 10 0 0 1 45 22" strokeWidth="2" stroke="#f87171" fill="none" />
            <line x1="30" y1="12" x2="30" y2="14" stroke="white" strokeWidth="1" />
            <text x="30" y="32" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">A</text>
            <circle cx="30" cy="22" r="2" fill="#4b5563" />
            <path d="M 30 22 L 28 14" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            <g transform="translate(0, 40)">
                <g><circle cx="17" cy="6" r="5" fill="#000" /><circle cx="17" cy="5.5" r="4.5" fill="#d1d5db" /></g>
                <g><circle cx="30" cy="6" r="5" fill="#000" /><circle cx="30" cy="5.5" r="4.5" fill="#d1d5db" /></g>
                <g><circle cx="43" cy="6" r="5" fill="#000" /><circle cx="43" cy="5.5" r="4.5" fill="#d1d5db" /></g>
            </g>
            <g transform="translate(48, -5)">
                <rect x="0" y="0" width="3" height="8" rx="1" fill="url(#tuner-body-3d-icon)" />
                <circle cx="1.5" cy="-2.5" r="2.5" fill="url(#tuner-body-3d-icon)" />
            </g>
        </g>
    </svg>
));

export const MetronomeLogoIcon: React.FC<IconProps> = React.memo((props) => (
    <svg viewBox="0 0 65 75" {...props}>
        <defs>
            <linearGradient id="metronome-body-3d-icon" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#e07a5f" />
                <stop offset="100%" stopColor="#c95b42" />
            </linearGradient>
            <linearGradient id="metronome-face-3d-icon" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#f8f0de" />
                <stop offset="100%" stopColor="#e6dcc8" />
            </linearGradient>
            <linearGradient id="metronome-dark-parts-icon" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#4a4a4a" />
                <stop offset="100%" stopColor="#2b2b2b" />
            </linearGradient>
        </defs>
        <g transform="translate(0, 5)">
            <path d="M 0 65 L 12 -5 Q 32.5 -10, 53 -5 L 65 65 A 5 5 0 0 1 60 70 L 5 70 A 5 5 0 0 1 0 65 Z" fill="url(#metronome-body-3d-icon)" stroke="#4a2525" strokeWidth="0.5" />
            <path d="M 16 0 L 49 0 L 58 60 L 7 60 Z" fill="#2d2d2d" />
            <path d="M 18 2 L 47 2 L 54 58 L 11 58 Z" fill="url(#metronome-face-3d-icon)" />
            <g stroke="#6b4a3a" strokeWidth="0.8">
                <line x1="26" y1="10" x2="39" y2="10" />
                <line x1="27" y1="15" x2="38" y2="15" />
                <line x1="28" y1="20" x2="37" y2="20" />
                <line x1="29" y1="25" x2="36" y2="25" />
                <line x1="25" y1="30" x2="40" y2="30" />
                <line x1="29" y1="35" x2="36" y2="35" />
                <line x1="28" y1="40" x2="37" y2="40" />
                <line x1="27" y1="45" x2="38" y2="45" />
                <line x1="26" y1="50" x2="39" y2="50" />
            </g>
            <circle cx="62" cy="67" r="1.5" fill="url(#metronome-dark-parts-icon)" />
            <circle cx="3" cy="67" r="1.5" fill="url(#metronome-dark-parts-icon)" />
            <g transform="translate(32.5 55)">
                <g transform="rotate(-20)">
                    <rect x="-1" y="-50" width="2" height="50" fill="url(#metronome-dark-parts-icon)" />
                    <path d="M -6 -28 L 6 -28 L 4 -23 L -4 -23 Z" fill="url(#metronome-dark-parts-icon)" />
                </g>
                <circle cx="0" cy="0" r="6" fill="url(#metronome-dark-parts-icon)" />
            </g>
        </g>
    </svg>
));

export const TuneIcon: React.FC<IconProps> = React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 12c-3.87 0-7-3.13-7-7" />
      <path d="M12 12c3.87 0 7-3.13 7-7" />
      <path d="M12 12v10" />
      <path d="M12 12H5" />
      <path d="M12 12H19" />
    </svg>
));

export const MusicNoteIcon: React.FC<IconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
));

export const SunIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
));

export const MoonIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
));

export const WheelIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" {...props}>
    {/* This path creates the outer ring by subtracting a smaller circle from a larger one */}
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
    {/* This path creates the middle ring */}
    <path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
    {/* This is the center dot */}
    <circle cx="12" cy="12" r="2" />
  </svg>
));

export const SoundIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </svg>
));

export const BeatIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 8v4l3 3" />
    <circle cx="12" cy="12" r="10" />
  </svg>
));

export const SaveIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
));

export const SwingIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 18V5l12-2v13" />
    <path d="M9 8h12" />
  </svg>
));

export const ArcGaugeIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" {...props}>
    <path d="M5 16 A 7 7 0 0 0 19 16" />
  </svg>
));

export const GaugeIcon: React.FC<IconProps> = React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
      <path d="M12 12l0 4"></path>
      <path d="M12 12l3.5 -2"></path>
    </svg>
));

export const PendulumIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 6l12 12" />
    <path d="M6 18L18 6" />
    <path d="M12 3v18" />
  </svg>
));

export const TilesIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
));

export const LinearScaleIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12h18M6 11v2M9 10v4M12 8v8M15 10v4M18 11v2" />
  </svg>
));

export const PulseIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 12h3" />
    <circle cx="12" cy="12" r="1.5" />
    <path d="M17 12h3" />
  </svg>
));

export const SearchIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
));

export const StrobeIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
));

// Metronome Subdivision Icons
const SubdivisionBase: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 -15 100 115" fill="currentColor" {...props} />
);

export const SubdivisionQuarter: React.FC<IconProps> = (props) => (
  <SubdivisionBase {...props}>
    <circle cx="35" cy="80" r="10"/>
    <rect x="43" y="10" width="8" height="70"/>
  </SubdivisionBase>
);

export const SubdivisionTwoEighths: React.FC<IconProps> = (props) => (
  <SubdivisionBase {...props}>
    <circle cx="20" cy="80" r="10"/>
    <rect x="28" y="10" width="8" height="70"/>
    <circle cx="70" cy="80" r="10"/>
    <rect x="78" y="10" width="8" height="70"/>
    <rect x="28" y="10" width="58" height="10"/>
  </SubdivisionBase>
);

export const SubdivisionSixteenths: React.FC<IconProps> = (props) => (
  <SubdivisionBase {...props}>
    <circle cx="10" cy="80" r="8"/>
    <rect x="16" y="10" width="6" height="70"/>
    <circle cx="35" cy="80" r="8"/>
    <rect x="41" y="10" width="6" height="70"/>
    <circle cx="60" cy="80" r="8"/>
    <rect x="66" y="10" width="6" height="70"/>
    <circle cx="85" cy="80" r="8"/>
    <rect x="91" y="10" width="6" height="70"/>
    <rect x="16" y="10" width="81" height="8"/>
    <rect x="16" y="22" width="81" height="8"/>
  </SubdivisionBase>
);

export const SubdivisionTriplet: React.FC<IconProps> = (props) => (
  <SubdivisionBase {...props}>
    <circle cx="15" cy="80" r="8"/>
    <rect x="21" y="10" width="6" height="70"/>
    <circle cx="45" cy="80" r="8"/>
    <rect x="51" y="10" width="6" height="70"/>
    <circle cx="75" cy="80" r="8"/>
    <rect x="81" y="10" width="6" height="70"/>
    <rect x="21" y="10" width="66" height="8"/>
    <text x="50" y="2" textAnchor="middle" fontSize="20" fontWeight="bold">3</text>
  </SubdivisionBase>
);

export const SubdivisionEighthTwoSixteenths: React.FC<IconProps> = (props) => (
    <SubdivisionBase {...props}>
        {/* Eighth Note */}
        <circle cx="15" cy="80" r="8"/>
        <rect x="21" y="10" width="6" height="70"/>
        {/* First Sixteenth */}
        <circle cx="55" cy="80" r="8"/>
        <rect x="61" y="10" width="6" height="70"/>
        {/* Second Sixteenth */}
        <circle cx="85" cy="80" r="8"/>
        <rect x="91" y="10" width="6" height="70"/>
        {/* Beams */}
        <rect x="21" y="10" width="76" height="8"/>
        <rect x="61" y="22" width="36" height="8"/>
    </SubdivisionBase>
);

export const SubdivisionTwoSixteenthsEighth: React.FC<IconProps> = (props) => (
    <SubdivisionBase {...props}>
        {/* First Sixteenth */}
        <circle cx="15" cy="80" r="8"/>
        <rect x="21" y="10" width="6" height="70"/>
        {/* Second Sixteenth */}
        <circle cx="45" cy="80" r="8"/>
        <rect x="51" y="10" width="6" height="70"/>
        {/* Eighth Note */}
        <circle cx="85" cy="80" r="8"/>
        <rect x="91" y="10" width="6" height="70"/>
        {/* Beams */}
        <rect x="21" y="10" width="76" height="8"/>
        <rect x="21" y="22" width="36" height="8"/>
    </SubdivisionBase>
);

export const SubdivisionDottedEighthSixteenth: React.FC<IconProps> = (props) => (
    <SubdivisionBase {...props}>
        {/* Dotted Eighth Note */}
        <circle cx="10" cy="80" r="10"/>
        <rect x="18" y="10" width="8" height="70"/>
        <circle cx="23" cy="80" r="3.5"/>
        {/* Sixteenth Note */}
        <circle cx="85" cy="80" r="10"/>
        <rect x="93" y="10" width="8" height="70"/>
        {/* Beams */}
        <rect x="18" y="10" width="83" height="10"/>
        <rect x="57" y="22" width="36" height="8"/>
    </SubdivisionBase>
);

export const SubdivisionEighthRestEighth: React.FC<IconProps> = (props) => (
    <SubdivisionBase {...props}>
        {/* Eighth Rest */}
        <g fill="currentColor">
            <circle cx="35" cy="35" r="8" />
            <path d="M30,42 C 55,50 55,70 38,82 L 32,80 C 50,68 50,52 30,42 Z" />
        </g>
        {/* Eighth Note */}
        <circle cx="70" cy="80" r="10"/>
        <rect x="78" y="10" width="8" height="70"/>
        <path d="M86 10 H 96 C 100 12, 100 28, 96 30 L 86 30 Z" />
    </SubdivisionBase>
);

export const SubdivisionShuffle: React.FC<IconProps> = (props) => (
  <SubdivisionBase {...props}>
    {/* Quarter Note */}
    <circle cx="20" cy="80" r="10"/>
    <rect x="28" y="10" width="8" height="70"/>
    {/* Eighth Note */}
    <circle cx="70" cy="80" r="10"/>
    <rect x="78" y="10" width="8" height="70"/>
    <path d="M86 10 H 96 C 100 12, 100 28, 96 30 L 86 30 Z" />
    {/* Equals sign */}
    <line x1="45" y1="45" x2="55" y2="45" strokeWidth="4" stroke="currentColor"/>
    <line x1="45" y1="55" x2="55" y2="55" strokeWidth="4" stroke="currentColor"/>
  </SubdivisionBase>
);

export const SubdivisionSixteenthEighthSixteenth: React.FC<IconProps> = (props) => (
  <SubdivisionBase {...props}>
      {/* First Sixteenth */}
      <circle cx="15" cy="80" r="8"/>
      <rect x="21" y="10" width="6" height="70"/>
      {/* Eighth Note */}
      <circle cx="45" cy="80" r="8"/>
      <rect x="51" y="10" width="6" height="70"/>
      {/* Second Sixteenth */}
      <circle cx="85" cy="80" r="8"/>
      <rect x="91" y="10" width="6" height="70"/>
      {/* Beams */}
      <rect x="21" y="10" width="76" height="8"/>
      <rect x="21" y="22" width="6" height="8"/>
      <rect x="91" y="22" width="6" height="8"/>
  </SubdivisionBase>
);

export const SubdivisionQuintuplet: React.FC<IconProps> = (props) => (
  <SubdivisionBase {...props}>
    <g transform="scale(0.9) translate(5, 0)">
      <circle cx="10" cy="80" r="8"/><rect x="16" y="10" width="6" height="70"/>
      <circle cx="30" cy="80" r="8"/><rect x="36" y="10" width="6" height="70"/>
      <circle cx="50" cy="80" r="8"/><rect x="56" y="10" width="6" height="70"/>
      <circle cx="70" cy="80" r="8"/><rect x="76" y="10" width="6" height="70"/>
      <circle cx="90" cy="80" r="8"/><rect x="96" y="10" width="6" height="70"/>
      <rect x="16" y="10" width="86" height="8"/>
      <rect x="16" y="22" width="86" height="8"/>
      <text x="55" y="2" textAnchor="middle" fontSize="20" fontWeight="bold">5</text>
    </g>
  </SubdivisionBase>
);

export const SubdivisionSextuplet: React.FC<IconProps> = (props) => (
  <SubdivisionBase {...props}>
    <g transform="scale(0.85) translate(8, 0)">
      <circle cx="5" cy="80" r="7"/><rect x="10" y="10" width="5" height="70"/>
      <circle cx="23" cy="80" r="7"/><rect x="28" y="10" width="5" height="70"/>
      <circle cx="41" cy="80" r="7"/><rect x="46" y="10" width="5" height="70"/>
      <circle cx="59" cy="80" r="7"/><rect x="64" y="10" width="5" height="70"/>
      <circle cx="77" cy="80" r="7"/><rect x="82" y="10" width="5" height="70"/>
      <circle cx="95" cy="80" r="7"/><rect x="100" y="10" width="5" height="70"/>
      <rect x="10" y="10" width="95" height="7"/>
      <rect x="10" y="21" width="95" height="7"/>
      <text x="55" y="2" textAnchor="middle" fontSize="20" fontWeight="bold">6</text>
    </g>
  </SubdivisionBase>
);

export const SubdivisionSeptuplet: React.FC<IconProps> = (props) => (
  <SubdivisionBase {...props}>
    <g transform="scale(0.8) translate(12, 0)">
      <circle cx="0" cy="80" r="6"/><rect x="5" y="10" width="4" height="70"/>
      <circle cx="18" cy="80" r="6"/><rect x="23" y="10" width="4" height="70"/>
      <circle cx="36" cy="80" r="6"/><rect x="41" y="10" width="4" height="70"/>
      <circle cx="54" cy="80" r="6"/><rect x="59" y="10" width="4" height="70"/>
      <circle cx="72" cy="80" r="6"/><rect x="77" y="10" width="4" height="70"/>
      <circle cx="90" cy="80" r="6"/><rect x="95" y="10" width="4" height="70"/>
      <circle cx="108" cy="80" r="6"/><rect x="113" y="10" width="4" height="70"/>
      <rect x="5" y="10" width="112" height="6"/>
      <rect x="5" y="20" width="112" height="6"/>
      <text x="60" y="2" textAnchor="middle" fontSize="20" fontWeight="bold">7</text>
    </g>
  </SubdivisionBase>
);

export const SubdivisionThirtySecond: React.FC<IconProps> = (props) => (
  <SubdivisionBase {...props}>
    <g transform="scale(0.8) translate(12, 0)">
        <circle cx="0" cy="80" r="6"/><rect x="5" y="10" width="4" height="70"/>
        <circle cx="15" cy="80" r="6"/><rect x="20" y="10" width="4" height="70"/>
        <circle cx="30" cy="80" r="6"/><rect x="35" y="10" width="4" height="70"/>
        <circle cx="45" cy="80" r="6"/><rect x="50" y="10" width="4" height="70"/>
        <circle cx="60" cy="80" r="6"/><rect x="65" y="10" width="4" height="70"/>
        <circle cx="75" cy="80" r="6"/><rect x="80" y="10" width="4" height="70"/>
        <circle cx="90" cy="80" r="6"/><rect x="95" y="10" width="4" height="70"/>
        <circle cx="105" cy="80" r="6"/><rect x="110" y="10" width="4" height="70"/>
        <rect x="5" y="10" width="109" height="5"/>
        <rect x="5" y="18" width="109" height="5"/>
        <rect x="5" y="26" width="109" height="5"/>
    </g>
  </SubdivisionBase>
);

// --- New Icons for Piano Keyboard ---

export const UIPedalIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d="M6 7L18 7L19.5 9C21 15 13 22 12 22S3 15 4.5 9L6 7ZM8 11C7 15 11 19 12 19S17 15 16 11Z" />
    </svg>
);

export const UIMetronomeIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M6 21L9 3h6l3 18H6zM11.5 5v6H10v2h4v-2h-1.5V5h-1z" />
    </svg>
);


export const PianoGameIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
    <defs>
      <linearGradient id="piano-game-bg-grad" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#d946ef" /> 
        <stop offset="100%" stopColor="#a855f7" /> 
      </linearGradient>
    </defs>

    {/* Background rounded rect */}
    <rect width="100" height="100" rx="22" fill="url(#piano-game-bg-grad)" />

    {/* Piano Keys */}
    <g transform="translate(0, 72)">
      {/* White Keys base */}
      <rect x="1" y="0" width="98" height="28" fill="#FFFFFF" />
      
      {/* Shadows between white keys */}
      <line x1="15" y1="0" x2="15" y2="28" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      <line x1="29" y1="0" x2="29" y2="28" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      <line x1="43" y1="0" x2="43" y2="28" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      <line x1="57" y1="0" x2="57" y2="28" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      <line x1="71" y1="0" x2="71" y2="28" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      <line x1="85" y1="0" x2="85" y2="28" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />

      {/* Black Keys */}
      <rect x="10" y="0" width="10" height="18" rx="1" fill="#27272a" />
      <rect x="24" y="0" width="10" height="18" rx="1" fill="#27272a" />
      <rect x="52" y="0" width="10" height="18" rx="1" fill="#27272a" />
      <rect x="66" y="0" width="10" height="18" rx="1" fill="#27272a" />
      <rect x="80" y="0" width="10" height="18" rx="1" fill="#27272a" />

      {/* Top border of piano */}
      <line x1="1" y1="0" x2="99" y2="0" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
    </g>

    {/* Falling Notes */}
    <g>
      {/* Yellow Note */}
      <circle cx="30" cy="25" r="8" fill="#fef08a" stroke="#fde047" strokeWidth="1.5" />
      {/* Cyan Note */}
      <circle cx="70" cy="35" r="10" fill="#67e8f9" stroke="#22d3ee" strokeWidth="1.5" />
      {/* Green Note */}
      <circle cx="50" cy="55" r="9" fill="#6ee7b7" stroke="#34d399" strokeWidth="1.5" />
    </g>
  </svg>
));


export const MetronomeMuteIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M6 6l12 12" />
        <path d="M12 12L6 6" />
        <path d="M18 18l-6-6" />
        <path d="M12 3v18" />
        <path d="M18 5L6 17" />
    </svg>
));

export const SustainPedalIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4 15c0-2.21 1.79-4 4-4h8c2.21 0 4 1.79 4 4v2H4v-2z" />
        <path d="M16 11V5" />
    </svg>
));

export const KeyboardLayoutIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" {...props}>
        <rect x="4" y="4" width="4" height="4" />
        <rect x="9" y="4" width="4" height="4" />
        <rect x="14" y="4" width="4" height="4" />
        <rect x="4" y="9" width="4" height="4" />
        <rect x="9" y="9" width="4" height="4" />
        <rect x="14" y="9" width="4" height="4" />
        <rect x="4" y="14" width="4" height="4" />
        <rect x="9" y="14" width="4" height="4" />
        <rect x="14" y="14" width="4" height="4" />
    </svg>
));

export const GrandPianoIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 17a2 2 0 002 2h14a2 2 0 002-2v-3.34a2 2 0 00-1.1-1.78l-6.1-2.88a2 2 0 00-1.8 0L4.1 11.88A2 2 0 003 13.66V17z" />
        <path d="M5 19v2" />
        <path d="M19 19v2" />
        <path d="M12 19v2" />
    </svg>
));

export const HamburgerMenuIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
));

export const ChevronDoubleLeftIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="11 17 6 12 11 7" />
        <polyline points="18 17 13 12 18 7" />
    </svg>
));

export const ChevronDoubleRightIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="13 17 18 12 13 7" />
        <polyline points="6 17 11 12 6 7" />
    </svg>
));

export const PianoGameSimpleIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" {...props}>
    <path d="M3 20h18v2H3z" />
    <rect x="7" y="4" width="4" height="8" rx="1" />
    <rect x="13" y="8" width="4" height="8" rx="1" />
  </svg>
));

export const CoachIcon: React.FC<IconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <polyline points="9 14 12 17 15 11"></polyline>
  </svg>
));

export const CheckIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
));

// FIX: Removed duplicate definition of ArcGaugeIcon.
export const WaveformIcon: React.FC<IconProps> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12h2l2-8 4 16 4-16 2 8h2" />
    </svg>
));