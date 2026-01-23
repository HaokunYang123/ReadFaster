'use client';

import { useRef, useEffect, useState } from 'react';
import { splitWordByPivot } from '@/utils/rsvp';
import { RSVPSettings } from '@/types';

interface WordDisplayProps {
  word: string;
  containerRef: React.RefObject<HTMLDivElement>;
  settings?: RSVPSettings;
}

const fontFamilyMap = {
  monospace: "'Courier New', monospace",
  serif: 'Georgia, serif',
  sans: 'Inter, system-ui, sans-serif',
};

const fontWeightMap = {
  normal: 400,
  medium: 500,
  bold: 700,
};

const fontSizeMap = {
  small: 36,
  medium: 48,
  large: 64,
};

export function WordDisplay({ word, containerRef, settings }: WordDisplayProps) {
  const [offset, setOffset] = useState<number | null>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const fontFamily = settings?.fontFamily
    ? fontFamilyMap[settings.fontFamily]
    : fontFamilyMap.monospace;
  const fontWeight = settings?.fontWeight
    ? fontWeightMap[settings.fontWeight]
    : fontWeightMap.medium;
  const fontSize = settings?.fontSize
    ? fontSizeMap[settings.fontSize]
    : fontSizeMap.medium;

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
      font-family: ${fontFamily};
      font-size: ${fontSize}px;
      font-weight: ${fontWeight};
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
  }, [word, containerRef, fontFamily, fontSize, fontWeight]);

  const style = {
    fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight,
  };

  if (!word) {
    return (
      <div
        className="word-display text-white/40"
        style={{
          ...style,
          fontSize: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        Ready to read
      </div>
    );
  }

  const { before, pivot, after } = splitWordByPivot(word);

  return (
    <div
      className="word-display"
      style={{
        ...style,
        left: offset !== null ? `${offset}px` : '50%',
        transform: offset === null ? 'translateX(-50%)' : 'none',
      }}
    >
      <span className="before-pivot">{before}</span>
      <span className="pivot">{pivot}</span>
      <span className="after-pivot">{after}</span>
    </div>
  );
}
