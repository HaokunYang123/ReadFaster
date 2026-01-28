import { test, expect } from '@playwright/test';
import { ReaderPage } from './pages/ReaderPage';
import { SAMPLE_TEXT, TWO_WORDS, WORD_COUNTS } from './fixtures/test-data';

/**
 * E2E tests for the complete reading flow
 * Covers: E2E-01 (paste -> play -> pause -> complete)
 *         E2E-07, E2E-08, E2E-09 (multi-browser: Chrome, Firefox, WebKit)
 */
test.describe('Complete reading flow', () => {
  let reader: ReaderPage;

  test.beforeEach(async ({ page }) => {
    reader = new ReaderPage(page);
    await reader.goto();
  });

  test('user can paste text and see it in textarea', async () => {
    await reader.pasteText(SAMPLE_TEXT);
    await expect(reader.textInput).toHaveValue(SAMPLE_TEXT);
  });

  test('user can start reading and see first word displayed', async () => {
    await reader.pasteText(SAMPLE_TEXT);
    await reader.startReading();

    // Focus mode overlay should be visible
    await reader.expectFocusModeActive();

    // First word "The" should be displayed
    // The word display area contains spans for before-pivot, pivot, after-pivot
    const wordDisplayArea = reader.page.locator('.word-display');
    await expect(wordDisplayArea).toBeVisible();
    await expect(wordDisplayArea).toContainText('The');
  });

  test('user can pause reading', async () => {
    await reader.pasteText(SAMPLE_TEXT);
    await reader.startReading();

    // Wait briefly for reading to be active
    await reader.expectFocusModeActive();

    // Pause using space key (focus mode may hide buttons)
    await reader.pressKey('Space');

    // Focus mode should deactivate when paused
    await reader.expectFocusModeInactive();

    // Start button should now show "Resume"
    await expect(reader.startButton).toContainText(/Resume/i);
  });

  test('user can resume reading after pause', async () => {
    await reader.pasteText(SAMPLE_TEXT);
    await reader.startReading();

    // Pause
    await reader.pressKey('Space');
    await reader.expectFocusModeInactive();

    // Resume
    await reader.startReading();

    // Focus mode should reactivate
    await reader.expectFocusModeActive();
  });

  test('user completes reading when all words processed', async () => {
    test.slow(); // This test may take longer due to reading completion

    // Use short text for faster completion
    await reader.pasteText(TWO_WORDS);

    // Set high WPM for faster completion (using keyboard since slider may not be easily accessible)
    // Fill the WPM slider with high value before starting
    await reader.wpmSlider.fill('1000');

    await reader.startReading();

    // Wait for completion - focus mode should deactivate
    await reader.waitForReadingComplete(10000);

    // Should show completion state
    const completionText = reader.page.locator('text=Complete!');
    await expect(completionText).toBeVisible();

    // Start button should now show "Restart"
    await expect(reader.startButton).toContainText(/Restart/i);
  });

  test('reading flow works across different text lengths', async () => {
    // Test with sample text
    await reader.pasteText(SAMPLE_TEXT);
    await reader.startReading();
    await reader.expectFocusModeActive();

    // Pause and verify progress is tracked
    await reader.pressKey('Space');
    await reader.expectFocusModeInactive();

    // Progress should show "Word: X / 9" for sample text (9 words)
    const progressText = reader.page.locator(`text=/ ${WORD_COUNTS.SAMPLE_TEXT}`);
    await expect(progressText).toBeVisible();
  });

  test('start button shows correct state labels', async () => {
    // Initial state: "Start"
    await expect(reader.startButton).toContainText('Start');

    await reader.pasteText(SAMPLE_TEXT);

    // Still "Start" with text but not started
    await expect(reader.startButton).toContainText('Start');

    // Start reading
    await reader.startReading();
    await reader.expectFocusModeActive();

    // Pause - should show "Resume"
    await reader.pressKey('Space');
    await expect(reader.startButton).toContainText('Resume');

    // Reset - should go back to "Start"
    await reader.resetReading();
    await expect(reader.startButton).toContainText('Start');
  });

  test('clear button resets everything', async () => {
    await reader.pasteText(SAMPLE_TEXT);
    await reader.startReading();

    // Pause to access controls
    await reader.pressKey('Space');
    await reader.expectFocusModeInactive();

    // Clear
    await reader.clearText();

    // Textarea should be empty
    await expect(reader.textInput).toHaveValue('');

    // Start button should be disabled (no text)
    await expect(reader.startButton).toBeDisabled();
  });

  test('focus mode displays word with pivot highlighting', async () => {
    await reader.pasteText(SAMPLE_TEXT);
    await reader.startReading();

    await reader.expectFocusModeActive();

    // Check that pivot structure exists
    const beforePivot = reader.page.locator('.before-pivot');
    const pivot = reader.page.locator('.pivot');
    const afterPivot = reader.page.locator('.after-pivot');

    await expect(beforePivot).toBeVisible();
    await expect(pivot).toBeVisible();
    await expect(afterPivot).toBeVisible();
  });
});
