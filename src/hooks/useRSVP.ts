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

  // Use refs to avoid stale closures in interval
  const wordsLengthRef = useRef(0);
  const intervalIdRef = useRef<number | undefined>(undefined);

  // Keep ref in sync
  useEffect(() => {
    wordsLengthRef.current = words.length;
  }, [words.length]);

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

  // Main playback effect
  useEffect(() => {
    if (!isPlaying) {
      // Clear interval when not playing
      if (intervalIdRef.current !== undefined) {
        console.log('[RSVP] Clearing interval because isPlaying is false');
        window.clearInterval(intervalIdRef.current);
        intervalIdRef.current = undefined;
      }
      return;
    }

    const totalWords = wordsLengthRef.current;
    if (totalWords === 0) {
      console.log('[RSVP] No words to play');
      return;
    }

    const interval = wpmToInterval(wpm);
    console.log(`[RSVP] Starting interval with ${interval}ms delay, ${totalWords} words`);

    intervalIdRef.current = window.setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        console.log(`[RSVP] Tick: ${prevIndex} -> ${nextIndex}, total: ${wordsLengthRef.current}`);

        if (nextIndex >= wordsLengthRef.current) {
          console.log('[RSVP] Reached end, stopping');
          window.clearInterval(intervalIdRef.current);
          intervalIdRef.current = undefined;
          setIsPlaying(false);
          setIsComplete(true);
          clearSession();
          return prevIndex;
        }

        return nextIndex;
      });
    }, interval);

    // Cleanup function
    return () => {
      console.log('[RSVP] Effect cleanup - clearing interval');
      if (intervalIdRef.current !== undefined) {
        window.clearInterval(intervalIdRef.current);
        intervalIdRef.current = undefined;
      }
    };
  }, [isPlaying, wpm]);

  const start = useCallback((text: string) => {
    const tokenizedWords = tokenize(text);
    if (tokenizedWords.length === 0) return;

    console.log(`[RSVP] start() called with ${tokenizedWords.length} words`);

    // Update ref immediately
    wordsLengthRef.current = tokenizedWords.length;

    setWords(tokenizedWords);
    setCurrentIndex(0);
    setIsComplete(false);
    setOriginalText(text);
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    console.log('[RSVP] pause() called');
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.max(0, prev - REWIND_AMOUNT));
  }, []);

  const reset = useCallback(() => {
    console.log('[RSVP] reset() called');
    setIsPlaying(false);
    setWords([]);
    wordsLengthRef.current = 0;
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
    setCurrentIndex(Math.max(0, Math.min(index, wordsLengthRef.current - 1)));
  }, []);

  const skipForward = useCallback(() => {
    setCurrentIndex((prev) => Math.min(wordsLengthRef.current - 1, prev + FORWARD_AMOUNT));
  }, []);

  const skipBackward = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - FORWARD_AMOUNT));
  }, []);

  const loadSavedSession = useCallback((): boolean => {
    const session = loadSession();
    if (!session) return false;

    const tokenizedWords = tokenize(session.text);
    if (tokenizedWords.length === 0) return false;

    wordsLengthRef.current = tokenizedWords.length;
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
          console.log(`[RSVP] Space pressed, isPlaying=${isPlaying}, isComplete=${isComplete}`);
          if (isPlaying) {
            pause();
          } else if (wordsLengthRef.current > 0 && !isComplete) {
            setIsPlaying(true);
          } else if (isComplete) {
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
  }, [isPlaying, isComplete, pause, skipBackward, skipForward]);

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
