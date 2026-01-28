import { describe, it, expect } from 'vitest'
import {
  tokenize,
  calculatePivotIndex,
  wpmToInterval,
  splitWordByPivot,
  calculatePivotOffset,
} from './rsvp'
import {
  CJK_WORDS,
  RTL_WORDS,
  EMOJI_WORDS,
  ACCENTED_WORDS,
  EDGE_CASE_STRINGS,
} from '@/test-utils/fixtures'

describe('tokenize', () => {
  describe('whitespace handling', () => {
    it('returns empty array for empty string', () => {
      expect(tokenize('')).toEqual([])
    })

    it('returns empty array for whitespace-only string', () => {
      expect(tokenize('   ')).toEqual([])
      expect(tokenize('\t\t')).toEqual([])
      expect(tokenize('\n\n')).toEqual([])
    })

    it('splits on single spaces', () => {
      expect(tokenize('hello world')).toEqual(['hello', 'world'])
    })

    it('handles multiple consecutive spaces', () => {
      expect(tokenize('hello    world')).toEqual(['hello', 'world'])
    })

    it('handles tabs', () => {
      expect(tokenize('hello\tworld')).toEqual(['hello', 'world'])
    })

    it('handles newlines', () => {
      expect(tokenize('hello\nworld')).toEqual(['hello', 'world'])
    })

    it('handles mixed whitespace', () => {
      expect(tokenize(' \n\t hello \t\n world \n ')).toEqual(['hello', 'world'])
    })

    it('preserves punctuation attached to words', () => {
      expect(tokenize('hello, world!')).toEqual(['hello,', 'world!'])
    })
  })

  describe('multi-language text', () => {
    it('tokenizes CJK text', () => {
      const text = CJK_WORDS.join(' ')
      const tokens = tokenize(text)
      expect(tokens).toEqual(CJK_WORDS)
    })

    it('tokenizes RTL text', () => {
      const text = RTL_WORDS.join(' ')
      const tokens = tokenize(text)
      expect(tokens).toEqual(RTL_WORDS)
    })

    it('tokenizes emoji', () => {
      const text = EMOJI_WORDS.join(' ')
      const tokens = tokenize(text)
      expect(tokens).toEqual(EMOJI_WORDS)
    })

    it('tokenizes accented characters', () => {
      const text = ACCENTED_WORDS.join(' ')
      const tokens = tokenize(text)
      expect(tokens).toEqual(ACCENTED_WORDS)
    })

    it('handles mixed language text', () => {
      expect(tokenize('hello 日本語 world')).toEqual(['hello', '日本語', 'world'])
    })
  })

  describe('edge cases', () => {
    it('handles single word with no spaces', () => {
      expect(tokenize('hello')).toEqual(['hello'])
    })

    it('handles very long text (10k+ words)', () => {
      // Generate 10,000 words
      const words = Array.from({ length: 10000 }, (_, i) => `word${i}`)
      const text = words.join(' ')
      const tokens = tokenize(text)

      expect(tokens).toHaveLength(10000)
      expect(tokens[0]).toBe('word0')
      expect(tokens[9999]).toBe('word9999')
    })
  })
})

describe('calculatePivotIndex', () => {
  describe('standard words', () => {
    it('returns 0 for empty string', () => {
      expect(calculatePivotIndex('')).toBe(0)
    })

    it('returns 0 for single character', () => {
      expect(calculatePivotIndex('a')).toBe(0)
    })

    it('returns 0 for two characters', () => {
      expect(calculatePivotIndex('ab')).toBe(0)
    })

    it('returns 1 for three characters', () => {
      expect(calculatePivotIndex('abc')).toBe(1)
    })

    it('calculates 35% position for 4+ char words', () => {
      expect(calculatePivotIndex('four')).toBe(1) // 4 * 0.35 = 1.4 -> 1
      expect(calculatePivotIndex('hello')).toBe(1) // 5 * 0.35 = 1.75 -> 1
      expect(calculatePivotIndex('testing')).toBe(2) // 7 * 0.35 = 2.45 -> 2
    })

    it('handles 10 character word', () => {
      expect(calculatePivotIndex('abcdefghij')).toBe(3) // 10 * 0.35 = 3.5 -> 3
    })

    it('handles 20+ character word', () => {
      const word20 = 'a'.repeat(20)
      expect(calculatePivotIndex(word20)).toBe(7) // 20 * 0.35 = 7

      const word30 = 'a'.repeat(30)
      expect(calculatePivotIndex(word30)).toBe(10) // 30 * 0.35 = 10.5 -> 10
    })
  })

  describe('CJK characters', () => {
    it('calculates pivot for Chinese characters', () => {
      expect(calculatePivotIndex('日本語')).toBe(1) // 3 chars -> 1
    })

    it('calculates pivot for Korean characters', () => {
      expect(calculatePivotIndex('한국어')).toBe(1) // 3 chars -> 1
    })

    it('calculates pivot for Japanese hiragana', () => {
      expect(calculatePivotIndex('ひらがな')).toBe(1) // 4 chars -> floor(4*0.35) = 1
    })
  })

  describe('emoji and surrogate pairs', () => {
    it('documents emoji .length behavior', () => {
      // Emoji use surrogate pairs - each emoji is 2 code units
      expect('👋'.length).toBe(2)
    })

    it('returns 0 for single emoji (length=2)', () => {
      expect(calculatePivotIndex('👋')).toBe(0) // length=2 -> 0
    })

    it('handles emoji sequence', () => {
      const familyEmoji = '👨‍👩‍👧‍👦' // 11 code units with ZWJ
      const pivotIndex = calculatePivotIndex(familyEmoji)
      // Verify it returns valid index within bounds
      expect(pivotIndex).toBeGreaterThanOrEqual(0)
      expect(pivotIndex).toBeLessThan(familyEmoji.length)
    })

    it('handles emoji in word context', () => {
      const word = 'hi👋' // length = 4 (2 + 2)
      expect(calculatePivotIndex(word)).toBe(1) // floor(4 * 0.35) = 1
    })
  })

  describe('RTL and accented', () => {
    it('handles RTL Arabic text', () => {
      const arabic = 'مرحبا' // 5 characters
      const pivotIndex = calculatePivotIndex(arabic)
      expect(pivotIndex).toBeGreaterThanOrEqual(0)
      expect(pivotIndex).toBeLessThan(arabic.length)
    })

    it('handles accented characters', () => {
      expect(calculatePivotIndex('café')).toBe(1) // 4 chars -> 1
    })
  })
})

