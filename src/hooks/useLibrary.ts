'use client';

import { useState, useCallback, useEffect } from 'react';
import { SavedText } from '@/types';
import { saveToLibrary, loadLibrary, removeFromLibrary, generateId } from '@/utils/storage';

interface UseLibraryReturn {
  library: SavedText[];
  saveText: (title: string, content: string) => void;
  deleteText: (id: string) => void;
  refreshLibrary: () => void;
}

export function useLibrary(): UseLibraryReturn {
  const [library, setLibrary] = useState<SavedText[]>([]);

  const refreshLibrary = useCallback(() => {
    const saved = loadLibrary();
    setLibrary(saved);
  }, []);

  // Load library on mount
  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const saveText = useCallback((title: string, content: string) => {
    const words = content.split(/\s+/).filter((w) => w.length > 0);
    const newText: SavedText = {
      id: generateId(),
      title,
      content,
      savedAt: Date.now(),
      lastPosition: 0,
      wordCount: words.length,
    };

    saveToLibrary(newText);
    setLibrary((prev) => [newText, ...prev].slice(0, 50));
  }, []);

  const deleteText = useCallback((id: string) => {
    removeFromLibrary(id);
    setLibrary((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    library,
    saveText,
    deleteText,
    refreshLibrary,
  };
}
