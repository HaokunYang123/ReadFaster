'use client';

import { useState } from 'react';
import { SavedText } from '@/types';

interface LibraryProps {
  library: SavedText[];
  onLoad: (text: SavedText) => void;
  onDelete: (id: string) => void;
  onSave: (title: string, content: string) => void;
  currentText: string;
  disabled: boolean;
}

export function Library({
  library,
  onLoad,
  onDelete,
  onSave,
  currentText,
  disabled,
}: LibraryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSave = () => {
    if (saveTitle.trim() && currentText.trim()) {
      onSave(saveTitle.trim(), currentText);
      setSaveTitle('');
      setShowSaveForm(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-white/70 hover:text-white mb-2"
      >
        <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
          ▶
        </span>
        <span>Library ({library.length})</span>
      </button>

      {isExpanded && (
        <div className="bg-white/5 rounded-xl p-4">
          {/* Save current text */}
          {currentText.trim() && !disabled && (
            <div className="mb-4">
              {showSaveForm ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    placeholder="Enter title..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                  <button
                    onClick={handleSave}
                    className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-light"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSaveForm(false)}
                    className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="text-primary hover:text-primary-light text-sm"
                >
                  + Save current text to library
                </button>
              )}
            </div>
          )}

          {/* Library items */}
          {library.length === 0 ? (
            <p className="text-white/40 text-sm">No saved texts yet</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {library.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.title}</p>
                    <p className="text-white/40 text-xs">
                      {item.wordCount} words · {formatDate(item.savedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => onLoad(item)}
                      disabled={disabled}
                      className="px-3 py-1 bg-primary/20 text-primary rounded text-sm hover:bg-primary/30 disabled:opacity-50"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      disabled={disabled}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
