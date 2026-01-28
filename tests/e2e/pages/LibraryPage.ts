import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page Object Model for the Library section interactions
 */
export class LibraryPage {
  readonly page: Page;

  // Library toggle button
  readonly libraryToggle: Locator;

  // Library container (expanded state)
  readonly libraryContainer: Locator;

  // Save form elements
  readonly saveButton: Locator;
  readonly saveTitleInput: Locator;
  readonly saveConfirmButton: Locator;
  readonly saveCancelButton: Locator;

  // Saved texts list
  readonly savedTextsList: Locator;

  constructor(page: Page) {
    this.page = page;

    // Library toggle - button with "Library (X)" text
    this.libraryToggle = page.locator('button').filter({ hasText: /Library \(/i });

    // Library container - the expanded section with bg-white/5
    this.libraryContainer = page.locator('.bg-white\\/5.rounded-xl');

    // Save form elements - appears after clicking "Save current text to library"
    this.saveButton = page.locator('text=+ Save current text to library').or(
      page.locator('button').filter({ hasText: /save current text/i })
    );
    this.saveTitleInput = page.locator('.bg-white\\/5 input[type="text"]');
    this.saveConfirmButton = page.locator('.bg-white\\/5 button').filter({ hasText: /^Save$/ });
    this.saveCancelButton = page.locator('.bg-white\\/5 button').filter({ hasText: /Cancel/i });

    // Saved texts list - items within the library container
    this.savedTextsList = page.locator('.bg-white\\/5.rounded-lg');
  }

  /**
   * Open/expand the library section
   */
  async open() {
    // Check if already expanded by looking for the container
    const isExpanded = await this.libraryContainer.isVisible();
    if (!isExpanded) {
      await this.libraryToggle.click();
      await expect(this.libraryContainer).toBeVisible();
    }
  }

  /**
   * Close/collapse the library section
   */
  async close() {
    const isExpanded = await this.libraryContainer.isVisible();
    if (isExpanded) {
      await this.libraryToggle.click();
      await expect(this.libraryContainer).not.toBeVisible();
    }
  }

  /**
   * Check if library is expanded
   */
  async isExpanded(): Promise<boolean> {
    return await this.libraryContainer.isVisible();
  }

  /**
   * Save the current text with a title
   */
  async saveCurrentText(title: string) {
    // Open library if not already open
    await this.open();

    // Click save button to show form
    await this.saveButton.click();

    // Enter title
    await this.saveTitleInput.fill(title);

    // Confirm save
    await this.saveConfirmButton.click();

    // Wait for item to appear in list
    await expect(this.page.locator('text=' + title).first()).toBeVisible();
  }

  /**
   * Load a text from library by title
   */
  async loadText(title: string) {
    // Open library if not already open
    await this.open();

    // Find the item with matching title and click Load
    const item = this.page.locator('.bg-white\\/5.rounded-lg').filter({ hasText: title });
    const loadButton = item.getByRole('button', { name: /load/i });
    await loadButton.click();
  }

  /**
   * Delete a text from library by title
   */
  async deleteText(title: string) {
    // Open library if not already open
    await this.open();

    // Find the item with matching title and click Delete
    const item = this.page.locator('.bg-white\\/5.rounded-lg').filter({ hasText: title });
    const deleteButton = item.getByRole('button', { name: /delete/i });
    await deleteButton.click();
  }

  /**
   * Check that a text exists in the library
   */
  async expectTextInLibrary(title: string) {
    await this.open();
    const item = this.page.locator('.bg-white\\/5.rounded-lg').filter({ hasText: title });
    await expect(item).toBeVisible();
  }

  /**
   * Check that a text does not exist in the library
   */
  async expectTextNotInLibrary(title: string) {
    await this.open();
    const item = this.page.locator('.bg-white\\/5.rounded-lg').filter({ hasText: title });
    await expect(item).not.toBeVisible();
  }

  /**
   * Get the count of saved texts
   */
  async getLibraryCount(): Promise<number> {
    const toggleText = await this.libraryToggle.textContent();
    const match = toggleText?.match(/Library \((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get all titles in the library
   */
  async getAllTitles(): Promise<string[]> {
    await this.open();
    const items = this.page.locator('.bg-white\\/5.rounded-lg p.text-white.font-medium');
    const count = await items.count();
    const titles: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text) titles.push(text.trim());
    }
    return titles;
  }

  /**
   * Check that library is empty
   */
  async expectLibraryEmpty() {
    await this.open();
    await expect(this.page.locator('text=No saved texts yet')).toBeVisible();
  }

  /**
   * Check that the library has a specific count
   */
  async expectLibraryCount(count: number) {
    await expect(this.libraryToggle).toContainText(`Library (${count})`);
  }
}
