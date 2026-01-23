'use client';

import { useState, useCallback, useEffect } from 'react';
import { SavedText } from '@/types';
import {
  loadLibrary,
  saveToLibrary,
  removeFromLibrary,
  updateLibraryPosition,
  generateId,
} from '@/utils/storage';
import { tokenize } from '@/utils/rsvp';

interface UseLibraryReturn {
  library: SavedText[];
  saveText: (title: string, content: string) => SavedText;
  deleteText: (id: string) => void;
  updatePosition: (id: string, position: number) => void;
  refreshLibrary: () => void;
}

export function useLibrary(): UseLibraryReturn {
  const [library, setLibrary] = useState<SavedText[]>([]);

  // Load library on mount
  useEffect(() => {
    setLibrary(loadLibrary());
  }, []);

  const refreshLibrary = useCallback(() => {
    setLibrary(loadLibrary());
  }, []);

  const saveText = useCallback((title: string, content: string): SavedText => {
    const words = tokenize(content);
    const newText: SavedText = {
      id: generateId(),
      title: title || `Saved ${new Date().toLocaleDateString()}`,
      content,
      savedAt: Date.now(),
      lastPosition: 0,
      wordCount: words.length,
    };

    saveToLibrary(newText);
    setLibrary(loadLibrary());

    return newText;
  }, []);

  const deleteText = useCallback((id: string) => {
    removeFromLibrary(id);
    setLibrary(loadLibrary());
  }, []);

  const updatePosition = useCallback((id: string, position: number) => {
    updateLibraryPosition(id, position);
    // Don't refresh the whole library to avoid UI flicker
  }, []);

  return {
    library,
    saveText,
    deleteText,
    updatePosition,
    refreshLibrary,
  };
}
