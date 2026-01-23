'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { tokenize, wpmToInterval, calculatePivotIndex } from '@/utils/rsvp';
import { saveSession, loadSession, clearSession } from '@/utils/storage';

const REWIND_AMOUNT = 5;
const FORWARD_AMOUNT = 10;
const WPM_STEP = 50;

interface UseRSVPReturn {
  words: string[];
  currentIndex: number;
  isPlaying: boolean;
  wpm: number;
  currentWord: string;
  pivotIndex: number;
  totalWords: number;
  progress: number;
  isComplete: boolean;
  start: (text: string) => void;
  pause: () => void;
  reset: () => void;
  setWpm: (wpm: number) => void;
  jumpToPosition: (index: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
  loadSavedSession: () => boolean;
  hasSavedSession: boolean;
}

export function useRSVP(): UseRSVPReturn {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpmState] = useState(300);
  const [isComplete, setIsComplete] = useState(false);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [originalText, setOriginalText] = useState('');

  const intervalRef = useRef<number | null>(null);

  // Check for saved session on mount
  useEffect(() => {
    const session = loadSession();
    setHasSavedSession(!!session);
  }, []);

  // Save session periodically
  useEffect(() => {
    if (words.length > 0 && originalText && isPlaying) {
      const saveTimer = window.setInterval(() => {
        saveSession({
          text: originalText,
          currentIndex: currentIndex,
          wpm: wpm,
          savedAt: Date.now(),
        });
      }, 5000);
      return () => window.clearInterval(saveTimer);
    }
  }, [words.length, originalText, isPlaying, currentIndex, wpm]);

  // Main playback effect - this is the core logic
  useEffect(() => {
    if (!isPlaying || words.length === 0) {
      return;
    }

    const interval = wpmToInterval(wpm);

    intervalRef.current = window.setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        if (nextIndex >= words.length) {
          // Reached the end
          window.clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsPlaying(false);
          setIsComplete(true);
          clearSession();
          return prevIndex; // Stay at last word
        }

        return nextIndex;
      });
    }, interval);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, wpm, words.length]);

  const start = useCallback((text: string) => {
    const tokenizedWords = tokenize(text);
    if (tokenizedWords.length === 0) return;

    setWords(tokenizedWords);
    setCurrentIndex(0);
    setIsComplete(false);
    setOriginalText(text);
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    // Rewind for context recovery
    setCurrentIndex((prev) => Math.max(0, prev - REWIND_AMOUNT));
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setWords([]);
    setCurrentIndex(0);
    setIsComplete(false);
    setOriginalText('');
    clearSession();
    setHasSavedSession(false);
  }, []);

  const setWpm = useCallback((newWpm: number) => {
    setWpmState(newWpm);
  }, []);

  const jumpToPosition = useCallback((index: number) => {
    setCurrentIndex((prev) => {
      const safeIndex = Math.max(0, Math.min(index, words.length - 1));
      return safeIndex;
    });
  }, [words.length]);

  const skipForward = useCallback(() => {
    setCurrentIndex((prev) => Math.min(words.length - 1, prev + FORWARD_AMOUNT));
  }, [words.length]);

  const skipBackward = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - FORWARD_AMOUNT));
  }, []);

  const loadSavedSession = useCallback((): boolean => {
    const session = loadSession();
    if (!session) return false;

    const tokenizedWords = tokenize(session.text);
    if (tokenizedWords.length === 0) return false;

    setWords(tokenizedWords);
    setOriginalText(session.text);
    const safeIndex = Math.min(session.currentIndex, tokenizedWords.length - 1);
    setCurrentIndex(safeIndex);
    setWpmState(session.wpm);
    setIsComplete(false);
    setHasSavedSession(false);

    return true;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) {
            pause();
          } else if (words.length > 0 && !isComplete) {
            setIsPlaying(true);
          } else if (isComplete) {
            // Restart from beginning
            setCurrentIndex(0);
            setIsComplete(false);
            setIsPlaying(true);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setWpmState((prev) => Math.min(1000, prev + WPM_STEP));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setWpmState((prev) => Math.max(100, prev - WPM_STEP));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, words.length, isComplete, pause, skipBackward, skipForward]);

  const currentWord = words[currentIndex] || '';
  const pivotIndex = currentWord ? calculatePivotIndex(currentWord) : 0;
  const totalWords = words.length;
  const progress = totalWords > 0 ? Math.round(((currentIndex + 1) / totalWords) * 100) : 0;

  return {
    words,
    currentIndex,
    isPlaying,
    wpm,
    currentWord,
    pivotIndex,
    totalWords,
    progress,
    isComplete,
    start,
    pause,
    reset,
    setWpm,
    jumpToPosition,
    skipForward,
    skipBackward,
    loadSavedSession,
    hasSavedSession,
  };
}
