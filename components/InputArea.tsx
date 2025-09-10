
import React, { useState, useRef, useEffect } from 'react';
import { TASK_TYPES } from '../constants';
import type { TaskType } from '../types';
import { SendIcon } from './icons/SendIcon';

interface InputAreaProps {
  onSubmit: (prompt: string, task: TaskType) => void;
  isLoading: boolean;
  activeTaskType: TaskType;
  setActiveTaskType: (task: TaskType) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSubmit, isLoading, activeTaskType, setActiveTaskType }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt, activeTaskType);
      setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="mb-3 flex items-center justify-center gap-2">
        {TASK_TYPES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTaskType(value)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
              activeTaskType === value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập ý tưởng của bạn... (Ctrl+Enter để gửi)"
          className="w-full p-4 pr-14 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none overflow-y-hidden"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="absolute right-3 bottom-3 p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <SendIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
};
