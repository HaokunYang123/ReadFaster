'use client';

export function Instructions() {
  const instructions = [
    'Paste your text, upload a file (TXT, PDF, ePub), or fetch from URL',
    'Adjust the reading speed using the WPM slider (100-1000 words per minute)',
    'Click "Start" to begin the RSVP reading sequence',
    'The red letter marks the Optimal Recognition Point (ORP) - keep your eyes fixed on it',
    'When paused, the reader automatically rewinds 5 words for context recovery',
    'Save texts to your library for quick access later',
  ];

  const shortcuts = [
    { key: 'Space', action: 'Play / Pause' },
    { key: '← / →', action: 'Skip backward / forward 10 words' },
    { key: '↑ / ↓', action: 'Increase / Decrease WPM by 50' },
  ];

  return (
    <div className="bg-white/5 p-5 rounded-xl mt-8">
      <h3 className="mb-4 text-xl font-semibold text-primary">How to use:</h3>
      <ul className="space-y-2 mb-6">
        {instructions.map((instruction, index) => (
          <li key={index} className="pl-6 relative">
            <span className="absolute left-0 text-primary">→</span>
            {instruction}
          </li>
        ))}
      </ul>

      <h4 className="mb-3 text-lg font-semibold text-primary">
        Keyboard Shortcuts:
      </h4>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2"
          >
            <kbd className="px-2 py-1 bg-primary/20 text-primary rounded text-sm font-mono">
              {shortcut.key}
            </kbd>
            <span className="text-sm text-white/70">{shortcut.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
