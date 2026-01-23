'use client';

interface ControlsProps {
  isPlaying: boolean;
  hasWords: boolean;
  hasText: boolean;
  isComplete: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onClear: () => void;
  wpm: number;
  onWpmChange: (wpm: number) => void;
}

export function Controls({
  isPlaying,
  hasWords,
  hasText,
  isComplete,
  onStart,
  onPause,
  onReset,
  onClear,
  wpm,
  onWpmChange,
}: ControlsProps) {
  const getStartButtonText = () => {
    if (isComplete) return 'Restart';
    if (hasWords && !isPlaying) return 'Resume';
    return 'Start';
  };

  return (
    <div className="flex flex-wrap gap-5 items-center justify-center mb-8">
      {/* Speed control */}
      <div className="flex items-center gap-3">
        <label htmlFor="wpm-slider" className="text-base font-medium">
          Speed:
        </label>
        <input
          type="range"
          id="wpm-slider"
          min={100}
          max={1000}
          step={10}
          value={wpm}
          onChange={(e) => onWpmChange(parseInt(e.target.value, 10))}
          className="input-range"
        />
        <span className="min-w-[80px] text-center font-bold text-primary text-xl">
          {wpm} WPM
        </span>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-3">
        <button
          className="btn btn-primary"
          onClick={onStart}
          disabled={isPlaying || !hasText}
        >
          {getStartButtonText()}
        </button>
        <button
          className="btn btn-warning"
          onClick={onPause}
          disabled={!isPlaying}
        >
          Pause
        </button>
        <button
          className="btn btn-secondary"
          onClick={onReset}
          disabled={!hasWords && !isPlaying}
        >
          Reset
        </button>
        <button
          className="btn bg-red-600 text-white hover:bg-red-500"
          onClick={onClear}
          disabled={isPlaying || !hasText}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
