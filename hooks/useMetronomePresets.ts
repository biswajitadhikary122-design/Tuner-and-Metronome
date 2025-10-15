import { useState, useEffect, useCallback } from 'react';
import type { MetronomePreset } from '../types';

const PRESETS_STORAGE_KEY = 'metronome-presets-v1';

export const useMetronomePresets = () => {
    const [presets, setPresets] = useState<MetronomePreset[]>(() => {
        try {
            const saved = window.localStorage.getItem(PRESETS_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading presets from localStorage:', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
        } catch (error) {
            console.error('Error saving presets to localStorage:', error);
        }
    }, [presets]);

    const savePreset = useCallback((presetData: Omit<MetronomePreset, 'id'>) => {
        const newPreset: MetronomePreset = {
            ...presetData,
            id: `preset-${Date.now()}`,
        };
        setPresets(prev => [...prev, newPreset]);
    }, []);

    const deletePreset = useCallback((id: string) => {
        setPresets(prev => prev.filter(p => p.id !== id));
    }, []);

    const updatePreset = useCallback((id: string, updatedData: Partial<MetronomePreset>) => {
        setPresets(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    }, []);

    return {
        presets,
        savePreset,
        deletePreset,
        updatePreset,
    };
};