import React, { createContext, useState, useEffect, useMemo } from 'react';

export type FontSize = 'sm' | 'base' | 'lg';
export type ThemeColor = 'blue' | 'green' | 'purple';

// A minimal interface for the Firebase config object
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseURL?: string;
}

export interface Settings {
  fontSize: FontSize;
  themeColor: ThemeColor;
  firebaseConfig: FirebaseConfig | null;
  workerUrl: string | null;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  updateFirebaseConfig: (configStr: string) => void;
}

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
};

const THEME_COLORS: Record<ThemeColor, Record<string, string>> = {
  blue: {
    '--color-primary-50': '239 246 255',
    '--color-primary-100': '219 234 254',
    '--color-primary-200': '191 219 254',
    '--color-primary-300': '147 197 253',
    '--color-primary-400': '96 165 250',
    '--color-primary-500': '59 130 246',
    '--color-primary-600': '37 99 235',
    '--color-primary-700': '29 78 216',
    '--color-primary-800': '30 64 175',
    '--color-primary-900': '30 58 138',
    '--color-primary-950': '23 37 84',
  },
  green: {
    '--color-primary-50': '240 253 244',
    '--color-primary-100': '220 252 231',
    '--color-primary-200': '187 247 208',
    '--color-primary-300': '134 239 172',
    '--color-primary-400': '74 222 128',
    '--color-primary-500': '34 197 94',
    '--color-primary-600': '22 163 74',
    '--color-primary-700': '21 128 61',
    '--color-primary-800': '22 101 52',
    '--color-primary-900': '20 83 45',
    '--color-primary-950': '5 46 22',
  },
  purple: {
    '--color-primary-50': '245 243 255',
    '--color-primary-100': '237 233 254',
    '--color-primary-200': '221 214 254',
    '--color-primary-300': '196 181 253',
    '--color-primary-400': '167 139 250',
    '--color-primary-500': '139 92 246',
    '--color-primary-600': '124 58 237',
    '--color-primary-700': '109 40 217',
    '--color-primary-800': '91 33 182',
    '--color-primary-900': '76 29 149',
    '--color-primary-950': '46 16 101',
  }
};

const defaultSettings: Settings = {
  fontSize: 'base',
  themeColor: 'blue',
  firebaseConfig: null,
  workerUrl: null,
};

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  updateFirebaseConfig: () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem('app-settings');
      return storedSettings ? { ...defaultSettings, ...JSON.parse(storedSettings) } : defaultSettings;
    } catch (error) {
      console.error('Failed to parse settings from localStorage', error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
    }
    
    // Apply font size
    const root = document.documentElement;
    Object.values(FONT_SIZE_CLASSES).forEach(className => root.classList.remove(className));
    root.classList.add(FONT_SIZE_CLASSES[settings.fontSize]);

    // Apply theme color
    const theme = THEME_COLORS[settings.themeColor];
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateFirebaseConfig = (configStr: string) => {
    try {
        const parsedConfig = JSON.parse(configStr);
        
        // Basic validation: must have at least apiKey and projectId
        if (!parsedConfig.apiKey || !parsedConfig.projectId) {
            alert("Invalid Firebase Config format. Missing required fields 'apiKey' or 'projectId'.");
            updateSettings({ firebaseConfig: null });
            return;
        }

        // Auto-populate databaseURL if it's missing, which is common for newer Firebase configs.
        if (!parsedConfig.databaseURL) {
            parsedConfig.databaseURL = `https://${parsedConfig.projectId}-default-rtdb.firebaseio.com`;
        }
        
        updateSettings({ firebaseConfig: parsedConfig });
    } catch (e) {
        alert("Error parsing Firebase Config JSON. Please check the format.");
        updateSettings({ firebaseConfig: null });
    }
  };

  const value = useMemo(() => ({ settings, updateSettings, updateFirebaseConfig }), [settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};