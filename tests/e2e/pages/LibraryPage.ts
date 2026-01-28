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

    // Library container - the expanded section directly after the library toggle button
    // It's inside a div.mb-6 that contains the library toggle
    this.libraryContainer = page.locator('.mb-6 > .bg-white\\/5.rounded-xl.p-4');

    // Save form elements - appears after clicking "Save current text to library"
    this.saveButton = page.locator('text=+ Save current text to library').or(
      page.locator('button').filter({ hasText: /save current text/i })
    );
    // The save title input is inside the library container
    this.saveTitleInput = page.locator('.mb-6 input[type="text"]');
    this.saveConfirmButton = page.locator('.mb-6 .flex.gap-2 button').filter({ hasText: /^Save$/ });
    this.saveCancelButton = page.locator('.mb-6 button').filter({ hasText: /Cancel/i });

    // Saved texts list - items within the library container (each saved item has rounded-lg)
    this.savedTextsList = page.locator('.mb-6 .bg-white\\/5.rounded-lg');
  }

  /**
   * Open/expand the library section
   */
  async open() {
    // Check if already expanded by looking for the container
    // Use count() > 0 to avoid strict mode issues
    const count = await this.libraryContainer.count();
    const isExpanded = count > 0 && await this.libraryContainer.first().isVisible();
    if (!isExpanded) {
      await this.libraryToggle.click();
      await expect(this.libraryContainer.first()).toBeVisible();
    }
  }

  /**
   * Close/collapse the library section
   */
  async close() {
    const count = await this.libraryContainer.count();
    const isExpanded = count > 0 && await this.libraryContainer.first().isVisible();
    if (isExpanded) {
      await this.libraryToggle.click();
      await expect(this.libraryContainer.first()).not.toBeVisible();
    }
  }

  /**
   * Check if library is expanded
   */
  async isExpanded(): Promise<boolean> {
    const count = await this.libraryContainer.count();
    return count > 0 && await this.libraryContainer.first().isVisible();
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

    // Find the item with matching title and click Load (within mb-6 which is the library section)
    const item = this.page.locator('.mb-6 .bg-white\\/5.rounded-lg').filter({ hasText: title });
    const loadButton = item.getByRole('button', { name: /load/i });
    await loadButton.click();
  }

  /**
   * Delete a text from library by title
   */
  async deleteText(title: string) {
    // Open library if not already open
    await this.open();

    // Find the item with matching title and click Delete (within mb-6 which is the library section)
    const item = this.page.locator('.mb-6 .bg-white\\/5.rounded-lg').filter({ hasText: title });
    const deleteButton = item.getByRole('button', { name: /delete/i });
    await deleteButton.click();
  }

  /**
   * Check that a text exists in the library
   */
  async expectTextInLibrary(title: string) {
    await this.open();
    const item = this.page.locator('.mb-6 .bg-white\\/5.rounded-lg').filter({ hasText: title });
    await expect(item).toBeVisible();
  }

  /**
   * Check that a text does not exist in the library
   */
  async expectTextNotInLibrary(title: string) {
    await this.open();
    const item = this.page.locator('.mb-6 .bg-white\\/5.rounded-lg').filter({ hasText: title });
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
    const items = this.page.locator('.mb-6 .bg-white\\/5.rounded-lg p.text-white.font-medium');
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
