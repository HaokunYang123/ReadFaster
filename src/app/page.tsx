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
  const [showSessionPrompt, setShowSessionPrompt] = useState(false);

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
    hasSavedSession,
    loadSavedSession,
  } = useRSVP();

  const { settings, updateSettings, resetSettings } = useSettings();
  const { library, saveText, deleteText } = useLibrary();

  // Check for saved session on mount
  useEffect(() => {
    if (hasSavedSession) {
      setShowSessionPrompt(true);
    }
  }, [hasSavedSession]);

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

  const handleLoadFromLibrary = useCallback(
    (savedText: SavedText) => {
      setText(savedText.content);
      // If there's a saved position, we could potentially start from there
    },
    []
  );

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

  const handleResumeSession = useCallback(() => {
    const loaded = loadSavedSession();
    if (loaded) {
      // Text is restored via the hook
      setShowSessionPrompt(false);
    }
  }, [loadSavedSession]);

  const handleDismissSession = useCallback(() => {
    setShowSessionPrompt(false);
  }, []);

  const hasWords = words.length > 0;
  const hasText = text.trim().length > 0;

  // Focus mode: hide UI when playing
  const isFocusMode = isPlaying && settings.focusModeEnabled;

  return (
    <main className="min-h-screen p-5">
      <div className="max-w-4xl mx-auto">
        {/* Header - hidden in focus mode */}
        <div
          className={`transition-opacity duration-300 ${
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

          {/* Session restore prompt */}
          {showSessionPrompt && (
            <div className="mb-6 p-4 bg-primary/20 border border-primary/50 rounded-xl flex items-center justify-between">
              <p className="text-white">
                You have an unfinished reading session. Would you like to continue?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResumeSession}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
                >
                  Resume
                </button>
                <button
                  onClick={handleDismissSession}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          )}

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
          className={`transition-all duration-300 ${
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
              settings={settings}
            />

            {/* Exit focus mode hint */}
            {isFocusMode && (
              <p className="text-center text-white/40 text-sm mt-4">
                Press <kbd className="px-2 py-1 bg-white/10 rounded">Space</kbd> to
                pause and exit focus mode
              </p>
            )}
          </div>
        </div>

        {/* Instructions - hidden in focus mode */}
        <div
          className={`transition-opacity duration-300 ${
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
