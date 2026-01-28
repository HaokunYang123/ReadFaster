import { test, expect } from '@playwright/test';
import { ReaderPage } from './pages/ReaderPage';
import { LibraryPage } from './pages/LibraryPage';
import { SAMPLE_TEXT, MEDIUM_TEXT, LIBRARY_ENTRIES } from './fixtures/test-data';

test.describe('Library functionality', () => {
  let readerPage: ReaderPage;
  let libraryPage: LibraryPage;

  test.beforeEach(async ({ page }) => {
    readerPage = new ReaderPage(page);
    libraryPage = new LibraryPage(page);
    await readerPage.goto();

    // Clear localStorage before each test to ensure clean state
    await page.evaluate(() => {
      localStorage.removeItem('readfaster_library');
    });
    await page.reload();
  });

  test('save text to library', async ({ page }) => {
    // Verify library is initially empty
    await libraryPage.expectLibraryCount(0);

    // Paste text into textarea
    await readerPage.pasteText(SAMPLE_TEXT);

    // Open library section
    await libraryPage.open();

    // Enter title and save
    const testTitle = 'My Test Article';
    await libraryPage.saveCurrentText(testTitle);

    // Expect text to appear in library list
    await libraryPage.expectTextInLibrary(testTitle);
    await libraryPage.expectLibraryCount(1);

    // Verify localStorage was updated
    const storedLibrary = await page.evaluate(() => {
      return localStorage.getItem('readfaster_library');
    });
    expect(storedLibrary).toBeTruthy();
    const parsed = JSON.parse(storedLibrary!);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
    expect(parsed[0].title).toBe(testTitle);
    expect(parsed[0].content).toBe(SAMPLE_TEXT);
  });

  test('load text from library (E2E-06)', async ({ page }) => {
    // Paste and save a text to library
    await readerPage.pasteText(SAMPLE_TEXT);
    const testTitle = 'Article to Load';
    await libraryPage.saveCurrentText(testTitle);

    // Clear textarea
    await page.locator('textarea').fill('');

    // Verify textarea is empty
    await expect(page.locator('textarea')).toHaveValue('');

    // Click on saved text in library to load it
    await libraryPage.loadText(testTitle);

    // Expect textarea to contain the saved text
    await expect(page.locator('textarea')).toHaveValue(SAMPLE_TEXT);
  });

  test('library persists across page reload (E2E-06)', async ({ page }) => {
    // Save text to library
    const testTitle = 'Persistent Article';
    await readerPage.pasteText(MEDIUM_TEXT);
    await libraryPage.saveCurrentText(testTitle);

    // Verify it's in library
    await libraryPage.expectTextInLibrary(testTitle);

    // Reload page
    await page.reload();

    // Open library after reload
    await libraryPage.open();

    // Expect saved text still in library list
    await libraryPage.expectTextInLibrary(testTitle);
    await libraryPage.expectLibraryCount(1);

    // Verify can still load it
    await page.locator('textarea').fill('');
    await libraryPage.loadText(testTitle);
    await expect(page.locator('textarea')).toHaveValue(MEDIUM_TEXT);
  });

  test('delete text from library', async ({ page }) => {
    // Save text to library
    const testTitle = 'Article to Delete';
    await readerPage.pasteText(SAMPLE_TEXT);
    await libraryPage.saveCurrentText(testTitle);

    // Verify it's in library
    await libraryPage.expectTextInLibrary(testTitle);
    await libraryPage.expectLibraryCount(1);

    // Click delete button on saved text
    await libraryPage.deleteText(testTitle);

    // Expect text removed from library list
    await libraryPage.expectTextNotInLibrary(testTitle);
    await libraryPage.expectLibraryCount(0);

    // Reload and verify still deleted
    await page.reload();
    await libraryPage.expectLibraryCount(0);
  });

  test('save multiple texts to library', async ({ page }) => {
    // Save first text
    await readerPage.pasteText(LIBRARY_ENTRIES[0].content);
    await libraryPage.saveCurrentText(LIBRARY_ENTRIES[0].title);
    await libraryPage.expectLibraryCount(1);

    // Save second text
    await page.locator('textarea').fill('');
    await readerPage.pasteText(LIBRARY_ENTRIES[1].content);
    await libraryPage.saveCurrentText(LIBRARY_ENTRIES[1].title);
    await libraryPage.expectLibraryCount(2);

    // Verify both are in library
    await libraryPage.expectTextInLibrary(LIBRARY_ENTRIES[0].title);
    await libraryPage.expectTextInLibrary(LIBRARY_ENTRIES[1].title);

    // Reload and verify persistence
    await page.reload();
    await libraryPage.expectLibraryCount(2);
  });

  test('library shows word count for saved texts', async ({ page }) => {
    // Save text to library
    const testTitle = 'Word Count Test';
    await readerPage.pasteText(SAMPLE_TEXT);
    await libraryPage.saveCurrentText(testTitle);

    // Open library
    await libraryPage.open();

    // Verify word count is displayed (SAMPLE_TEXT has 9 words)
    // Use .mb-6 to target the library section specifically
    const item = page.locator('.mb-6 .bg-white\\/5.rounded-lg').filter({ hasText: testTitle });
    await expect(item).toContainText('9 words');
  });

  test('library is initially empty', async ({ page }) => {
    await libraryPage.open();
    await libraryPage.expectLibraryEmpty();
    await libraryPage.expectLibraryCount(0);
  });

  test('library save button only appears when text is present', async ({ page }) => {
    // Open library with no text
    await libraryPage.open();

    // Save button should not be visible when textarea is empty
    const saveButton = page.locator('text=+ Save current text to library');
    await expect(saveButton).not.toBeVisible();

    // Close library
    await libraryPage.close();

    // Add some text
    await readerPage.pasteText(SAMPLE_TEXT);

    // Open library again
    await libraryPage.open();

    // Now save button should be visible
    await expect(saveButton).toBeVisible();
  });

  test('library localStorage key is correct', async ({ page }) => {
    // Save text
    await readerPage.pasteText(SAMPLE_TEXT);
    await libraryPage.saveCurrentText('Test');

    // Verify the correct localStorage key is used
    const storedLibrary = await page.evaluate(() => {
      return localStorage.getItem('readfaster_library');
    });
    expect(storedLibrary).toBeTruthy();
    expect(Array.isArray(JSON.parse(storedLibrary!))).toBe(true);
  });
});
