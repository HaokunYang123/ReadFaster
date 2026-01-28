import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page Object Model for the main RSVP reader page interactions
 */
export class ReaderPage {
  readonly page: Page;

  // Text input area
  readonly textInput: Locator;

  // Control buttons
  readonly startButton: Locator;
  readonly pauseButton: Locator;
  readonly resetButton: Locator;
  readonly clearButton: Locator;

  // Display elements
  readonly wordDisplay: Locator;
  readonly focusModeOverlay: Locator;
  readonly progressBar: Locator;
  readonly progressText: Locator;

  // Speed control
  readonly wpmSlider: Locator;
  readonly wpmDisplay: Locator;

  // Settings button in header
  readonly settingsButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Text input - use textarea selector
    this.textInput = page.locator('textarea');

    // Control buttons - use role selectors with name matching
    this.startButton = page.getByRole('button', { name: /^(Start|Resume|Restart)$/i });
    this.pauseButton = page.getByRole('button', { name: /pause/i });
    this.resetButton = page.getByRole('button', { name: /reset/i });
    this.clearButton = page.getByRole('button', { name: /clear/i });

    // Display elements - the word display container and focus mode overlay
    this.wordDisplay = page.locator('[class*="reader-display"]').or(
      page.locator('.min-h-\\[200px\\]').first()
    );
    this.focusModeOverlay = page.locator('.fixed.inset-0.z-40');
    this.progressBar = page.locator('[class*="progress"]').or(
      page.locator('.bg-primary').first()
    );
    this.progressText = page.locator('text=/\\d+\\s*\\/\\s*\\d+/');

    // Speed control
    this.wpmSlider = page.getByLabel(/speed/i);
    this.wpmDisplay = page.locator('text=/\\d+\\s*WPM/');

    // Settings button - SVG icon button in header
    this.settingsButton = page.locator('button[title="Settings"]');
  }

  /**
   * Navigate to the reader page
   */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * Paste/fill text into the input area
   */
  async pasteText(text: string) {
    await this.textInput.fill(text);
  }

  /**
   * Start reading (clicks Start/Resume/Restart button)
   */
  async startReading() {
    await this.startButton.click();
  }

  /**
   * Pause reading
   */
  async pauseReading() {
    await this.pauseButton.click();
  }

  /**
   * Reset the reader to beginning
   */
  async resetReading() {
    await this.resetButton.click();
  }

  /**
   * Clear all text
   */
  async clearText() {
    await this.clearButton.click();
  }

  /**
   * Check that focus mode is active (overlay is visible)
   */
  async expectFocusModeActive() {
    await expect(this.focusModeOverlay).toBeVisible();
  }

  /**
   * Check that focus mode is inactive (overlay is not visible)
   */
  async expectFocusModeInactive() {
    await expect(this.focusModeOverlay).not.toBeVisible();
  }

  /**
   * Get the currently displayed word text
   */
  async getCurrentWord(): Promise<string> {
    // The word display shows styled text with pivot highlight
    // Look for the text content in the reader display area
    const displayArea = this.page.locator('.fixed.inset-0.z-40').or(
      this.page.locator('.min-h-\\[200px\\]').first()
    );
    const text = await displayArea.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the current progress (e.g., "3 / 10")
   */
  async getProgress(): Promise<string> {
    const text = await this.progressText.textContent();
    return text?.trim() || '';
  }

  /**
   * Set WPM using the slider
   */
  async setWpm(value: number) {
    await this.wpmSlider.fill(String(value));
  }

  /**
   * Get current WPM value
   */
  async getWpm(): Promise<number> {
    const text = await this.wpmDisplay.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Open settings modal
   */
  async openSettings() {
    await this.settingsButton.click();
  }

  /**
   * Press keyboard shortcut
   */
  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  /**
   * Wait for reading to complete (focus mode deactivates)
   */
  async waitForReadingComplete(timeout = 30000) {
    await expect(this.focusModeOverlay).not.toBeVisible({ timeout });
  }
}
