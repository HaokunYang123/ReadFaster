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
