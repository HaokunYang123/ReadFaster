'use client';

import { RSVPSettings } from '@/types';

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
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-dark-lighter border-2 border-primary rounded-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
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
            <div className="flex gap-2">
              {(['monospace', 'serif', 'sans'] as const).map((font) => (
                <button
                  key={font}
                  onClick={() => onUpdate({ fontFamily: font })}
                  className={`px-4 py-2 rounded-lg capitalize transition-all ${
                    settings.fontFamily === font
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          {/* Font Weight */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Weight</label>
            <div className="flex gap-2">
              {(['normal', 'medium', 'bold'] as const).map((weight) => (
                <button
                  key={weight}
                  onClick={() => onUpdate({ fontWeight: weight })}
                  className={`px-4 py-2 rounded-lg capitalize transition-all ${
                    settings.fontWeight === weight
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {weight}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Size</label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => onUpdate({ fontSize: size })}
                  className={`px-4 py-2 rounded-lg capitalize transition-all ${
                    settings.fontSize === size
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Mode Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.focusModeEnabled}
                onChange={(e) => onUpdate({ focusModeEnabled: e.target.checked })}
                className="w-5 h-5 rounded accent-primary"
              />
              <span className="text-sm font-medium">
                Enable Focus Mode (hide UI during playback)
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onReset}
            className="btn bg-gray-600 text-white hover:bg-gray-500 flex-1"
          >
            Reset to Defaults
          </button>
          <button onClick={onClose} className="btn btn-primary flex-1">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
