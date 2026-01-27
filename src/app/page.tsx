'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRSVP } from '@/hooks/useRSVP';
import { useSettings } from '@/hooks/useSettings';
import { useLibrary } from '@/hooks/useLibrary';
import {
  TextInput,
  Controls,
  ReaderDisplay,
  Instructions,
  SettingsModal,
  Library,
  UrlInput,
  FileInput,
} from '@/components';
import { SavedText } from '@/types';

export default function Home() {
  const [text, setText] = useState('');
  const [showSettings, setShowSettings] = useState(false);

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
    skipForward,
    skipBackward,
  } = useRSVP();

  const { settings, updateSettings, resetSettings } = useSettings();
  const { library, saveText, deleteText } = useLibrary();

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

  const handleLoadFromLibrary = useCallback((savedText: SavedText) => {
    setText(savedText.content);
  }, []);

  const handleSaveToLibrary = useCallback(
    (title: string, content: string) => {
      saveText(title, content);
    },
    [saveText]
  );

  const handleUrlFetch = useCallback((fetchedText: string) => {
    setText(fetchedText);
  }, []);

  const handleFileLoad = useCallback((fileText: string) => {
    setText(fileText);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
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
            start(text);
          } else if (isComplete && text.trim()) {
            start(text);
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
          setWpm(Math.min(1000, wpm + 50));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setWpm(Math.max(100, wpm - 50));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isComplete, words.length, text, wpm, pause, start, skipBackward, skipForward, setWpm]);

  const hasWords = words.length > 0;
  const hasText = text.trim().length > 0;

  // Focus mode: hide UI when playing
  const isFocusMode = isPlaying && !isComplete;

  return (
    <main className="min-h-screen p-5">
      <div className="max-w-4xl mx-auto">
        {/* Header - hidden in focus mode */}
        <div
          className={`transition-opacity duration-300 motion-reduce:transition-none ${
            isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-5xl font-bold text-primary">ReadFaster</h1>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Settings"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          {/* Library */}
          <Library
            library={library}
            onLoad={handleLoadFromLibrary}
            onDelete={deleteText}
            onSave={handleSaveToLibrary}
            currentText={text}
            disabled={isPlaying}
          />

          {/* File and URL inputs */}
          <div className="flex flex-wrap gap-4 mb-4">
            <FileInput onFileLoad={handleFileLoad} disabled={isPlaying} />
            <UrlInput onFetch={handleUrlFetch} disabled={isPlaying} />
          </div>

          <TextInput value={text} onChange={setText} disabled={isPlaying} />

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
        </div>

        {/* Reader Display - always visible, enhanced in focus mode */}
        <div
          className={`transition-all duration-300 motion-reduce:transition-none ${
            isFocusMode ? 'fixed inset-0 z-40 flex items-center justify-center bg-dark p-8' : ''
          }`}
        >
          <div className={isFocusMode ? 'w-full max-w-4xl' : ''}>
            <ReaderDisplay
              word={currentWord}
              current={currentIndex}
              total={totalWords}
              progress={progress}
              isComplete={isComplete}
            />
          </div>
        </div>

        {/* Instructions - hidden in focus mode */}
        <div
          className={`transition-opacity duration-300 motion-reduce:transition-none ${
            isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <Instructions />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdate={updateSettings}
        onReset={resetSettings}
      />
    </main>
  );
}
