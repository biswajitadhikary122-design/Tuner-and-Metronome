import type { NotationSystem } from '../types';

export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const NOTATION_MAPS: Record<NotationSystem, readonly string[]> = {
    'English': NOTE_NAMES_SHARP,
    'Solfege (Fixed Do)': ['Do', 'Di/Ra', 'Re', 'Ri/Me', 'Mi', 'Fa', 'Fi/Se', 'So', 'Si/Le', 'La', 'Li/Te', 'Ti'],
    'Northern European': ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'Ais', 'H'],
    // S=Sa, r=Komal Re, R=Shuddha Re, g=Komal Ga, G=Shuddha Ga, m=Shuddha Ma, M=Tivra Ma, P=Pa, d=Komal Dha, D=Shuddha Dha, n=Komal Ni, N=Shuddha Ni
    'Indian (Sargam)': ['Sa', 're', 'Re', 'ga', 'Ga', 'Ma', 'Ma तीव्र', 'Pa', 'dha', 'Dha', 'ni', 'Ni'],
};
