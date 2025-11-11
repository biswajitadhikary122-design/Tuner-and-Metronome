
import React, { useState, useMemo } from 'react';
import { SCALE_HIERARCHY } from '../constants';
import { SearchIcon, CloseIcon, ChevronDownIcon } from './Icons';
import type { ScaleData } from '../types';

interface ScaleSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (scaleKey: string) => void;
}

export const ScaleSelectionModal: React.FC<ScaleSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredHierarchy = useMemo(() => {
        if (!searchQuery) return SCALE_HIERARCHY;
        
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filtered: typeof SCALE_HIERARCHY = [];

        SCALE_HIERARCHY.forEach(category => {
            const matchingSubcategories = category.subcategories.map(subcategory => {
                const matchingScales = Object.entries(subcategory.scales)
                    // FIX: Added explicit type annotation to fix TS inference error
                    .filter(([key, scale]: [string, ScaleData]) => scale.name.toLowerCase().includes(lowerCaseQuery));
                
                if (matchingScales.length > 0) {
                    return {
                        ...subcategory,
                        scales: Object.fromEntries(matchingScales) as Record<string, ScaleData>
                    };
                }
                return null;
            }).filter((s): s is NonNullable<typeof s> => s !== null);

            if (matchingSubcategories.length > 0) {
                filtered.push({
                    ...category,
                    subcategories: matchingSubcategories
                });
            }
        });

        return filtered;
    }, [searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 animate-fade-in-fast" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="scale-select-title">
            <div 
                className="fixed inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-slate-300/50 dark:border-slate-700/50 rounded-xl shadow-2xl p-4 sm:p-6 flex flex-col h-full w-full sm:h-[80vh] sm:max-h-[700px] sm:w-[90vw] sm:max-w-2xl animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex items-center justify-between mb-4">
                    <h2 id="scale-select-title" className="text-2xl font-semibold text-black dark:text-white">Select a Scale</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Close">
                        <CloseIcon className="w-6 h-6 text-black dark:text-white" />
                    </button>
                </header>

                <div className="relative mb-4 flex-shrink-0">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a scale..."
                        className="w-full p-2.5 pl-10 rounded-md font-semibold border transition-colors duration-200 bg-white/60 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        aria-label="Search for a scale"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3" aria-label="Clear search">
                            <CloseIcon className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                        </button>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-2 no-scrollbar">
                    {filteredHierarchy.map(category => (
                        <details key={category.name} open={!!searchQuery || category.name === 'Western Scales'} className="group">
                            <summary className="text-xl font-bold text-black dark:text-white cursor-pointer list-none flex justify-between items-center p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                                {category.name}
                                <ChevronDownIcon className="w-5 h-5 text-black/70 dark:text-white/70 transform transition-transform duration-200 group-open:rotate-180" />
                            </summary>
                            <div className="pl-2 space-y-2">
                                {category.subcategories.map(subcategory => (
                                    <div key={subcategory.name}>
                                        <h4 className="text-md font-semibold text-black/80 dark:text-white/80 mt-2 mb-1 pl-2">{subcategory.name}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                            {Object.keys(subcategory.scales).map(key => (
                                                <button
                                                    key={key}
                                                    onClick={() => onSelect(key)}
                                                    className="w-full text-left p-2 rounded-md text-black dark:text-white hover:bg-teal-500/20"
                                                >
                                                    {subcategory.scales[key].name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    ))}
                    {filteredHierarchy.length === 0 && <p className="text-center text-black/70 dark:text-white/70 pt-4">No scales found.</p>}
                </div>
            </div>
        </div>
    );
};
