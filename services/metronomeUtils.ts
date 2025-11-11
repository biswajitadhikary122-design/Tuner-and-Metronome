import type { TimeSignature } from '../types';

export const parseTimeSignature = (ts: TimeSignature) => {
    const match = ts.match(/(\d+)\/\d+(?: \(([\d+]+)\))?/);
    if (match) {
        const beats = parseInt(match[1], 10);
        const grouping = match[2] ? match[2].split('+').map(Number) : null;
        return { beatsPerMeasure: beats, grouping };
    }
    return { beatsPerMeasure: 4, grouping: null }; // Default
};