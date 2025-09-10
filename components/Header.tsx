import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { SettingsIcon } from './icons/SettingsIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { StatusIndicator } from './StatusIndicator';

type WorkerStatus = 'unknown' | 'connecting' | 'connected' | 'error';

interface HeaderProps {
    onOpenSettings: () => void;
    onOpenDocs: () => void;
    workerStatus: WorkerStatus;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenDocs, workerStatus }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          <span className="text-primary-600 dark:text-primary-400">Gemini</span> AI Proxy
        </h1>
        <StatusIndicator status={workerStatus} />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={onOpenDocs}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
          aria-label="Open documentation"
        >
          <BookOpenIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
          aria-label="Open settings"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};