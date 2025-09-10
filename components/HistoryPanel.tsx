
import React from 'react';
import type { HistoryItem } from '../types';
import { TASK_TYPES } from '../constants';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  activeItemId: string | null;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, activeItemId }) => {
  if (history.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Chưa có lịch sử.
      </div>
    );
  }

  return (
    <div className="p-2 space-y-2">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2">Lịch sử hội thoại</h2>
      {history.map((item) => {
        const taskLabel = TASK_TYPES.find(t => t.value === item.task)?.label || 'Unknown';
        const isActive = item.id === activeItemId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
              isActive
                ? 'bg-primary-100 dark:bg-primary-900/50'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700/50'
            }`}
          >
            <div className={`font-semibold text-sm truncate ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-200'}`}>{item.prompt}</div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {taskLabel}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
