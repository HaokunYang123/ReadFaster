import { test, expect } from '@playwright/test';
import { ReaderPage } from './pages/ReaderPage';
import { SAMPLE_TEXT, LONG_TEXT, TWO_WORDS, WPM_VALUES } from './fixtures/test-data';

/**
 * E2E tests for keyboard shortcuts
 * Covers: E2E-02 (keyboard shortcuts for play/pause, speed control, skip)
 *
 * Note: Space key behavior:
 * - Pauses when playing
 * - Resumes when paused (words already loaded)
 * - Restarts after completion
 * - Does NOT start fresh (must use Start button first)
 */
test.describe('Keyboard shortcuts', () => {
  let reader: ReaderPage;

  test.beforeEach(async ({ page }) => {
    reader = new ReaderPage(page);
    await reader.goto();
  });

  test.describe('Space key - play/pause toggle', () => {
    test('space key pauses reading when playing', async () => {
      await reader.pasteText(SAMPLE_TEXT);
      await reader.startReading();
      await reader.expectFocusModeActive();

      // Press space to pause (focus mode catches keys)
      await reader.pressKey('Space');

      // Focus mode should deactivate (paused)
      await reader.expectFocusModeInactive();
      await expect(reader.startButton).toContainText(/Resume/i);
    });

    test('space key does not activate when typing in textarea', async () => {
      await reader.pasteText(SAMPLE_TEXT);

      // Start reading first to have words loaded
      await reader.startReading();
      await reader.expectFocusModeActive();

      // Pause
      await reader.pressKey('Space');
      await reader.expectFocusModeInactive();

      // Now focus on textarea
      await reader.textInput.focus();

      // Press space - should type space, not resume
      await reader.pressKey('Space');

      // Textarea should contain space at the end
      await expect(reader.textInput).toHaveValue(SAMPLE_TEXT + ' ');

      // Focus mode should NOT be active (still paused)
      await reader.expectFocusModeInactive();
    });

    test('space key resumes reading after pause', async () => {
      await reader.pasteText(SAMPLE_TEXT);
      await reader.startReading();
      await reader.expectFocusModeActive();

      // Pause
      await reader.pressKey('Space');
      await reader.expectFocusModeInactive();

      // Click h1 to ensure not in input
      await reader.blurInputs();

      // Wait for debounce (200ms) to clear before pressing space again
      await reader.page.waitForTimeout(250);

      // Resume with space (words are already loaded from first start)
      await reader.pressKey('Space');
      await reader.expectFocusModeActive();
    });

    test('space key restarts reading after completion', async () => {
      test.slow();

      // Use short text and high WPM for quick completion
      await reader.pasteText(TWO_WORDS);
      await reader.wpmSlider.fill('1000');
      await reader.startReading();
      await reader.expectFocusModeActive();

      // Wait for completion
      await reader.waitForReadingComplete(10000);
      await expect(reader.startButton).toContainText(/Restart/i);

      // Click h1 to defocus
      await reader.blurInputs();

      // Press space to restart
      await reader.pressKey('Space');
      await reader.expectFocusModeActive();
    });
  });

  test.describe('Arrow Up/Down - WPM control', () => {
    test('arrow up increases WPM by 50', async () => {
      await reader.pasteText(SAMPLE_TEXT);

      // Get initial WPM (should be default 300)
      const initialWpm = await reader.getWpm();
      expect(initialWpm).toBe(WPM_VALUES.DEFAULT);

      // Click h1 to defocus any inputs (especially the slider)
      await reader.blurInputs();

      // Press arrow up
      await reader.pressKey('ArrowUp');

      // WPM should increase by 50
      const newWpm = await reader.getWpm();
      expect(newWpm).toBe(initialWpm + 50);
    });

    test('arrow up increases WPM multiple times', async () => {
      await reader.pasteText(SAMPLE_TEXT);
      await reader.blurInputs();

      const initialWpm = await reader.getWpm();

      // Press arrow up twice
      await reader.pressKey('ArrowUp');
      await reader.pressKey('ArrowUp');

      const newWpm = await reader.getWpm();
      expect(newWpm).toBe(initialWpm + 100);
    });

    test('arrow down decreases WPM by 50', async () => {
      await reader.pasteText(SAMPLE_TEXT);
      await reader.blurInputs();

      const initialWpm = await reader.getWpm();

      // Press arrow down
      await reader.pressKey('ArrowDown');

      const newWpm = await reader.getWpm();
      expect(newWpm).toBe(initialWpm - 50);
    });

    test('arrow down respects minimum WPM (100)', async () => {
      await reader.pasteText(SAMPLE_TEXT);

      // Set WPM to minimum via slider first
      await reader.wpmSlider.fill('100');
      const minWpm = await reader.getWpm();
      expect(minWpm).toBe(WPM_VALUES.MIN);

      // Click h1 to defocus the slider
      await reader.blurInputs();

      // Press arrow down - should not go below 100
      await reader.pressKey('ArrowDown');

      const newWpm = await reader.getWpm();
      expect(newWpm).toBe(WPM_VALUES.MIN);
    });

    test('arrow up respects maximum WPM (1000)', async () => {
      await reader.pasteText(SAMPLE_TEXT);

      // Set WPM to maximum via slider first
      await reader.wpmSlider.fill('1000');
      const maxWpm = await reader.getWpm();
      expect(maxWpm).toBe(WPM_VALUES.MAX);

      // Click h1 to defocus the slider
      await reader.blurInputs();

      // Press arrow up - should not exceed 1000
      await reader.pressKey('ArrowUp');

      const newWpm = await reader.getWpm();
      expect(newWpm).toBe(WPM_VALUES.MAX);
    });

    test('WPM changes persist during reading', async () => {
      await reader.pasteText(SAMPLE_TEXT);
      // Wait for the start button to be enabled (text state to propagate)
      await expect(reader.startButton).toBeEnabled();
      await reader.startReading();
      await reader.expectFocusModeActive();

      // Get current WPM
      const initialWpm = await reader.getWpm();

      // Change WPM with arrow keys while reading (focus mode catches keys)
      await reader.pressKey('ArrowUp');

      // WPM should change
      const newWpm = await reader.getWpm();
      expect(newWpm).toBe(initialWpm + 50);

      // Pause to verify
      await reader.pressKey('Space');
      const finalWpm = await reader.getWpm();
      expect(finalWpm).toBe(newWpm);
    });
  });

  test.describe('Arrow Left/Right - skip control', () => {
    test('arrow right skips forward', async () => {
      await reader.pasteText(LONG_TEXT);
      await reader.startReading();
      await reader.expectFocusModeActive();

      // Pause to check progress
      await reader.pressKey('Space');
      const initialProgress = await reader.getProgress();

      // Click h1 to ensure not in input
      await reader.blurInputs();

      // Skip forward
      await reader.pressKey('ArrowRight');

      // Progress should have increased
      const newProgress = await reader.getProgress();

      // Extract word numbers from progress (format: "Word: X / Y")
      const initialMatch = initialProgress.match(/(\d+)\s*\/\s*\d+/);
      const newMatch = newProgress.match(/(\d+)\s*\/\s*\d+/);

      expect(initialMatch).not.toBeNull();
      expect(newMatch).not.toBeNull();

      if (initialMatch && newMatch) {
        const initialWord = parseInt(initialMatch[1], 10);
        const newWord = parseInt(newMatch[1], 10);
        expect(newWord).toBeGreaterThan(initialWord);
      }
    });

    test('arrow left skips backward', async () => {
      await reader.pasteText(LONG_TEXT);

      // Set high WPM for faster advancement
      await reader.wpmSlider.fill('800');
      await reader.startReading();
      await reader.expectFocusModeActive();

      // Wait for some word advancement
      await reader.page.waitForTimeout(500);

      // Skip forward first to get further into the text
      await reader.pressKey('ArrowRight');

      // Pause to check progress
      await reader.pressKey('Space');
      const midProgress = await reader.getProgress();

      // Click h1 to ensure not in input
      await reader.blurInputs();

      // Skip backward
      await reader.pressKey('ArrowLeft');

      // Progress should have decreased
      const newProgress = await reader.getProgress();

      // Extract word numbers
      const midMatch = midProgress.match(/(\d+)\s*\/\s*\d+/);
      const newMatch = newProgress.match(/(\d+)\s*\/\s*\d+/);

      expect(midMatch).not.toBeNull();
      expect(newMatch).not.toBeNull();

      if (midMatch && newMatch) {
        const midWord = parseInt(midMatch[1], 10);
        const newWord = parseInt(newMatch[1], 10);
        expect(newWord).toBeLessThan(midWord);
      }
    });

    test('skip controls work during playback', async () => {
      await reader.pasteText(LONG_TEXT);
      await reader.startReading();
      await reader.expectFocusModeActive();

      // Skip forward while playing (focus mode catches keys)
      await reader.pressKey('ArrowRight');

      // Should still be in focus mode
      await reader.expectFocusModeActive();

      // Skip backward while playing
      await reader.pressKey('ArrowLeft');

      // Should still be in focus mode
      await reader.expectFocusModeActive();
    });

    test('arrow left does not go below word 1', async () => {
      await reader.pasteText(SAMPLE_TEXT);
      await reader.startReading();
      await reader.expectFocusModeActive();

      // Immediately pause (at word 1)
      await reader.pressKey('Space');

      // Click h1 to ensure not in input
      await reader.blurInputs();

      // Try to skip backward from start
      await reader.pressKey('ArrowLeft');
      await reader.pressKey('ArrowLeft');
      await reader.pressKey('ArrowLeft');

      // Should still be at first word (or close to it)
      const progress = await reader.getProgress();
      const match = progress.match(/(\d+)\s*\/\s*\d+/);

      expect(match).not.toBeNull();
      if (match) {
        const wordNum = parseInt(match[1], 10);
        expect(wordNum).toBeGreaterThanOrEqual(1);
      }
    });
  });

  test.describe('Keyboard shortcuts integration', () => {
    test('multiple keyboard controls work together', async () => {
      await reader.pasteText(LONG_TEXT);

      // Start reading with button first
      await reader.startReading();
      await reader.expectFocusModeActive();

      // Increase speed (focus mode catches keys)
      await reader.pressKey('ArrowUp');
      const wpmAfterUp = await reader.getWpm();
      expect(wpmAfterUp).toBe(350);

      // Skip forward
      await reader.pressKey('ArrowRight');

      // Decrease speed
      await reader.pressKey('ArrowDown');
      const wpmAfterDown = await reader.getWpm();
      expect(wpmAfterDown).toBe(300);

      // Pause
      await reader.pressKey('Space');
      await reader.expectFocusModeInactive();

      // Wait for debounce (200ms) to clear
      await reader.page.waitForTimeout(250);

      // Resume
      await reader.blurInputs();
      await reader.pressKey('Space');
      await reader.expectFocusModeActive();
    });
  });
});
