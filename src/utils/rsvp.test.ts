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
