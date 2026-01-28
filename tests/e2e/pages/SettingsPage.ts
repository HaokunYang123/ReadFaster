import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page Object Model for the Settings modal interactions
 */
export class SettingsPage {
  readonly page: Page;

  // Modal container and close button
  readonly modal: Locator;
  readonly closeButton: Locator;

  // Settings controls
  readonly fontFamilySelect: Locator;
  readonly fontWeightSelect: Locator;
  readonly fontSizeSelect: Locator;

  // Pivot highlight controls
  readonly pivotHighlightCheckbox: Locator;
  readonly pivotColorSwatches: Locator;

  // Action buttons
  readonly resetButton: Locator;
  readonly doneButton: Locator;

  // Preview area
  readonly pivotPreview: Locator;

  constructor(page: Page) {
    this.page = page;

    // Modal container - fixed overlay with bg-black/70
    this.modal = page.locator('.fixed.inset-0.z-50');

    // Close button - the X button in header
    this.closeButton = page.locator('.fixed.inset-0.z-50 button').filter({ hasText: '\u00d7' });

    // Font settings selects - use nth() since selects are in specific order in the modal
    // Order in SettingsModal: Font Family, Font Weight, Font Size
    const modalSelects = page.locator('.fixed.inset-0.z-50 select');
    this.fontFamilySelect = modalSelects.nth(0);  // First select: Font Family
    this.fontWeightSelect = modalSelects.nth(1);  // Second select: Font Weight
    this.fontSizeSelect = modalSelects.nth(2);    // Third select: Font Size

    // Pivot highlight controls
    this.pivotHighlightCheckbox = page.locator('input[type="checkbox"]');
    this.pivotColorSwatches = page.locator('.fixed.inset-0.z-50 button[style*="background-color"]');

    // Action buttons in modal footer
    this.resetButton = page.getByRole('button', { name: /reset to defaults/i });
    this.doneButton = page.getByRole('button', { name: /done/i });

    // Preview area
    this.pivotPreview = page.locator('.fixed.inset-0.z-50 .bg-black\\/40');
  }

  /**
   * Open settings modal (assumes we're on the reader page)
   */
  async open() {
    const settingsButton = this.page.locator('button[title="Settings"]');
    await settingsButton.click();
    await expect(this.modal).toBeVisible();
  }

  /**
   * Close settings modal via X button
   */
  async close() {
    await this.closeButton.click();
    await expect(this.modal).not.toBeVisible();
  }

  /**
   * Close settings modal via Done button
   */
  async clickDone() {
    await this.doneButton.click();
    await expect(this.modal).not.toBeVisible();
  }

  /**
   * Select font family
   */
  async selectFontFamily(font: 'monospace' | 'serif' | 'sans') {
    await this.fontFamilySelect.selectOption(font);
  }

  /**
   * Select font weight
   */
  async selectFontWeight(weight: 'normal' | 'medium' | 'bold') {
    await this.fontWeightSelect.selectOption(weight);
  }

  /**
   * Select font size
   */
  async selectFontSize(size: 'small' | 'medium' | 'large') {
    await this.fontSizeSelect.selectOption(size);
  }

  /**
   * Toggle pivot highlight on/off
   */
  async togglePivotHighlight() {
    await this.pivotHighlightCheckbox.click();
  }

  /**
   * Set pivot highlight enabled state
   */
  async setPivotHighlight(enabled: boolean) {
    const isChecked = await this.pivotHighlightCheckbox.isChecked();
    if (isChecked !== enabled) {
      await this.togglePivotHighlight();
    }
  }

  /**
   * Select pivot color by hex value
   */
  async selectPivotColor(color: string) {
    // Color buttons have inline styles with the color
    const colorButton = this.page.locator(`.fixed.inset-0.z-50 button[style*="${color}"]`);
    await colorButton.click();
  }

  /**
   * Select pivot color by index (0-5)
   */
  async selectPivotColorByIndex(index: number) {
    const swatches = this.pivotColorSwatches;
    await swatches.nth(index).click();
  }

  /**
   * Reset all settings to defaults
   */
  async resetToDefaults() {
    await this.resetButton.click();
  }

  /**
   * Check that modal is visible
   */
  async expectModalVisible() {
    await expect(this.modal).toBeVisible();
  }

  /**
   * Check that modal is not visible
   */
  async expectModalHidden() {
    await expect(this.modal).not.toBeVisible();
  }

  /**
   * Get current font family selection
   */
  async getFontFamily(): Promise<string> {
    return await this.fontFamilySelect.inputValue();
  }

  /**
   * Get current font weight selection
   */
  async getFontWeight(): Promise<string> {
    return await this.fontWeightSelect.inputValue();
  }

  /**
   * Get current font size selection
   */
  async getFontSize(): Promise<string> {
    return await this.fontSizeSelect.inputValue();
  }

  /**
   * Check if pivot highlight is enabled
   */
  async isPivotHighlightEnabled(): Promise<boolean> {
    return await this.pivotHighlightCheckbox.isChecked();
  }
}
