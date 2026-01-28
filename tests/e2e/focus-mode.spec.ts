import { test, expect, devices } from '@playwright/test';
import { ReaderPage } from './pages/ReaderPage';
import { SAMPLE_TEXT, TWO_WORDS, LONG_TEXT } from './fixtures/test-data';

test.describe('Focus mode', () => {
  let readerPage: ReaderPage;

  test.beforeEach(async ({ page }) => {
    readerPage = new ReaderPage(page);
    await readerPage.goto();
  });

  test('focus mode activates when reading starts', async ({ page }) => {
    // Paste text into textarea
    await readerPage.pasteText(SAMPLE_TEXT);

    // Verify focus mode is not active initially
    await readerPage.expectFocusModeInactive();

    // Verify header/controls are visible
    const header = page.locator('h1').filter({ hasText: 'ReadFaster' });
    await expect(header).toBeVisible();

    // Start reading
    await readerPage.startReading();

    // Verify focus mode overlay is visible (fixed inset-0 z-40 element)
    await readerPage.expectFocusModeActive();

    // Verify header/controls have opacity-0 (hidden in focus mode)
    // Use .first() to avoid strict mode violations since there are multiple matching divs
    await expect(page.locator('.opacity-0.pointer-events-none').first()).toBeVisible();

    // Verify word display is scaled up (scale-110 or scale-125 class)
    const scaledDisplay = page.locator('.fixed.inset-0.z-40 [class*="scale-"]');
    await expect(scaledDisplay).toBeVisible();
  });

  test('focus mode deactivates on pause', async ({ page }) => {
    // Start reading (focus mode active)
    await readerPage.pasteText(SAMPLE_TEXT);
    await readerPage.startReading();
    await readerPage.expectFocusModeActive();

    // Pause reading using keyboard shortcut (controls are hidden in focus mode)
    await page.keyboard.press('Space');

    // Wait for focus mode to deactivate
    await readerPage.expectFocusModeInactive();

    // Verify header/controls are visible again
    const header = page.locator('h1').filter({ hasText: 'ReadFaster' });
    await expect(header).toBeVisible();
    // Use .first() to avoid strict mode violations
    await expect(page.locator('.opacity-100').first()).toBeVisible();
  });

  test('focus mode deactivates on completion', async ({ page }) => {
    // Use short text for fast completion
    await readerPage.pasteText(TWO_WORDS);

    // Set high WPM for fast reading
    const wpmSlider = page.getByRole('slider');
    await wpmSlider.fill('1000');

    // Start reading
    await readerPage.startReading();
    await readerPage.expectFocusModeActive();

    // Wait for reading to complete (focus mode should deactivate)
    // At 1000 WPM, 2 words takes ~120ms, give extra time for animation
    await readerPage.waitForReadingComplete(5000);

    // Verify focus mode overlay is hidden
    await readerPage.expectFocusModeInactive();

    // Verify controls are visible for restart
    await expect(page.getByRole('button', { name: /restart/i })).toBeVisible();
  });

  test('click-to-pause works in focus mode', async ({ page }) => {
    // Use longer text and lower WPM to ensure reading doesn't complete before click
    await readerPage.pasteText(LONG_TEXT);

    // Set low WPM to give time for click
    const wpmSlider = page.getByRole('slider');
    await wpmSlider.fill('100');

    // Start reading (focus mode active)
    await readerPage.startReading();
    await readerPage.expectFocusModeActive();

    // Small wait to ensure reading is in progress
    await page.waitForTimeout(300);

    // Click on the word display element (has role="button" and cursor-pointer)
    // The WordDisplay component has an onClick that calls onPause
    const wordDisplay = page.locator('.fixed.inset-0.z-40 .word-display');
    await wordDisplay.click();

    // Expect reading to pause (focus mode deactivates)
    await readerPage.expectFocusModeInactive();

    // Verify pause occurred - Resume button should be visible (not Restart, since not complete)
    await expect(page.getByRole('button', { name: /resume/i })).toBeVisible();
  });

  test('focus mode works on mobile viewport', async ({ browser }) => {
    // Create context with mobile viewport (iPhone 12 - 390x844)
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    const mobileReaderPage = new ReaderPage(page);

    await mobileReaderPage.goto();

    // Paste text and start reading
    await mobileReaderPage.pasteText(SAMPLE_TEXT);
    await mobileReaderPage.startReading();

    // Verify focus mode overlay covers screen
    const focusOverlay = page.locator('.fixed.inset-0.z-40');
    await expect(focusOverlay).toBeVisible();

    // Verify focus overlay is full screen (fixed inset-0 means 0 on all sides)
    const boundingBox = await focusOverlay.boundingBox();
    expect(boundingBox).toBeTruthy();
    if (boundingBox) {
      // Should cover most of viewport - be lenient with height for mobile browsers
      expect(boundingBox.width).toBeGreaterThan(350); // Most of 390px width
      expect(boundingBox.height).toBeGreaterThan(650); // Be lenient - mobile browsers may have different viewport
    }

    // Verify word is readable (check the word display area exists within overlay)
    const wordContainer = page.locator('.fixed.inset-0.z-40');
    await expect(wordContainer).toBeVisible();

    // Click to pause works on mobile - click on the word display element
    const wordDisplay = page.locator('.fixed.inset-0.z-40 .word-display');
    await wordDisplay.click();
    await mobileReaderPage.expectFocusModeInactive();

    await context.close();
  });

  test('keyboard space toggles play/pause in focus mode', async ({ page }) => {
    // Use longer text to avoid completing before toggle
    await readerPage.pasteText(LONG_TEXT);

    // Set low WPM to ensure we have time to toggle
    const wpmSlider = page.getByRole('slider');
    await wpmSlider.fill('100');

    // Start reading
    await readerPage.startReading();
    await readerPage.expectFocusModeActive();

    // Small wait to ensure reading is in progress
    await page.waitForTimeout(300);

    // Press space to pause
    await page.keyboard.press('Space');
    await readerPage.expectFocusModeInactive();

    // Verify paused (Resume button visible)
    await expect(page.getByRole('button', { name: /resume/i })).toBeVisible();

    // Wait for debounce to clear (200ms in the app code)
    await page.waitForTimeout(300);

    // Click outside textarea to ensure keyboard shortcuts work
    // (The keyboard handler ignores events when textarea is focused)
    await page.locator('h1').click();

    // Press space to resume
    await page.keyboard.press('Space');
    await readerPage.expectFocusModeActive();
  });
});
