'use client';

import { useState, useCallback, useEffect } from 'react';
import { RSVPSettings, DEFAULT_SETTINGS } from '@/types';
import { saveSettings, loadSettings } from '@/utils/storage';

interface UseSettingsReturn {
  settings: RSVPSettings;
  updateSettings: (partial: Partial<RSVPSettings>) => void;
  resetSettings: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<RSVPSettings>(DEFAULT_SETTINGS);

  // Load settings on mount
  useEffect(() => {
    const saved = loadSettings();
    setSettings(saved);
  }, []);

  const updateSettings = useCallback((partial: Partial<RSVPSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
