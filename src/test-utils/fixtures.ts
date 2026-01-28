/**
 * Unicode test corpus for multi-language testing
 *
 * IMPORTANT: JavaScript's .length counts UTF-16 code units, not characters.
 * Emoji and some CJK characters use surrogate pairs (2 code units).
 * Example: '👋'.length === 2, '日'.length === 1
 */

// Chinese, Japanese, Korean characters
export const CJK_WORDS = [
  '日本語',      // Japanese
  '한국어',      // Korean
  '中文',        // Chinese
  '漢字',        // Kanji/Hanja
  'ひらがな',    // Hiragana
  'カタカナ',    // Katakana
]

// Right-to-left languages (Arabic, Hebrew)
export const RTL_WORDS = [
  'مرحبا',       // Arabic: Hello
  'שלום',        // Hebrew: Hello
  'العربية',    // Arabic: Arabic language
  'עברית',       // Hebrew: Hebrew language
]

// Emoji including surrogate pairs (multi-code-unit characters)
export const EMOJI_WORDS = [
  '👋',          // Waving hand (2 code units)
  '👨‍👩‍👧‍👦',         // Family emoji (11 code units with ZWJ)
  '🎉',          // Party popper (2 code units)
  '❤️',          // Red heart (2 code units with variation selector)
  '🇺🇸',         // US flag (4 code units - regional indicators)
  '👍🏽',         // Thumbs up with skin tone (4 code units)
]

// Accented Latin characters
export const ACCENTED_WORDS = [
  'café',        // French
  'naïve',       // French
  'résumé',      // French
  'Zürich',      // German
  'señor',       // Spanish
  'São',         // Portuguese (single word to avoid space issues)
]

// Edge case strings for boundary testing
export const EDGE_CASE_STRINGS = {
  empty: '',
  singleChar: 'a',
  longWord: 'a'.repeat(100),  // 100 character word
  whitespaceOnly: '   ',
  tabs: '\t\t\t',
  newlines: '\n\n\n',
  mixed: '  word  \n\t  ',
}
