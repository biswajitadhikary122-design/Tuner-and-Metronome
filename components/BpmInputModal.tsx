import React, { useState, useEffect } from 'react';
import { CloseIcon } from './Icons';

interface BpmInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBpm: number;
  onSetBpm: (newBpm: number) => void;
}

export const BpmInputModal: React.FC<BpmInputModalProps> = ({ isOpen, onClose, currentBpm, onSetBpm }) => {
  const [inputValue, setInputValue] = useState(String(currentBpm));

  useEffect(() => {
    if (isOpen) {
      setInputValue(String(currentBpm));
    }
  }, [isOpen, currentBpm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBpm = parseInt(inputValue, 10);
    if (!isNaN(newBpm) && newBpm >= 40 && newBpm <= 240) {
      onSetBpm(newBpm);
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in-fast"
        onClick={onClose}
      ></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xs animate-fade-in-up">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-300/50 dark:border-gray-700/50 rounded-xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Set Tempo</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Close"
            >
              <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              min="40"
              max="240"
              autoFocus
              className="w-full p-4 text-center text-4xl font-mono rounded-lg border-2 transition-colors duration-200
                         bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
            <button
              type="submit"
              className="w-full bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              Set
            </button>
            <p className="text-center text-xs text-gray-500">Enter a value between 40 and 240.</p>
          </form>
        </div>
      </div>
    </>
  );
};
