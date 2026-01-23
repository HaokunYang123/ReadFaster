'use client';

export function Instructions() {
  const instructions = [
    'Paste your text in the input area above',
    'Adjust the reading speed using the WPM slider (100-1000 words per minute)',
    'Click "Start" to begin the RSVP reading sequence',
    'The red letter marks the Optimal Recognition Point (ORP) - keep your eyes fixed on it',
    'When paused, the reader automatically rewinds 5 words for context recovery',
  ];

  return (
    <div className="bg-white/5 p-5 rounded-xl mt-8">
      <h3 className="mb-4 text-xl font-semibold text-primary">How to use:</h3>
      <ul className="space-y-2">
        {instructions.map((instruction, index) => (
          <li key={index} className="pl-6 relative">
            <span className="absolute left-0 text-primary">→</span>
            {instruction}
          </li>
        ))}
      </ul>
    </div>
  );
}
