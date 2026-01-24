/**
 * Local storage utilities for data persistence
 */

import { SavedSession, SavedText, RSVPSettings, DEFAULT_SETTINGS } from '@/types';

const STORAGE_KEYS = {
  SESSION: 'readfaster_session',
  LIBRARY: 'readfaster_library',
  SETTINGS: 'readfaster_settings',
} as const;

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Session persistence
export function saveSession(session: SavedSession): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

export function loadSession(): SavedSession | null {
  if (!isStorageAvailable()) return null;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!data) return null;

    const session = JSON.parse(data) as SavedSession;

    // Check if session is less than 7 days old
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - session.savedAt > sevenDays) {
      clearSession();
      return null;
    }

    return session;
  } catch (e) {
    console.error('Failed to load session:', e);
    return null;
  }
}

export function clearSession(): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
}

// Library management
export function saveToLibrary(text: SavedText): void {
  if (!isStorageAvailable()) return;

  try {
    const library = loadLibrary();
    const existingIndex = library.findIndex((t) => t.id === text.id);

    if (existingIndex >= 0) {
      library[existingIndex] = text;
    } else {
      library.unshift(text);
    }

    // Keep only the last 50 items
    const trimmed = library.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save to library:', e);
  }
}

export function loadLibrary(): SavedText[] {
  if (!isStorageAvailable()) return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.LIBRARY);
    if (!data) return [];

    return JSON.parse(data) as SavedText[];
  } catch (e) {
    console.error('Failed to load library:', e);
    return [];
  }
}

export function removeFromLibrary(id: string): void {
  if (!isStorageAvailable()) return;

  try {
    const library = loadLibrary();
    const filtered = library.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to remove from library:', e);
  }
}

// Settings persistence
export function saveSettings(settings: RSVPSettings): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadSettings(): RSVPSettings {
  if (!isStorageAvailable()) return DEFAULT_SETTINGS;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;

    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
