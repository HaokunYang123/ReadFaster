export interface RSVPState {
  words: string[];
  currentIndex: number;
  isPlaying: boolean;
  wpm: number;
  totalWords: number;
}

export interface WordDisplayProps {
  word: string;
  pivotIndex: number;
}

export interface ControlsProps {
  isPlaying: boolean;
  hasWords: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  wpm: number;
  onWpmChange: (wpm: number) => void;
}

export interface ProgressProps {
  current: number;
  total: number;
}

export interface ReaderDisplayProps {
  word: string;
  pivotIndex: number;
  current: number;
  total: number;
}

// Settings types
export interface RSVPSettings {
  fontFamily: 'monospace' | 'serif' | 'sans';
  fontWeight: 'normal' | 'medium' | 'bold';
  fontSize: 'small' | 'medium' | 'large';
  focusModeEnabled: boolean;
}

export const DEFAULT_SETTINGS: RSVPSettings = {
  fontFamily: 'monospace',
  fontWeight: 'medium',
  fontSize: 'medium',
  focusModeEnabled: false,
};

// Library types
export interface SavedText {
  id: string;
  title: string;
  content: string;
  savedAt: number;
  lastPosition: number;
  wordCount: number;
}

// Session persistence
export interface SavedSession {
  text: string;
  currentIndex: number;
  wpm: number;
  savedAt: number;
}

// Word timing info for dynamic delays
export interface WordTiming {
  word: string;
  delayMultiplier: number;
}
