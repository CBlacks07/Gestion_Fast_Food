import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '../types';

interface AppSettingsStore {
  settings: AppSettings | null;
  isLoaded: boolean;
  setSettings: (settings: AppSettings) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  reset: () => void;
}

const defaultSettings: AppSettings = {
  id: 'default',
  appName: 'Gestion Fast-Food',
  appIcon: '🍔',
  primaryColor: '#ef4444',
  currency: 'FCFA',
  currencySymbol: 'FCFA',
  taxRate: 0,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useAppSettingsStore = create<AppSettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      isLoaded: false,

      setSettings: (settings) => {
        set({ settings, isLoaded: true });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: state.settings ? { ...state.settings, ...newSettings } : null,
        }));
      },

      reset: () => {
        set({ settings: defaultSettings, isLoaded: false });
      },
    }),
    {
      name: 'app-settings-storage',
    }
  )
);
