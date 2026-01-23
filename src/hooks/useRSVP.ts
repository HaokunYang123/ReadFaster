'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { tokenize, wpmToInterval, calculatePivotIndex } from '@/utils/rsvp';

const REWIND_AMOUNT = 5; // Words to rewind on pause

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
}

export function useRSVP(): UseRSVPReturn {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpmState] = useState(300);
  const [isComplete, setIsComplete] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wordsRef = useRef<string[]>([]);
  const indexRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    const interval = wpmToInterval(wpm);

    intervalRef.current = setInterval(() => {
      if (indexRef.current < wordsRef.current.length) {
        setCurrentIndex((prev) => prev + 1);
        indexRef.current += 1;
      } else {
        stopInterval();
        setIsPlaying(false);
        setIsComplete(true);
      }
    }, interval);
  }, [wpm, stopInterval]);

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
      }

      setIsPlaying(true);
      startInterval();
    },
    [words.length, isComplete, startInterval]
  );

  const pause = useCallback(() => {
    setIsPlaying(false);
    stopInterval();

    // Rewind 5 words for context recovery
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
          }
        }, interval);
      }
    },
    [isPlaying, stopInterval]
  );

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
  };
}
