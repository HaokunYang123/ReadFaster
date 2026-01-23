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
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleSave = () => {
    if (currentText.trim()) {
      onSave(saveTitle.trim(), currentText);
      setSaveTitle('');
      setShowSaveInput(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
        >
          <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
          <span className="font-medium">Library ({library.length})</span>
        </button>

        {currentText.trim() && !disabled && (
          <>
            {showSaveInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="px-3 py-1.5 bg-white/10 border border-primary/50 rounded-lg text-sm focus:outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-light"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveInput(false);
                    setSaveTitle('');
                  }}
                  className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSaveInput(true)}
                className="px-3 py-1.5 bg-primary/20 text-primary text-sm rounded-lg hover:bg-primary/30 transition-colors"
              >
                + Save Current Text
              </button>
            )}
          </>
        )}
      </div>

      {isExpanded && (
        <div className="bg-white/5 rounded-xl p-4 space-y-2 max-h-64 overflow-y-auto">
          {library.length === 0 ? (
            <p className="text-white/50 text-sm text-center py-4">
              No saved texts yet. Save texts to read them later.
            </p>
          ) : (
            library.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => !disabled && onLoad(item)}
                >
                  <h4 className="font-medium text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-white/50">
                    {item.wordCount} words &bull; Saved {formatDate(item.savedAt)}
                    {item.lastPosition > 0 && (
                      <span className="text-primary">
                        {' '}
                        &bull; {Math.round((item.lastPosition / item.wordCount) * 100)}%
                        read
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => onDelete(item.id)}
                  className="ml-3 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                  title="Delete"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