describe('wpmToInterval', () => {
  it('converts 600 WPM to 100ms', () => {
    expect(wpmToInterval(600)).toBe(100)
  })

  it('converts 300 WPM to 200ms', () => {
    expect(wpmToInterval(300)).toBe(200)
  })

  it('converts boundary 100 WPM to 600ms', () => {
    expect(wpmToInterval(100)).toBe(600)
  })

  it('converts boundary 1000 WPM to 60ms', () => {
    expect(wpmToInterval(1000)).toBe(60)
  })

  it('handles 1 WPM', () => {
    expect(wpmToInterval(1)).toBe(60000)
  })
})

describe('splitWordByPivot', () => {
  describe('standard words', () => {
    it('splits empty string correctly', () => {
      expect(splitWordByPivot('')).toEqual({
        before: '',
        pivot: '',
        after: '',
        pivotIndex: 0,
      })
    })

    it('splits single character', () => {
      expect(splitWordByPivot('a')).toEqual({
        before: '',
        pivot: 'a',
        after: '',
        pivotIndex: 0,
      })
    })

    it('splits two characters', () => {
      expect(splitWordByPivot('ab')).toEqual({
        before: '',
        pivot: 'a',
        after: 'b',
        pivotIndex: 0,
      })
    })

    it('splits three characters', () => {
      expect(splitWordByPivot('abc')).toEqual({
        before: 'a',
        pivot: 'b',
        after: 'c',
        pivotIndex: 1,
      })
    })

    it('splits five character word', () => {
      expect(splitWordByPivot('hello')).toEqual({
        before: 'h',
        pivot: 'e',
        after: 'llo',
        pivotIndex: 1,
      })
    })
  })

  describe('multi-language', () => {
    it('splits CJK word', () => {
      const result = splitWordByPivot('日本語')
      expect(result).toEqual({
        before: '日',
        pivot: '本',
        after: '語',
        pivotIndex: 1,
      })
    })

    it('splits accented word', () => {
      const result = splitWordByPivot('café')
      expect(result).toEqual({
        before: 'c',
        pivot: 'a',
        after: 'fé',
        pivotIndex: 1,
      })
    })

    it('splits RTL word', () => {
      // Verify mathematical correctness (visual rendering is Phase 4)
      const arabic = 'مرحبا' // 5 chars
      const result = splitWordByPivot(arabic)
      expect(result.pivotIndex).toBeGreaterThanOrEqual(0)
      expect(result.pivotIndex).toBeLessThan(arabic.length)
      expect(result.before.length + 1 + result.after.length).toBe(arabic.length)
    })
  })

  describe('edge cases', () => {
    it('handles very long word (100+ chars)', () => {
      const longWord = 'a'.repeat(100)
      const result = splitWordByPivot(longWord)

      // Verify no crash and correct structure
      expect(result.pivotIndex).toBeGreaterThanOrEqual(0)
      expect(result.pivotIndex).toBeLessThan(longWord.length)
      expect(result.before.length + 1 + result.after.length).toBe(100)
    })

    it('handles whitespace-only (if passed)', () => {
      // Graceful handling of edge case
      const result = splitWordByPivot(' ')
      expect(result.pivotIndex).toBe(0)
      expect(result.pivot).toBe(' ')
    })
  })
})

describe('calculatePivotOffset', () => {
  it('centers pivot in container', () => {
    // Container width=200, char width=10, pivot at index 5
    // Expected: containerCenter(100) - beforeWidth(50) - pivotHalfWidth(5) = 45
    const offset = calculatePivotOffset(200, 10, 5)
    expect(offset).toBe(45)
  })

  it('handles zero pivot index', () => {
    // Container width=200, char width=10, pivot at index 0
    // Expected: containerCenter(100) - beforeWidth(0) - pivotHalfWidth(5) = 95
    const offset = calculatePivotOffset(200, 10, 0)
    expect(offset).toBe(95)
  })

  it('handles large pivot index', () => {
    // Container width=400, char width=8, pivot at index 20
    // Expected: containerCenter(200) - beforeWidth(160) - pivotHalfWidth(4) = 36
    const offset = calculatePivotOffset(400, 8, 20)
    expect(offset).toBe(36)
  })

  it('calculates offset with formula: containerCenter - (pivotIndex * charWidth) - (charWidth / 2)', () => {
    // Document the formula explicitly
    const containerWidth = 300
    const charWidth = 12
    const pivotIndex = 10

    const containerCenter = containerWidth / 2
    const beforeWidth = pivotIndex * charWidth
    const pivotHalfWidth = charWidth / 2
    const expectedOffset = containerCenter - beforeWidth - pivotHalfWidth

    expect(calculatePivotOffset(containerWidth, charWidth, pivotIndex)).toBe(expectedOffset)
    expect(expectedOffset).toBe(24) // 150 - 120 - 6 = 24
  })
})
