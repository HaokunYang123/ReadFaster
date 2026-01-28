'use client';

import { RSVPSettings, DEFAULT_SETTINGS } from '@/types';

const PRESET_COLORS = [
  '#FF0000', // Red (default)
  '#FF6B00', // Orange
  '#FFD700', // Gold
  '#00FF00', // Lime Green
  '#0099FF', // Sky Blue
  '#9D00FF', // Purple
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RSVPSettings;
  onUpdate: (partial: Partial<RSVPSettings>) => void;
  onReset: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdate,
  onReset,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-dark border border-white/20 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Settings</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="space-y-6">
          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Family</label>
            <select
              value={settings.fontFamily}
              onChange={(e) => onUpdate({ fontFamily: e.target.value as RSVPSettings['fontFamily'] })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="monospace">Monospace</option>
              <option value="serif">Serif</option>
              <option value="sans">Sans-serif</option>
            </select>
          </div>

          {/* Font Weight */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Weight</label>
            <select
              value={settings.fontWeight}
              onChange={(e) => onUpdate({ fontWeight: e.target.value as RSVPSettings['fontWeight'] })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="normal">Normal</option>
              <option value="medium">Medium</option>
              <option value="bold">Bold</option>
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Size</label>
            <select
              value={settings.fontSize}
              onChange={(e) => onUpdate({ fontSize: e.target.value as RSVPSettings['fontSize'] })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Pivot Highlight */}
          <div>
            <label className="block text-sm font-medium mb-3">Pivot Highlight</label>

            {/* Toggle Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={settings.showPivotHighlight}
                onChange={(e) => onUpdate({ showPivotHighlight: e.target.checked })}
                className="w-4 h-4 accent-primary rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-sm">Show pivot highlight</span>
            </label>

            {/* Color Swatches */}
            <div className="flex gap-2 mb-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onUpdate({ pivotColor: color })}
                  disabled={!settings.showPivotHighlight}
                  className={`relative w-10 h-10 rounded-lg border-2 transition-all ${
                    !settings.showPivotHighlight
                      ? 'opacity-40 cursor-not-allowed'
                      : 'cursor-pointer hover:scale-110'
                  } ${
                    settings.pivotColor === color
                      ? 'border-white'
                      : 'border-white/20'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {settings.pivotColor === color && settings.showPivotHighlight && (
                    <svg
                      className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-lg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Reset Button - Only shown when not default color */}
            {settings.pivotColor !== DEFAULT_SETTINGS.pivotColor && (
              <button
                onClick={() => onUpdate({ pivotColor: DEFAULT_SETTINGS.pivotColor })}
                className="text-sm text-white/60 hover:text-white underline mb-3"
              >
                Reset to default
              </button>
            )}

            {/* Inline Preview */}
            <div className="bg-black/40 border border-white/20 rounded-lg p-4 flex justify-center">
              <div
                className="text-center"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '32px',
                  fontWeight: 500,
                }}
              >
                <span style={{ color: '#ffffff' }}>Read</span>
                <span
                  style={{
                    color: settings.showPivotHighlight ? settings.pivotColor : '#ffffff',
                    fontWeight: settings.showPivotHighlight ? 'bold' : 500,
                  }}
                >
                  F
                </span>
                <span style={{ color: '#ffffff' }}>aster</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
