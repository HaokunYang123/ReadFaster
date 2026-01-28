import { test, expect } from '@playwright/test';
import { ReaderPage } from './pages/ReaderPage';
import { SettingsPage } from './pages/SettingsPage';
import { TEST_SETTINGS, PIVOT_COLORS } from './fixtures/test-data';

test.describe('Settings persistence', () => {
  let readerPage: ReaderPage;
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    readerPage = new ReaderPage(page);
    settingsPage = new SettingsPage(page);
    await readerPage.goto();
  });

  test('settings modal opens and closes', async ({ page }) => {
    // Click settings button (gear icon in header)
    await readerPage.openSettings();

    // Expect modal to be visible
    await settingsPage.expectModalVisible();

    // Close via X button
    await settingsPage.close();

    // Expect modal to be hidden
    await settingsPage.expectModalHidden();

    // Reopen and close via Done button
    await readerPage.openSettings();
    await settingsPage.expectModalVisible();
    await settingsPage.clickDone();
    await settingsPage.expectModalHidden();
  });

  test('pivot color changes persist across reload (E2E-05)', async ({ page }) => {
    // Open settings
    await settingsPage.open();

    // Get initial color (should be default red)
    const initialColor = TEST_SETTINGS.default.pivotColor;

    // Change pivot color (select sky blue - index 4)
    await settingsPage.selectPivotColorByIndex(4); // Sky Blue #0099FF

    // Close settings
    await settingsPage.clickDone();

    // Verify localStorage has the new color via page.evaluate
    const storedSettings = await page.evaluate(() => {
      return localStorage.getItem('readfaster_settings');
    });
    expect(storedSettings).toBeTruthy();
    const parsed = JSON.parse(storedSettings!);
    expect(parsed.pivotColor).toBe(PIVOT_COLORS[4]);

    // Reload page
    await page.reload();

    // Open settings again
    await settingsPage.open();

    // Expect selected color to still be selected (sky blue swatch should have border-white)
    // Use nth() since style matching can be unreliable with color formats
    const pivotColorSwatches = page.locator('.fixed.inset-0.z-50 button[style*="background-color"]');
    // Sky blue is index 4
    await expect(pivotColorSwatches.nth(4)).toHaveClass(/border-white/);

    // Verify localStorage still has the color after reload
    const storedAfterReload = await page.evaluate(() => {
      return localStorage.getItem('readfaster_settings');
    });
    expect(storedAfterReload).toBeTruthy();
    const parsedAfterReload = JSON.parse(storedAfterReload!);
    expect(parsedAfterReload.pivotColor).toBe(PIVOT_COLORS[4]);
  });

  test('font settings persist across reload', async ({ page }) => {
    // Open settings
    await settingsPage.open();

    // Change font family to serif
    await settingsPage.selectFontFamily('serif');

    // Change font size to large
    await settingsPage.selectFontSize('large');

    // Change font weight to bold
    await settingsPage.selectFontWeight('bold');

    // Close settings
    await settingsPage.clickDone();

    // Verify localStorage has the new settings
    const storedSettings = await page.evaluate(() => {
      return localStorage.getItem('readfaster_settings');
    });
    expect(storedSettings).toBeTruthy();
    const parsed = JSON.parse(storedSettings!);
    expect(parsed.fontFamily).toBe('serif');
    expect(parsed.fontSize).toBe('large');
    expect(parsed.fontWeight).toBe('bold');

    // Reload page
    await page.reload();

    // Open settings again
    await settingsPage.open();

    // Verify all font settings retained
    expect(await settingsPage.getFontFamily()).toBe('serif');
    expect(await settingsPage.getFontSize()).toBe('large');
    expect(await settingsPage.getFontWeight()).toBe('bold');
  });

  test('pivot highlight toggle persists across reload', async ({ page }) => {
    // Open settings
    await settingsPage.open();

    // Verify pivot highlight is enabled by default
    expect(await settingsPage.isPivotHighlightEnabled()).toBe(true);

    // Disable pivot highlight
    await settingsPage.togglePivotHighlight();
    expect(await settingsPage.isPivotHighlightEnabled()).toBe(false);

    // Close settings
    await settingsPage.clickDone();

    // Reload page
    await page.reload();

    // Open settings again
    await settingsPage.open();

    // Verify pivot highlight is still disabled
    expect(await settingsPage.isPivotHighlightEnabled()).toBe(false);
  });

  test('reset settings restores defaults', async ({ page }) => {
    // Open settings
    await settingsPage.open();

    // Change multiple settings
    await settingsPage.selectFontFamily('serif');
    await settingsPage.selectFontSize('large');
    await settingsPage.selectFontWeight('bold');
    await settingsPage.selectPivotColorByIndex(3); // Lime Green

    // Verify changes
    expect(await settingsPage.getFontFamily()).toBe('serif');

    // Click reset button
    await settingsPage.resetToDefaults();

    // Expect all settings to return to defaults (default fontWeight is 'medium' per DEFAULT_SETTINGS)
    expect(await settingsPage.getFontFamily()).toBe('monospace');
    expect(await settingsPage.getFontSize()).toBe('medium');
    expect(await settingsPage.getFontWeight()).toBe('medium');
    expect(await settingsPage.isPivotHighlightEnabled()).toBe(true);

    // Check the default color (red) is selected - use nth() for reliability
    const pivotColorSwatches = page.locator('.fixed.inset-0.z-50 button[style*="background-color"]');
    // First swatch (index 0) is red and should have border-white when selected
    await expect(pivotColorSwatches.first()).toHaveClass(/border-white/);
  });

  test('settings localStorage key is correct', async ({ page }) => {
    // Open settings and make a change
    await settingsPage.open();
    await settingsPage.selectFontFamily('sans');
    await settingsPage.clickDone();

    // Verify the correct localStorage key is used
    const storedSettings = await page.evaluate(() => {
      return localStorage.getItem('readfaster_settings');
    });
    expect(storedSettings).toBeTruthy();
    expect(JSON.parse(storedSettings!).fontFamily).toBe('sans');
  });
});
