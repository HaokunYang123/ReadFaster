'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { splitWordByPivot } from '@/utils/rsvp';

interface WordDisplayProps {
  word: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onPause?: () => void;
}

export function WordDisplay({ word, containerRef, onPause }: WordDisplayProps) {
  const [offset, setOffset] = useState<number | null>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!word || !containerRef.current) {
      setOffset(null);
      return;
    }

    const { before, pivotIndex } = splitWordByPivot(word);
    const containerWidth = containerRef.current.offsetWidth;
    const containerCenter = containerWidth / 2;

    // Create temporary span to measure
    const measureSpan = document.createElement('span');
    measureSpan.style.cssText = `
      font-family: 'Courier New', monospace;
      font-size: 48px;
      font-weight: 500;
      position: absolute;
      visibility: hidden;
      white-space: nowrap;
    `;

    // Measure text before pivot
    measureSpan.textContent = before;
    document.body.appendChild(measureSpan);
    const beforeWidth = measureSpan.offsetWidth;

    // Measure pivot character
    measureSpan.textContent = word.charAt(pivotIndex);
    const pivotWidth = measureSpan.offsetWidth;

    document.body.removeChild(measureSpan);

    // Calculate offset to center pivot
    const newOffset = containerCenter - beforeWidth - pivotWidth / 2;
    setOffset(newOffset);
  }, [word, containerRef]);

  const handleClick = useCallback(() => {
    if (onPause) {
      onPause();
    }
  }, [onPause]);

  if (!word) {
    return (
      <div
        className="word-display text-white/40 text-2xl cursor-pointer"
        style={{ left: '50%', transform: 'translateX(-50%)' }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        Ready to read
      </div>
    );
  }

  const { before, pivot, after } = splitWordByPivot(word);

  return (
    <div
      className="word-display cursor-pointer"
      style={{
        left: offset !== null ? `${offset}px` : '50%',
        transform: offset === null ? 'translateX(-50%)' : 'none',
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <span className="before-pivot">{before}</span>
      <span className="pivot">{pivot}</span>
      <span className="after-pivot">{after}</span>
    </div>
  );
}
