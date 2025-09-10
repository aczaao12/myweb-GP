import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import type { FontSize, ThemeColor } from '../contexts/SettingsContext';
import { CloseIcon } from './icons/CloseIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface SettingsPageProps {
  onClose: () => void;
}

const fontSizes: { value: FontSize; label: string }[] = [
  { value: 'sm', label: 'Nhỏ' },
  { value: 'base', label: 'Vừa' },
  { value: 'lg', label: 'Lớn' },
];

const themeColors: { value: ThemeColor; label: string; className: string }[] = [
  { value: 'blue', label: 'Mặc định', className: 'bg-blue-500' },
  { value: 'green', label: 'Xanh lá', className: 'bg-green-500' },
  { value: 'purple', label: 'Tím', className: 'bg-purple-500' },
];

const SettingOption: React.FC<{
  label: string;
  isSelected: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}> = ({ label, isSelected, onClick, children }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors duration-200 ${
      isSelected
        ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
        : 'hover:bg-gray-200 dark:hover:bg-gray-700/50'
    }`}
  >
    <span>{label}</span>
    {children}
  </button>
);


export const SettingsPage: React.FC<SettingsPageProps> = ({ onClose }) => {
  const { settings, updateSettings, updateFirebaseConfig } = useSettings();
  const [tempFirebaseConfig, setTempFirebaseConfig] = useState(() => 
    settings.firebaseConfig ? JSON.stringify(settings.firebaseConfig, null, 2) : ''
  );
  const [tempWorkerUrl, setTempWorkerUrl] = useState(settings.workerUrl || '');

  const handleConfigSave = () => {
    updateFirebaseConfig(tempFirebaseConfig);
    updateSettings({ workerUrl: tempWorkerUrl });
    alert("Cấu hình Firebase và Worker đã được cập nhật.");
  };

  const handleDownloadSample = () => {
    const sampleConfig = {
      apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXX",
      authDomain: "your-project-id.firebaseapp.com",
      databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:xxxxxxxxxxxxxxxxx"
    };
    const blob = new Blob([JSON.stringify(sampleConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-firebase-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Cài đặt</h1>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
            aria-label="Close settings"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
      </header>
      
      <div className="p-6 space-y-8 overflow-y-auto">

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Cấu hình Kết nối</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Kết nối ứng dụng với backend Cloudflare Worker và project Firebase của bạn. Xem trang Hướng dẫn để biết cách lấy các giá trị này.
          </p>
          <div className="space-y-4">
             <div>
              <label htmlFor="workerUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cloudflare Worker URL
              </label>
              <input
                id="workerUrl"
                type="url"
                value={tempWorkerUrl}
                onChange={(e) => setTempWorkerUrl(e.target.value)}
                placeholder="https://your-worker-name.your-account.workers.dev"
                className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
               <div className="flex items-center justify-between mb-1">
                <label htmlFor="firebaseConfig" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Firebase Config (dạng JSON)
                </label>
                <button
                    onClick={handleDownloadSample}
                    className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    title="Tải file JSON mẫu"
                >
                    <DownloadIcon className="w-3 h-3" />
                    <span>Tải file mẫu</span>
                </button>
               </div>
              <textarea
                id="firebaseConfig"
                rows={8}
                value={tempFirebaseConfig}
                onChange={(e) => setTempFirebaseConfig(e.target.value)}
                placeholder='{\n  "apiKey": "...",\n  "authDomain": "...",\n  "databaseURL": "...",\n  ...\n}'
                className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono text-xs"
              />
            </div>
            <button
                onClick={handleConfigSave}
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-200"
            >
                Lưu cấu hình
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Giao diện</h2>
          <div className="space-y-2">
              <h3 className="text-md font-semibold mb-2 text-gray-600 dark:text-gray-400">Cỡ chữ</h3>
                {fontSizes.map(({ value, label }) => (
                  <SettingOption
                    key={value}
                    label={label}
                    isSelected={settings.fontSize === value}
                    onClick={() => updateSettings({ fontSize: value })}
                  />
                ))}
          </div>
           <div className="space-y-2 mt-4">
              <h3 className="text-md font-semibold mb-2 text-gray-600 dark:text-gray-400">Màu chủ đạo</h3>
                {themeColors.map(({ value, label, className }) => (
                  <SettingOption
                    key={value}
                    label={label}
                    isSelected={settings.themeColor === value}
                    onClick={() => updateSettings({ themeColor: value })}
                  >
                    <div className={`w-6 h-6 rounded-full ${className}`}></div>
                  </SettingOption>
                ))}
          </div>
        </section>
      </div>
    </div>
  );
};