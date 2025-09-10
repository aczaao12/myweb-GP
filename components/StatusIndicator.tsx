import React from 'react';

type WorkerStatus = 'unknown' | 'connecting' | 'connected' | 'error';

interface StatusIndicatorProps {
  status: WorkerStatus;
}

const statusConfig: Record<WorkerStatus, { color: string; label: string; animate: boolean }> = {
  unknown: {
    color: 'bg-gray-400',
    label: 'Worker: Không rõ',
    animate: false,
  },
  connecting: {
    color: 'bg-yellow-400',
    label: 'Worker: Đang kết nối...',
    animate: true,
  },
  connected: {
    color: 'bg-green-500',
    label: 'Worker: Đã kết nối',
    animate: false,
  },
  error: {
    color: 'bg-red-500',
    label: 'Worker: Lỗi kết nối',
    animate: false,
  },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const { color, label, animate } = statusConfig[status];

  return (
    <div className="group relative flex items-center" title={label}>
      <span className={`h-2.5 w-2.5 rounded-full ${color} ${animate ? 'animate-pulse' : ''}`} />
      <span className="absolute left-full ml-2 z-20 scale-0 transform whitespace-nowrap rounded bg-gray-700 px-2 py-1 text-xs text-white transition-transform duration-150 group-hover:scale-100 dark:bg-gray-900">
        {label}
      </span>
    </div>
  );
};