
import React, { useState } from 'react';
import type { PlanStep } from '../types';
import { GeminiIcon, PlayIcon, StopIcon } from './Icons';
import { createPracticePlan } from '../services/gemini';

interface PracticeCoachProps {
    isSessionActive: boolean;
    currentStep: PlanStep | null;
    timeLeftInStep: number;
    currentStepIndex: number;
    totalSteps: number;
    onPlanCreated: (plan: PlanStep[]) => void;
    onSessionStart: () => void;
    onSessionStop: () => void;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const PlanSkeleton: React.FC = () => (
    <div className="w-full space-y-3 mt-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl card bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="flex-grow space-y-2">
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
            </div>
        ))}
    </div>
);


export const PracticeCoach: React.FC<PracticeCoachProps> = ({ isSessionActive, currentStep, timeLeftInStep, currentStepIndex, totalSteps, onPlanCreated, onSessionStart, onSessionStop }) => {
    const [prompt, setPrompt] = useState('');
    const [plan, setPlan] = useState<PlanStep[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreatePlan = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setPlan(null);
        try {
            const newPlan = await createPracticePlan(prompt);
            setPlan(newPlan);
            onPlanCreated(newPlan);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create plan.');
        } finally {
            setIsLoading(false);
        }
    };

    const totalDuration = plan?.reduce((sum, step) => sum + step.duration_seconds, 0) || 0;

    const renderPlan = () => {
        if (isLoading) return <PlanSkeleton />;
        if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;
        if (!plan) {
            return (
                 <div className="text-center mt-6 text-slate-500 dark:text-slate-400">
                    <p className="text-lg">Tell the AI your practice goal.</p>
                    <p className="text-sm">e.g., "A 10 minute warm-up for guitar" or "Help me practice scales on piano".</p>
                </div>
            );
        }

        return (
            <div className="w-full space-y-3 mt-4">
                {plan.map((step, index) => {
                    const isActive = isSessionActive && currentStepIndex === index;
                    return (
                        <div key={index} className={`card p-4 rounded-xl transition-all duration-300 flex items-center gap-4 border-2 ${
                            isActive ? 'border-accent' : 'border-transparent'
                        }`}>
                            <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold ${
                                isActive ? 'bg-accent text-white' : 'bg-slate-100 dark:bg-slate-800'
                            }`}>
                                {index + 1}
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold">{step.task}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{step.module} &bull; {formatTime(step.duration_seconds)}</p>
                            </div>
                            {isActive && (
                                <div className="font-mono text-lg font-semibold text-accent">
                                    {formatTime(timeLeftInStep)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 animate-fade-in-up p-4">
            <div className="w-full card p-4 flex flex-col sm:flex-row items-center gap-4">
                <label htmlFor="practice-goal" className="font-semibold text-lg whitespace-nowrap">What's your practice today?</label>
                <input
                    id="practice-goal"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreatePlan() }}
                    placeholder='e.g., "15 minute guitar warm-up"'
                    className="w-full p-3 rounded-lg border transition-colors duration-200 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                    onClick={handleCreatePlan}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors disabled:bg-slate-400"
                >
                    <GeminiIcon className="w-5 h-5"/>
                    {isLoading ? 'Creating...' : 'Create Plan'}
                </button>
            </div>

            {plan && !isSessionActive && (
                <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 p-4 card">
                    <p>
                        Plan created! <span className="font-bold">{plan.length} steps</span>, total time: <span className="font-bold">{formatTime(totalDuration)}</span>
                    </p>
                    <button
                        onClick={onSessionStart}
                        className="px-6 py-3 rounded-full bg-green-500 text-white font-bold flex items-center gap-2 hover:bg-green-600 transition-colors"
                    >
                        <PlayIcon className="w-6 h-6"/>
                        Start Session
                    </button>
                </div>
            )}

            {isSessionActive && (
                 <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 p-4 card border-red-500/50 bg-red-500/10">
                    <p className="text-red-700 dark:text-red-300">
                        Session in progress! Step <span className="font-bold">{currentStepIndex + 1} of {totalSteps}</span>
                    </p>
                    <button
                        onClick={onSessionStop}
                        className="px-6 py-3 rounded-full bg-red-500 text-white font-bold flex items-center gap-2 hover:bg-red-600 transition-colors"
                    >
                        <StopIcon className="w-6 h-6"/>
                        End Session
                    </button>
                </div>
            )}

            {renderPlan()}
        </div>
    );
};
