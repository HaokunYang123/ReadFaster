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

          {/* Focus Mode */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Focus Mode</label>
            <button
              onClick={() => onUpdate({ focusModeEnabled: !settings.focusModeEnabled })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.focusModeEnabled ? 'bg-primary' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.focusModeEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
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
