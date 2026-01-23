'use client';

import { useRef } from 'react';
import { WordDisplay } from './WordDisplay';
import { RSVPSettings } from '@/types';

interface ReaderDisplayProps {
  word: string;
  current: number;
  total: number;
  progress: number;
  isComplete: boolean;
  settings?: RSVPSettings;
}

export function ReaderDisplay({
  word,
  current,
  total,
  progress,
  isComplete,
  settings,
}: ReaderDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-black/40 border-3 border-primary rounded-2xl p-12 mb-8 relative overflow-hidden">
      {/* Reader container with center line */}
      <div
        ref={containerRef}
        className="relative h-20 flex items-center justify-center"
      >
        {/* Center line indicator */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-primary/30 -translate-x-1/2 z-[1]" />

        {/* Word display */}
        {isComplete ? (
          <div
            className="word-display text-white/40 text-2xl"
            style={{ left: '50%', transform: 'translateX(-50%)' }}
          >
            Complete!
          </div>
        ) : (
          <WordDisplay
            word={word}
            containerRef={containerRef}
            settings={settings}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="flex justify-between items-center px-5 py-2.5 bg-white/5 rounded-lg mt-4 text-sm">
        <span>
          Word:{' '}
          <span className="font-semibold text-primary">
            {total > 0 ? current + 1 : 0}
          </span>{' '}
          / <span>{total}</span>
        </span>
        <span>
          Progress: <span className="font-semibold text-primary">{progress}</span>
          %
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-5">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
