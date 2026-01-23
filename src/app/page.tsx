'use client';

import { useState, useCallback } from 'react';
import { useRSVP } from '@/hooks/useRSVP';
import {
  TextInput,
  Controls,
  ReaderDisplay,
  Instructions,
} from '@/components';

export default function Home() {
  const [text, setText] = useState('');
  const {
    currentWord,
    currentIndex,
    totalWords,
    progress,
    isPlaying,
    isComplete,
    wpm,
    start,
    pause,
    reset,
    setWpm,
    words,
  } = useRSVP();

  const handleStart = useCallback(() => {
    if (text.trim()) {
      start(text);
    }
  }, [text, start]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const handleClear = useCallback(() => {
    reset();
    setText('');
  }, [reset]);

  const hasWords = words.length > 0;
  const hasText = text.trim().length > 0;

  return (
    <main className="min-h-screen p-5">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-center mb-8 text-5xl font-bold text-primary">
          ReadFaster
        </h1>

        <TextInput
          value={text}
          onChange={setText}
          disabled={isPlaying}
        />

        <Controls
          isPlaying={isPlaying}
          hasWords={hasWords}
          hasText={hasText}
          isComplete={isComplete}
          onStart={handleStart}
          onPause={pause}
          onReset={handleReset}
          onClear={handleClear}
          wpm={wpm}
          onWpmChange={setWpm}
        />

        <ReaderDisplay
          word={currentWord}
          current={currentIndex}
          total={totalWords}
          progress={progress}
          isComplete={isComplete}
        />

        <Instructions />
      </div>
    </main>
  );
}
