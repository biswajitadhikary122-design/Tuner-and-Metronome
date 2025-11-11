import { useState, useEffect, useCallback } from 'react';
import type { MetronomePreset } from '../types';

const DEFAULT_PRESETS: Readonly<MetronomePreset[]> = [
    {
        id: 'default_simple_4_4',
        name: 'Simple 4/4',
        bpm: 120,
        timeSignature: '4/4',
        subdivision: 'quarter',
        emphasisPattern: ['accent', 'regular', 'regular', 'regular'],
        isSwingActive: false,
        sound: 'Click',
        volume: 0.75,
        isCountInEnabled: false,
        trainerConfig: { enabled: false, bpmIncrease: 2, barInterval: 4 },
        silenceConfig: { enabled: false, barsToPlay: 3, barsToMute: 1 },
        autoStopConfig: { enabled: false, bars: 16 },
        isDefault: true,
    },
    {
        id: 'default_waltz_3_4',
        name: 'Waltz Time 3/4',
        bpm: 138,
        timeSignature: '3/4',
        subdivision: 'quarter',
        emphasisPattern: ['accent', 'regular', 'regular'],
        isSwingActive: false,
        sound: 'Woodblock',
        volume: 0.75,
        isCountInEnabled: false,
        trainerConfig: { enabled: false, bpmIncrease: 2, barInterval: 4 },
        silenceConfig: { enabled: false, barsToPlay: 3, barsToMute: 1 },
        autoStopConfig: { enabled: false, bars: 16 },
        isDefault: true,
    },
    {
        id: 'default_shuffled_12_8',
        name: 'Blues Shuffle 12/8',
        bpm: 110,
        timeSignature: '4/4',
        subdivision: 'eighth',
        emphasisPattern: ['accent', 'regular', 'regular', 'regular'],
        isSwingActive: true,
        sound: 'Kick',
        volume: 0.8,
        isCountInEnabled: true,
        trainerConfig: { enabled: false, bpmIncrease: 2, barInterval: 4 },
        silenceConfig: { enabled: false, barsToPlay: 3, barsToMute: 1 },
        autoStopConfig: { enabled: false, bars: 16 },
        isDefault: true,
    }
];

const STORAGE_KEY = 'metronome-presets';

export const useMetronomePresets = () => {
    const [presets, setPresets] = useState<MetronomePreset[]>(() => {
        try {
            const storedPresets = localStorage.getItem(STORAGE_KEY);
            const userPresets = storedPresets ? JSON.parse(storedPresets) : [];
            return [...DEFAULT_PRESETS, ...userPresets];
        } catch (error) {
            console.error("Error loading presets from localStorage:", error);
            return [...DEFAULT_PRESETS];
        }
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getUserPresets = (allPresets: MetronomePreset[]) => {
        return allPresets.filter(p => !p.isDefault);
    };

    useEffect(() => {
        try {
            const userPresets = getUserPresets(presets);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userPresets));
            setError(null);
        } catch (err) {
            console.error("Error saving presets to localStorage:", err);
            setError("Could not save presets.");
        }
    }, [presets]);

    const savePreset = useCallback((presetData: Omit<MetronomePreset, 'id' | 'isDefault'>) => {
        const newPreset: MetronomePreset = {
            ...presetData,
            id: `user_${Date.now()}`,
            isDefault: false,
        };
        setPresets(currentPresets => [...currentPresets, newPreset]);
    }, []);

    const deletePreset = useCallback((id: string) => {
        setPresets(currentPresets => currentPresets.filter(p => p.id !== id));
    }, []);

    const updatePreset = useCallback((id: string, updatedData: Partial<Omit<MetronomePreset, 'id' | 'isDefault'>>) => {
        setPresets(currentPresets =>
            currentPresets.map(p => {
                if (p.id === id && !p.isDefault) {
                    return { ...p, ...updatedData };
                }
                return p;
            })
        );
    }, []);

    return { presets, isLoading, error, savePreset, deletePreset, updatePreset };
};