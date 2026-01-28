/**
 * Integration tests for useRSVP hook
 *
 * Tests cover:
 * - INTG-01: Timer-based playback with fake timers
 * - INTG-02: State transitions (start/pause/reset/skip)
 *
 * Uses TestComponent from integration-utils to test hook through rendered DOM,
 * verifying behavior rather than implementation details.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { wpmToInterval } from '@/utils/rsvp'
import {
  createTestComponent,
  startWithText,
  setWpmValue,
  setupFakeTimers,
  teardownFakeTimers,
  advanceTimers,
  screen,
  fireEvent,
  getStatus,
  getCurrentWord,
  getCurrentIndex,
  getProgress,
  getTotalWords,
} from '../integration-utils'

describe('useRSVP hook', () => {
  beforeEach(() => {
    setupFakeTimers()
  })

  afterEach(() => {
    teardownFakeTimers()
  })

  // ==========================================================================
  // INTG-01: Timer-based playback with fake timers
  // ==========================================================================

  describe('timer-based playback (INTG-01)', () => {
    it('advances to next word after interval elapses', async () => {
      createTestComponent()
      startWithText('hello world')

      // Should start at first word
      expect(getCurrentWord()).toBe('hello')
      expect(getCurrentIndex()).toBe(0)

      // Advance by default interval (300 WPM = 200ms)
      const interval = wpmToInterval(300)
      await advanceTimers(interval)

      // Should advance to second word
      expect(getCurrentWord()).toBe('world')
      expect(getCurrentIndex()).toBe(1)
    })

    it('continues advancing through all words', async () => {
      createTestComponent()
      startWithText('one two three')

      const interval = wpmToInterval(300)

      expect(getCurrentWord()).toBe('one')

      await advanceTimers(interval)
      expect(getCurrentWord()).toBe('two')

      await advanceTimers(interval)
      expect(getCurrentWord()).toBe('three')
    })

    it('marks isComplete when reaching last word', async () => {
      createTestComponent()
      startWithText('hello world')

      const interval = wpmToInterval(300)

      // Advance through words:
      // - tick 1: index 0 -> 1
      // - tick 2: index 1 -> 2 (past last word)
      // - tick 3: detects index >= length, marks complete
      await advanceTimers(interval) // index 0 -> 1
      await advanceTimers(interval) // index 1 -> 2
      await advanceTimers(interval) // marks complete

      expect(getStatus()).toBe('complete')
    })

    it('stops interval when playback completes', async () => {
      createTestComponent()
      startWithText('hello world')

      const interval = wpmToInterval(300)

      // Complete playback (need 3 ticks for 2 words)
      await advanceTimers(interval) // index 0 -> 1
      await advanceTimers(interval) // index 1 -> 2
      await advanceTimers(interval) // marks complete

      // Record state after completion
      const indexAfterComplete = getCurrentIndex()

      // Advance more time - should NOT change anything
      await advanceTimers(interval * 5)

      // State should be unchanged
      expect(getCurrentIndex()).toBe(indexAfterComplete)
      expect(getStatus()).toBe('complete')
    })

    it('respects WPM setting for interval timing', async () => {
      createTestComponent({ initialWpm: 600 })
      startWithText('hello world')

      // At 600 WPM, interval is 100ms
      const fastInterval = wpmToInterval(600)
      expect(fastInterval).toBe(100)

      // After 100ms, should advance
      await advanceTimers(fastInterval)
      expect(getCurrentWord()).toBe('world')
    })

    it('calculates progress correctly during playback', async () => {
      createTestComponent()
      startWithText('one two three four')

      expect(getTotalWords()).toBe(4)
      expect(getProgress()).toBe(25) // 1/4 = 25%

      const interval = wpmToInterval(300)

      await advanceTimers(interval) // index 1
      expect(getProgress()).toBe(50) // 2/4 = 50%

      await advanceTimers(interval) // index 2
      expect(getProgress()).toBe(75) // 3/4 = 75%

      await advanceTimers(interval) // index 3
      expect(getProgress()).toBe(100) // 4/4 = 100%
    })
  })

  // ==========================================================================
  // INTG-02: State transitions (start/pause/reset/skip)
  // ==========================================================================

  describe('start behavior (INTG-02)', () => {
    it('start() tokenizes text and sets first word', async () => {
      createTestComponent()
      startWithText('hello world test')

      expect(getCurrentWord()).toBe('hello')
      expect(getTotalWords()).toBe(3)
    })

    it('start() sets isPlaying to true', async () => {
      createTestComponent()
      expect(getStatus()).toBe('paused')

      startWithText('hello world')

      expect(getStatus()).toBe('playing')
    })

    it('start() with empty text does not start playback', async () => {
      createTestComponent()
      startWithText('')

      expect(getStatus()).toBe('paused')
      expect(getTotalWords()).toBe(0)
    })

    it('start() after completion restarts from beginning', async () => {
      createTestComponent()
      startWithText('hello world')

      const interval = wpmToInterval(300)

      // Complete playback (need 3 ticks for 2 words)
      await advanceTimers(interval) // index 0 -> 1
      await advanceTimers(interval) // index 1 -> 2
      await advanceTimers(interval) // marks complete
      expect(getStatus()).toBe('complete')

      // Start again with same text
      startWithText('hello world')

      expect(getStatus()).toBe('playing')
      expect(getCurrentIndex()).toBe(0)
      expect(getCurrentWord()).toBe('hello')
    })
  })

  describe('pause behavior (INTG-02)', () => {
    it('pause() sets isPlaying to false', async () => {
      createTestComponent()
      startWithText('hello world')

      expect(getStatus()).toBe('playing')

      fireEvent.click(screen.getByTestId('pause-button'))

      expect(getStatus()).toBe('paused')
    })

    it('pause() rewinds by REWIND_AMOUNT (5 words)', async () => {
      createTestComponent()
      // Create text with 10+ words
      const words = 'one two three four five six seven eight nine ten'.split(' ')
      startWithText(words.join(' '))

      const interval = wpmToInterval(300)

      // Advance to word 7 (index 7)
      for (let i = 0; i < 7; i++) {
        await advanceTimers(interval)
      }
      expect(getCurrentIndex()).toBe(7)
      expect(getCurrentWord()).toBe('eight')

      // Pause - should rewind by 5 to index 2
      fireEvent.click(screen.getByTestId('pause-button'))

      expect(getCurrentIndex()).toBe(2)
      expect(getCurrentWord()).toBe('three')
    })

    it('pause() does not rewind past index 0', async () => {
      createTestComponent()
      startWithText('one two three four five')

      const interval = wpmToInterval(300)

      // Advance to word 3 (index 3)
      for (let i = 0; i < 3; i++) {
        await advanceTimers(interval)
      }
      expect(getCurrentIndex()).toBe(3)

      // Pause - rewind would be 3-5=-2, but should clamp to 0
      fireEvent.click(screen.getByTestId('pause-button'))

      expect(getCurrentIndex()).toBe(0)
      expect(getCurrentWord()).toBe('one')
    })

    it('pause() stops the interval timer', async () => {
      createTestComponent()
      startWithText('one two three four five')

      const interval = wpmToInterval(300)

      // Advance once
      await advanceTimers(interval)
      expect(getCurrentIndex()).toBe(1)

      // Pause
      fireEvent.click(screen.getByTestId('pause-button'))
      const indexAfterPause = getCurrentIndex()

      // Advance more time - should NOT change index
      await advanceTimers(interval * 3)

      expect(getCurrentIndex()).toBe(indexAfterPause)
    })
  })

  describe('reset behavior (INTG-02)', () => {
    it('reset() clears all state', async () => {
      createTestComponent()
      startWithText('hello world test')

      const interval = wpmToInterval(300)
      await advanceTimers(interval) // Advance once

      expect(getCurrentWord()).toBe('world')
      expect(getTotalWords()).toBe(3)

      fireEvent.click(screen.getByTestId('reset-button'))

      expect(getCurrentWord()).toBe('')
      expect(getCurrentIndex()).toBe(0)
      expect(getTotalWords()).toBe(0)
      expect(getStatus()).toBe('paused')
    })

    it('reset() stops active playback', async () => {
      createTestComponent()
      startWithText('one two three four five')

      expect(getStatus()).toBe('playing')

      fireEvent.click(screen.getByTestId('reset-button'))

      // Should stop playing
      expect(getStatus()).toBe('paused')

      const interval = wpmToInterval(300)
      await advanceTimers(interval * 5)

      // State should remain cleared
      expect(getTotalWords()).toBe(0)
      expect(getCurrentIndex()).toBe(0)
    })
  })

  describe('skip behavior (INTG-02)', () => {
    it('skipForward() advances by SKIP_AMOUNT (10 words)', async () => {
      createTestComponent()
      // Create 20 words
      const words = Array.from({ length: 20 }, (_, i) => `word${i}`)
      startWithText(words.join(' '))

      expect(getCurrentIndex()).toBe(0)

      fireEvent.click(screen.getByTestId('skip-forward-button'))

      expect(getCurrentIndex()).toBe(10)
      expect(getCurrentWord()).toBe('word10')
    })

    it('skipForward() does not go past last word', async () => {
      createTestComponent()
      startWithText('one two three four five')

      expect(getTotalWords()).toBe(5)

      fireEvent.click(screen.getByTestId('skip-forward-button'))

      // Should clamp to last word (index 4)
      expect(getCurrentIndex()).toBe(4)
      expect(getCurrentWord()).toBe('five')
    })

    it('skipBackward() decreases by SKIP_AMOUNT (10 words)', async () => {
      createTestComponent()
      // Create 20 words
      const words = Array.from({ length: 20 }, (_, i) => `word${i}`)
      startWithText(words.join(' '))

      const interval = wpmToInterval(300)

      // Advance to index 15
      for (let i = 0; i < 15; i++) {
        await advanceTimers(interval)
      }
      expect(getCurrentIndex()).toBe(15)

      fireEvent.click(screen.getByTestId('skip-backward-button'))

      expect(getCurrentIndex()).toBe(5)
      expect(getCurrentWord()).toBe('word5')
    })

    it('skipBackward() does not go below 0', async () => {
      createTestComponent()
      startWithText('one two three four five')

      const interval = wpmToInterval(300)

      // Advance to index 3
      for (let i = 0; i < 3; i++) {
        await advanceTimers(interval)
      }
      expect(getCurrentIndex()).toBe(3)

      // Skip backward (3-10 = -7, should clamp to 0)
      fireEvent.click(screen.getByTestId('skip-backward-button'))

      expect(getCurrentIndex()).toBe(0)
      expect(getCurrentWord()).toBe('one')
    })

    it('skip maintains playback state', async () => {
      createTestComponent()
      const words = Array.from({ length: 20 }, (_, i) => `word${i}`)
      startWithText(words.join(' '))

      expect(getStatus()).toBe('playing')

      fireEvent.click(screen.getByTestId('skip-forward-button'))

      // Should still be playing after skip
      expect(getStatus()).toBe('playing')

      // Timer should still work
      const interval = wpmToInterval(300)
      await advanceTimers(interval)

      expect(getCurrentIndex()).toBe(11) // 10 + 1
    })
  })

  describe('WPM changes (INTG-02)', () => {
    it('setWpm() changes interval for subsequent ticks', async () => {
      createTestComponent()
      startWithText('one two three four')

      // Advance at 300 WPM (200ms)
      await advanceTimers(200)
      expect(getCurrentIndex()).toBe(1)

      // Change to 600 WPM (100ms)
      setWpmValue(600)

      // Advance by 100ms - should tick at new rate
      await advanceTimers(100)
      expect(getCurrentIndex()).toBe(2)
    })
  })
})
