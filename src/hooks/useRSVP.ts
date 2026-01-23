'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  tokenize,
  wpmToInterval,
  calculatePivotIndex,
  getWordDelayMultiplier,
  getLongWordExtraDelay,
} from '@/utils/rsvp';
import { saveSession, loadSession, clearSession } from '@/utils/storage';

const REWIND_AMOUNT = 5; // Words to rewind on pause
const FORWARD_AMOUNT = 10; // Words to skip forward
const WPM_STEP = 50; // WPM change per arrow key

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

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordsRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const wpmRef = useRef(300);
  const isPlayingRef = useRef(false);

  // Check for saved session on mount
  useEffect(() => {
    const session = loadSession();
    setHasSavedSession(!!session);
  }, []);

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

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Save session periodically while reading
  useEffect(() => {
    if (words.length > 0 && originalText) {
      const saveTimer = setInterval(() => {
        saveSession({
          text: originalText,
          currentIndex: indexRef.current,
          wpm: wpmRef.current,
          savedAt: Date.now(),
        });
      }, 5000);

      return () => clearInterval(saveTimer);
    }
  }, [words.length, originalText]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Use a ref to hold the tick function to avoid stale closure issues
  const tickRef = useRef<() => void>(() => {});

  // Define the tick function
  tickRef.current = () => {
    if (!isPlayingRef.current) return;

    const currentWords = wordsRef.current;
    const currentIdx = indexRef.current;

    if (currentIdx >= currentWords.length - 1) {
      // Reached the end
      setIsPlaying(false);
      isPlayingRef.current = false;
      setIsComplete(true);
      clearSession();
      return;
    }

    // Calculate delay for CURRENT word (how long to show it)
    const currentWord = currentWords[currentIdx];
    const baseInterval = wpmToInterval(wpmRef.current);
    const multiplier = currentWord ? getWordDelayMultiplier(currentWord) : 1;
    const extraDelay = currentWord ? getLongWordExtraDelay(currentWord) : 0;
    const delay = baseInterval * multiplier + extraDelay;

    timerRef.current = setTimeout(() => {
      if (!isPlayingRef.current) return;

      const nextIndex = indexRef.current + 1;
      setCurrentIndex(nextIndex);
      indexRef.current = nextIndex;

      // Schedule next tick using the ref
      tickRef.current();
    }, delay);
  };

  const startTimer = useCallback(() => {
    stopTimer();
    tickRef.current();
  }, [stopTimer]);

  const adjustWpm = useCallback((delta: number) => {
    setWpmState((prev) => {
      const newWpm = Math.max(100, Math.min(1000, prev + delta));
      wpmRef.current = newWpm;
      return newWpm;
    });
  }, []);

  const start = useCallback(
    (text: string) => {
      const tokenizedWords = tokenize(text);

      if (tokenizedWords.length === 0) {
        return;
      }

      // Always set up words and reset position when starting
      if (words.length === 0 || isComplete) {
        setWords(tokenizedWords);
        wordsRef.current = tokenizedWords;
        setCurrentIndex(0);
        indexRef.current = 0;
        setIsComplete(false);
        setOriginalText(text);
      }

      setIsPlaying(true);
      isPlayingRef.current = true;

      // Start timer after a microtask to ensure state is set
      queueMicrotask(() => {
        startTimer();
      });
    },
    [words.length, isComplete, startTimer]
  );

  const resumeInternal = useCallback(() => {
    if (wordsRef.current.length === 0) return;

    setIsPlaying(true);
    isPlayingRef.current = true;
    startTimer();
  }, [startTimer]);

  const pauseInternal = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    stopTimer();

    // Rewind for context recovery
    setCurrentIndex((prev) => {
      const newIndex = Math.max(0, prev - REWIND_AMOUNT);
      indexRef.current = newIndex;
      return newIndex;
    });
  }, [stopTimer]);

  const pause = useCallback(() => {
    pauseInternal();
  }, [pauseInternal]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    stopTimer();
    setWords([]);
    wordsRef.current = [];
    setCurrentIndex(0);
    indexRef.current = 0;
    setIsComplete(false);
    setOriginalText('');
    clearSession();
    setHasSavedSession(false);
  }, [stopTimer]);

  const setWpm = useCallback((newWpm: number) => {
    setWpmState(newWpm);
    wpmRef.current = newWpm;
  }, []);

  const jumpToPosition = useCallback((index: number) => {
    const safeIndex = Math.max(0, Math.min(index, wordsRef.current.length - 1));
    setCurrentIndex(safeIndex);
    indexRef.current = safeIndex;
  }, []);

  const skipForwardInternal = useCallback(() => {
    if (wordsRef.current.length === 0) return;

    const newIndex = Math.min(
      wordsRef.current.length - 1,
      indexRef.current + FORWARD_AMOUNT
    );
    setCurrentIndex(newIndex);
    indexRef.current = newIndex;
  }, []);

  const skipBackwardInternal = useCallback(() => {
    if (wordsRef.current.length === 0) return;

    const newIndex = Math.max(0, indexRef.current - FORWARD_AMOUNT);
    setCurrentIndex(newIndex);
    indexRef.current = newIndex;
  }, []);

  // Refs for keyboard handler
  const adjustWpmRef = useRef(adjustWpm);
  const pauseInternalRef = useRef(pauseInternal);
  const resumeInternalRef = useRef(resumeInternal);
  const skipForwardInternalRef = useRef(skipForwardInternal);
  const skipBackwardInternalRef = useRef(skipBackwardInternal);

  // Keep function refs in sync
  useEffect(() => {
    adjustWpmRef.current = adjustWpm;
    pauseInternalRef.current = pauseInternal;
    resumeInternalRef.current = resumeInternal;
    skipForwardInternalRef.current = skipForwardInternal;
    skipBackwardInternalRef.current = skipBackwardInternal;
  }, [adjustWpm, pauseInternal, resumeInternal, skipForwardInternal, skipBackwardInternal]);

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
          if (isPlayingRef.current) {
            pauseInternalRef.current();
          } else if (wordsRef.current.length > 0) {
            resumeInternalRef.current();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackwardInternalRef.current();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForwardInternalRef.current();
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustWpmRef.current(WPM_STEP);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustWpmRef.current(-WPM_STEP);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  const skipForward = useCallback(() => {
    skipForwardInternal();
  }, [skipForwardInternal]);

  const skipBackward = useCallback(() => {
    skipBackwardInternal();
  }, [skipBackwardInternal]);

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
    wpmRef.current = session.wpm;

    setIsComplete(false);
    setHasSavedSession(false);

    return true;
  }, []);

  const currentWord = words[currentIndex] || '';
  const pivotIndex = currentWord ? calculatePivotIndex(currentWord) : 0;
  const totalWords = words.length;
  const progress =
    totalWords > 0 ? Math.round(((currentIndex + 1) / totalWords) * 100) : 0;

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
