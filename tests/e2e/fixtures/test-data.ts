/**
 * Test data fixtures for E2E tests
 */

/**
 * Short sample text for quick tests
 */
export const SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog';

/**
 * Medium text for testing progress and timing
 */
export const MEDIUM_TEXT = 'The quick brown fox jumps over the lazy dog while the cat watches from the windowsill';

/**
 * Long text (50+ words) for complete reading flow tests
 */
export const LONG_TEXT = `The art of reading faster is not just about speed, but about comprehension and focus.
By training your eyes to focus on one word at a time, centered on a pivot letter, you can
significantly improve your reading efficiency. The brain processes visual information in
chunks, and RSVP reading leverages this by presenting words in rapid succession at a fixed
point. This eliminates the saccadic eye movements that typically slow down traditional reading.
With practice, readers can achieve speeds of 500 words per minute or more while maintaining
excellent comprehension of the material.`;

/**
 * Simple text for basic tests
 */
export const MULTI_LANGUAGE_TEXT = 'Hello world';

/**
 * Text with special characters for edge cases
 */
export const SPECIAL_CHARS_TEXT = "It's a test! What about \"quotes\" and (parentheses)?";

/**
 * Single word text
 */
export const SINGLE_WORD = 'Hello';

/**
 * Two word text for minimal multi-word testing
 */
export const TWO_WORDS = 'Hello World';

/**
 * Numbers and punctuation
 */
export const MIXED_CONTENT = 'In 2024, over 1,000,000 users tried RSVP reading.';

/**
 * Expected word counts for verification
 */
export const WORD_COUNTS = {
  SAMPLE_TEXT: 9,
  MEDIUM_TEXT: 16,
  LONG_TEXT: 96,
  MULTI_LANGUAGE_TEXT: 2,
  SPECIAL_CHARS_TEXT: 7,
  SINGLE_WORD: 1,
  TWO_WORDS: 2,
  MIXED_CONTENT: 8,
} as const;

/**
 * Test settings configurations
 */
export const TEST_SETTINGS = {
  /** Default settings */
  default: {
    fontFamily: 'monospace',
    fontWeight: 'normal',
    fontSize: 'medium',
    showPivotHighlight: true,
    pivotColor: '#FF0000',
  },
  /** Alternative settings for testing changes */
  alternative: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    fontSize: 'large',
    showPivotHighlight: true,
    pivotColor: '#0099FF',
  },
  /** Minimal settings (no pivot highlight) */
  minimal: {
    fontFamily: 'sans',
    fontWeight: 'normal',
    fontSize: 'small',
    showPivotHighlight: false,
    pivotColor: '#FF0000',
  },
} as const;

/**
 * Available pivot colors for testing
 */
export const PIVOT_COLORS = [
  '#FF0000', // Red (default)
  '#FF6B00', // Orange
  '#FFD700', // Gold
  '#00FF00', // Lime Green
  '#0099FF', // Sky Blue
  '#9D00FF', // Purple
] as const;

/**
 * WPM test values
 */
export const WPM_VALUES = {
  MIN: 100,
  DEFAULT: 300,
  MAX: 1000,
  SLOW: 150,
  FAST: 600,
} as const;

/**
 * Library test data
 */
export const LIBRARY_ENTRIES = [
  {
    title: 'Test Article 1',
    content: SAMPLE_TEXT,
  },
  {
    title: 'Long Reading Material',
    content: LONG_TEXT,
  },
  {
    title: 'Quick Note',
    content: TWO_WORDS,
  },
] as const;
