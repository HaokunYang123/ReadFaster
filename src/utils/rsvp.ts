/**
 * RSVP (Rapid Serial Visual Presentation) utility functions
 */

// ORP (Optimal Recognition Point) position - approximately 35% into the word
const ORP_POSITION = 0.35;

/**
 * Tokenize input text into an array of individual words
 * Handles multiple spaces, newlines, and filters empty strings
 */
export function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

/**
 * Calculate the Optimal Recognition Point (ORP) pivot index
 * The pivot is approximately 35% into the word
 */
export function calculatePivotIndex(word: string): number {
  const length = word.length;

  if (length === 0) return 0;
  if (length === 1) return 0;
  if (length === 2) return 0;
  if (length === 3) return 1;

  // For longer words, calculate 35% position
  const pivotPosition = Math.floor(length * ORP_POSITION);

  // Ensure pivot is at least at index 1 for words > 2 chars
  return Math.max(1, Math.min(pivotPosition, length - 1));
}

/**
 * Convert WPM (Words Per Minute) to millisecond interval
 * e.g., 600 WPM = 60/600 * 1000 = 100ms per word = 10 words/second
 */
export function wpmToInterval(wpm: number): number {
  return (60 / wpm) * 1000;
}

/**
 * Split a word into parts for ORP display
 */
export function splitWordByPivot(word: string): {
  before: string;
  pivot: string;
  after: string;
  pivotIndex: number;
} {
  const pivotIndex = calculatePivotIndex(word);

  return {
    before: word.substring(0, pivotIndex),
    pivot: word.charAt(pivotIndex),
    after: word.substring(pivotIndex + 1),
    pivotIndex,
  };
}

/**
 * Calculate the left offset to center the pivot character
 */
export function calculatePivotOffset(
  containerWidth: number,
  charWidth: number,
  pivotIndex: number
): number {
  const containerCenter = containerWidth / 2;
  const beforeWidth = pivotIndex * charWidth;
  const pivotHalfWidth = charWidth / 2;

  return containerCenter - beforeWidth - pivotHalfWidth;
}
