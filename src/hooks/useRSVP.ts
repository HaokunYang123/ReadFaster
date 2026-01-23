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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wordsRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const wpmRef = useRef(wpm);

  // Keep refs in sync with state
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    wpmRef.current = wpm;
  }, [wpm]);

  // Check for saved session on mount
  useEffect(() => {
    const session = loadSession();
    setHasSavedSession(!!session);
  }, []);

  // Save session periodically while playing
  useEffect(() => {
    if (words.length > 0 && originalText && isPlaying) {
      const saveTimer = setInterval(() => {
        saveSession({
          text: originalText,
          currentIndex: indexRef.current,
          wpm,
          savedAt: Date.now(),
        });
      }, 5000);
      return () => clearInterval(saveTimer);
    }
  }, [words.length, originalText, isPlaying, wpm]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    // Clear any existing interval first
    stopInterval();

    const interval = wpmToInterval(wpmRef.current);

    intervalRef.current = setInterval(() => {
      if (indexRef.current < wordsRef.current.length) {
        setCurrentIndex((prev) => prev + 1);
        indexRef.current += 1;
      } else {
        stopInterval();
        setIsPlaying(false);
        setIsComplete(true);
        clearSession();
      }
    }, interval);
  }, [stopInterval]);

  const start = useCallback(
    (text: string) => {
      const tokenizedWords = tokenize(text);

      if (tokenizedWords.length === 0) {
        return;
      }

      // If starting fresh or restarting after completion
      if (words.length === 0 || isComplete) {
        setWords(tokenizedWords);
        wordsRef.current = tokenizedWords;
        setCurrentIndex(0);
        indexRef.current = 0;
        setIsComplete(false);
        setOriginalText(text);
      }

      setIsPlaying(true);
      startInterval();
    },
    [words.length, isComplete, startInterval]
  );

  const pause = useCallback(() => {
    setIsPlaying(false);
    stopInterval();

    // Rewind for context recovery
    setCurrentIndex((prev) => {
      const newIndex = Math.max(0, prev - REWIND_AMOUNT);
      indexRef.current = newIndex;
      return newIndex;
    });
  }, [stopInterval]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    stopInterval();
    setWords([]);
    wordsRef.current = [];
    setCurrentIndex(0);
    indexRef.current = 0;
    setIsComplete(false);
    setOriginalText('');
    clearSession();
    setHasSavedSession(false);
  }, [stopInterval]);

  const setWpm = useCallback(
    (newWpm: number) => {
      setWpmState(newWpm);

      // If currently playing, restart with new interval
      if (isPlaying) {
        stopInterval();
        const interval = wpmToInterval(newWpm);

        intervalRef.current = setInterval(() => {
          if (indexRef.current < wordsRef.current.length) {
            setCurrentIndex((prev) => prev + 1);
            indexRef.current += 1;
          } else {
            stopInterval();
            setIsPlaying(false);
            setIsComplete(true);
            clearSession();
          }
        }, interval);
      }
    },
    [isPlaying, stopInterval]
  );

  const jumpToPosition = useCallback((index: number) => {
    const safeIndex = Math.max(0, Math.min(index, wordsRef.current.length - 1));
    setCurrentIndex(safeIndex);
    indexRef.current = safeIndex;
  }, []);

  const skipForward = useCallback(() => {
    const newIndex = Math.min(wordsRef.current.length - 1, indexRef.current + FORWARD_AMOUNT);
    setCurrentIndex(newIndex);
    indexRef.current = newIndex;
  }, []);

  const skipBackward = useCallback(() => {
    const newIndex = Math.max(0, indexRef.current - FORWARD_AMOUNT);
    setCurrentIndex(newIndex);
    indexRef.current = newIndex;
  }, []);

  const loadSavedSession = useCallback((): boolean => {
    const session = loadSession();
    if (!session) return false;

    const tokenizedWords = tokenize(session.text);
    if (tokenizedWords.length === 0) return false;

    setWords(tokenizedWords);
    wordsRef.current = tokenizedWords;
    setOriginalText(session.text);

    const safeIndex = Math.min(session.currentIndex, tokenizedWords.length - 1);
    setCurrentIndex(safeIndex);
    indexRef.current = safeIndex;

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
          } else if (wordsRef.current.length > 0 && !isComplete) {
            setIsPlaying(true);
            startInterval();
          } else if (isComplete) {
            setCurrentIndex(0);
            indexRef.current = 0;
            setIsComplete(false);
            setIsPlaying(true);
            startInterval();
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
  }, [isPlaying, isComplete, pause, startInterval, skipBackward, skipForward]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopInterval();
    };
  }, [stopInterval]);

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
