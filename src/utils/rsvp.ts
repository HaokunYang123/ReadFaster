/**
 * RSVP (Rapid Serial Visual Presentation) utility functions
 */

// ORP (Optimal Recognition Point) position - approximately 35% into the word
const ORP_POSITION = 0.35;

// Punctuation delay multipliers
const SENTENCE_END_MULTIPLIER = 2.0; // ., ?, !
const CLAUSE_END_MULTIPLIER = 1.5;   // , ; :
const LONG_WORD_THRESHOLD = 10;
const LONG_WORD_EXTRA_MS_PER_CHAR = 10; // Extra ms per character over threshold

/**
 * Tokenize input text into an array of individual words
 * Handles multiple spaces, newlines, hyphenated words, and filters empty strings
 */
export function tokenize(text: string): string[] {
  // First, normalize the text
  let normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Split by whitespace
  const rawTokens = normalized.split(/\s+/).filter((word) => word.length > 0);

  const tokens: string[] = [];

  for (const token of rawTokens) {
    // Handle hyphenated words - split very long hyphenated compounds
    if (token.includes('-') && token.length > 15) {
      const parts = splitHyphenatedWord(token);
      tokens.push(...parts);
    } else {
      tokens.push(token);
    }
  }

  return tokens;
}

/**
 * Split long hyphenated words into manageable chunks
 * e.g., "state-of-the-art" -> ["state-of-", "the-art"]
 */
function splitHyphenatedWord(word: string): string[] {
  const parts = word.split('-');

  // If only 2 parts or each part is short, keep as-is
  if (parts.length <= 2 || parts.every(p => p.length <= 5)) {
    return [word];
  }

  // Group into chunks of 2-3 parts
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    currentChunk.push(part);
    currentLength += part.length;

    // Create a chunk if we've accumulated enough length or it's the last part
    if (currentLength >= 8 || i === parts.length - 1) {
      const chunkStr = currentChunk.join('-');
      // Add hyphen at end if not the last chunk
      if (i < parts.length - 1) {
        chunks.push(chunkStr + '-');
      } else {
        chunks.push(chunkStr);
      }
      currentChunk = [];
      currentLength = 0;
    }
  }

  return chunks.length > 0 ? chunks : [word];
}

/**
 * Calculate the delay multiplier for a word based on punctuation and length
 */
export function getWordDelayMultiplier(word: string): number {
  let multiplier = 1.0;

  // Check for sentence-ending punctuation
  if (/[.!?]$/.test(word) || /[.!?]["')]$/.test(word)) {
    multiplier = SENTENCE_END_MULTIPLIER;
  }
  // Check for clause-ending punctuation
  else if (/[,;:]$/.test(word) || /[,;:]["')]$/.test(word)) {
    multiplier = CLAUSE_END_MULTIPLIER;
  }

  return multiplier;
}

/**
 * Calculate extra delay in ms for long words
 */
export function getLongWordExtraDelay(word: string): number {
  // Remove punctuation for length calculation
  const cleanWord = word.replace(/[^a-zA-Z0-9-]/g, '');

  if (cleanWord.length > LONG_WORD_THRESHOLD) {
    const extraChars = cleanWord.length - LONG_WORD_THRESHOLD;
    return extraChars * LONG_WORD_EXTRA_MS_PER_CHAR;
  }

  return 0;
}

/**
 * Calculate the Optimal Recognition Point (ORP) pivot index
 * The pivot is approximately 35% into the word
 */
export function calculatePivotIndex(word: string): number {
  // Strip punctuation from the start/end for pivot calculation
  const match = word.match(/^[^a-zA-Z0-9]*(.+?)[^a-zA-Z0-9]*$/);
  const coreWord = match ? match[1] : word;
  const startOffset = match ? word.indexOf(coreWord) : 0;

  const length = coreWord.length;

  if (length === 0) return 0;
  if (length === 1) return startOffset;
  if (length === 2) return startOffset;
  if (length === 3) return startOffset + 1;

  // For longer words, calculate 35% position
  const pivotPosition = Math.floor(length * ORP_POSITION);

  // Ensure pivot is at least at index 1 for words > 2 chars
  return startOffset + Math.max(1, Math.min(pivotPosition, length - 1));
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
