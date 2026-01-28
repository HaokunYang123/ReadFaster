# Phase 5: E2E Tests & CI/CD - Research

**Researched:** 2026-01-28
**Domain:** End-to-end testing with Playwright and CI/CD automation
**Confidence:** HIGH

## Summary

Phase 5 requires implementing comprehensive E2E tests using Playwright to validate critical user workflows across multiple browsers (Chrome, Firefox, Safari/WebKit), plus establishing a GitHub Actions CI/CD pipeline that enforces quality gates through coverage thresholds and test success requirements.

The standard approach combines Playwright's multi-browser testing capabilities with Next.js integration, organized using the Page Object Model pattern for maintainability. Vitest's existing coverage infrastructure can be extended with threshold enforcement and ratchet effects to prevent coverage regression. GitHub Actions provides native support for Playwright through official actions and Docker images, with sequential job dependencies ensuring unit/integration tests run before expensive E2E tests.

**Primary recommendation:** Use Playwright with native browser automation, organize tests by user flow (reading-flow.spec.ts, settings.spec.ts, library.spec.ts), implement coverage thresholds with autoUpdate for ratcheting, and structure CI with sequential jobs (unit → integration → E2E) using the `needs` keyword.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @playwright/test | Latest (1.58+) | E2E testing framework | Official Microsoft framework with native multi-browser support (Chromium, Firefox, WebKit), auto-waiting, parallel execution, and rich debugging tools |
| @vitest/coverage-v8 | 4.x (existing) | Code coverage | Already configured, V8 provider is faster than Istanbul with lower memory usage |
| vitest | 4.x (existing) | Test runner for unit/integration | Already in use, provides coverage thresholds with autoUpdate for ratchet effect |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| actions/checkout@v4 | v4 | GitHub Actions checkout | CI pipeline setup (standard for all workflows) |
| actions/setup-node@v4 | v4 | Node.js installation in CI | CI pipeline setup |
| actions/upload-artifact@v4 | v4 | Upload test reports/screenshots | When tests fail and artifacts needed for debugging |
| actions/cache@v4 | v4 | Cache node_modules | Optional - cache npm dependencies (NOT Playwright browsers per official guidance) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Playwright | Cypress | Cypress has better DX but doesn't support WebKit/Safari testing, requires Chrome-based runner |
| Playwright | Selenium | Selenium is older, more verbose, lacks auto-waiting, harder to debug |
| V8 coverage | Istanbul | Istanbul works on any runtime but slower, higher memory usage, requires pre-transpiling |
| GitHub Actions | Jenkins, CircleCI | More complex setup, GitHub Actions is native to repository and free for public repos |

**Installation:**
```bash
npm install -D @playwright/test
npx playwright install --with-deps
```

## Architecture Patterns

### Recommended Project Structure
```
tests/
├── e2e/                     # E2E test files
│   ├── reading-flow.spec.ts     # E2E-01: Complete reading workflow
│   ├── keyboard.spec.ts         # E2E-02: Keyboard shortcuts
│   ├── focus-mode.spec.ts       # E2E-03, E2E-04: Focus mode behaviors
│   ├── settings.spec.ts         # E2E-05: Settings persistence
│   └── library.spec.ts          # E2E-06: Library save/load
├── pages/                   # Page Object Model classes
│   ├── ReaderPage.ts           # Main reader page interactions
│   ├── SettingsPage.ts         # Settings modal interactions
│   └── LibraryPage.ts          # Library modal interactions
├── fixtures/                # Test data and helpers
│   └── test-data.ts            # Sample texts, settings configs
└── playwright.config.ts     # Playwright configuration
.github/
└── workflows/
    └── test.yml             # CI/CD pipeline
vitest.config.mts           # Coverage thresholds configuration
```

### Pattern 1: Page Object Model (POM)
**What:** Encapsulate page interactions and element locators in reusable classes
**When to use:** For all E2E tests to maintain DRY principle and simplify maintenance
**Example:**
```typescript
// Source: https://playwright.dev/docs/pom
import { expect, type Locator, type Page } from '@playwright/test';

export class ReaderPage {
  readonly page: Page;
  readonly textInput: Locator;
  readonly startButton: Locator;
  readonly pauseButton: Locator;
  readonly wordDisplay: Locator;
  readonly focusModeOverlay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textInput = page.locator('[data-testid="text-input"]');
    this.startButton = page.getByRole('button', { name: /start/i });
    this.pauseButton = page.getByRole('button', { name: /pause/i });
    this.wordDisplay = page.locator('[data-testid="word-display"]');
    this.focusModeOverlay = page.locator('[data-testid="focus-mode"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async pasteText(text: string) {
    await this.textInput.fill(text);
  }

  async startReading() {
    await this.startButton.click();
  }

  async expectFocusModeActive() {
    await expect(this.focusModeOverlay).toBeVisible();
  }
}
```

### Pattern 2: Keyboard Testing with page.keyboard
**What:** Simulate keyboard interactions using Playwright's keyboard API
**When to use:** Testing keyboard shortcuts (space for play/pause, arrows for speed adjustment)
**Example:**
```typescript
// Source: https://playwright.dev/docs/api/class-keyboard
await page.keyboard.press('Space'); // Play/pause toggle
await page.keyboard.press('ArrowUp'); // Increase speed
await page.keyboard.press('ArrowDown'); // Decrease speed
await page.keyboard.press('ArrowLeft'); // Previous word
await page.keyboard.press('ArrowRight'); // Next word
```

### Pattern 3: localStorage Testing with page.evaluate
**What:** Access and verify localStorage state across page reloads
**When to use:** Testing settings and library persistence (E2E-05, E2E-06)
**Example:**
```typescript
// Source: https://www.browserstack.com/guide/playwright-local-storage
// Save settings
await page.evaluate(() => {
  localStorage.setItem('settings', JSON.stringify({ wpm: 500, font: 'Arial' }));
});

// Reload page
await page.reload();

// Verify persistence
const settings = await page.evaluate(() => {
  return JSON.parse(localStorage.getItem('settings') || '{}');
});
expect(settings.wpm).toBe(500);
```

### Pattern 4: Multi-Browser Configuration
**What:** Configure projects in playwright.config.ts for parallel browser testing
**When to use:** Always - requirement E2E-07, E2E-08, E2E-09
**Example:**
```typescript
// Source: https://playwright.dev/docs/test-projects
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] }, // 375px viewport
    },
  ],
});
```

### Pattern 5: Sequential CI Jobs with needs
**What:** Use `needs` keyword to enforce job dependencies in GitHub Actions
**When to use:** Ensure unit/integration tests pass before running E2E tests
**Example:**
```yaml
# Source: https://resources.github.com/learn/pathways/automation/essentials/application-testing-with-github-actions/
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test

  integration-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:integration

  e2e-tests:
    needs: integration-tests
    runs-on: ubuntu-latest
    steps:
      - run: npx playwright test
```

### Pattern 6: Coverage Thresholds with Ratchet Effect
**What:** Use Vitest's autoUpdate feature to prevent coverage regression
**When to use:** Enforce QUAL-01, QUAL-02 requirements
**Example:**
```typescript
// Source: https://vitest.dev/config/coverage
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      thresholds: {
        lines: 75,        // QUAL-01: 75% minimum overall
        branches: 75,
        functions: 75,
        statements: 75,
        perFile: true,    // Per-file enforcement
        autoUpdate: true, // Ratchet effect
        '**/{rsvp,useRSVP,useSettings,useLibrary}.{ts,tsx}': {
          lines: 90,      // QUAL-02: Critical paths 90%+
          branches: 90,
          functions: 90,
          statements: 90,
        },
      },
    },
  },
});
```

### Anti-Patterns to Avoid
- **Hard-coded waits (`page.waitForTimeout()`)**: Playwright has auto-waiting, use `expect()` with assertions instead
- **Generic selectors (`.button`, `div > span`)**: Brittle when UI changes, use semantic selectors (`getByRole`, `getByLabel`) or `data-testid`
- **Global variables in tests**: Causes test coupling and race conditions, use fixtures instead
- **Running E2E tests for every commit**: Too slow and expensive, reserve for PR/push to main
- **Caching Playwright browsers**: Official guidance says cache restore time equals download time, not worth it
- **Testing pure logic in E2E tests**: Use unit tests for business logic, E2E for browser-dependent behavior only

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Browser automation | Custom Selenium wrapper | Playwright's built-in API | Auto-waiting, parallel execution, debugging tools, mobile emulation already included |
| Screenshot comparison | Custom image diffing | Playwright's `toHaveScreenshot()` | Handles pixel differences, retries, threshold configuration |
| Multi-browser execution | Manual browser switching | Playwright projects config | Parallel execution across browsers, shared base config |
| Test reporting | Custom HTML generator | Playwright's built-in HTML reporter | Screenshots, videos, traces included, filterable |
| Coverage ratcheting | Manual CI scripts | Vitest `autoUpdate` | Automatic threshold updates, prevents regression |
| CI browser setup | Manual install scripts | `npx playwright install --with-deps` | Handles OS dependencies, browser versions |

**Key insight:** Playwright and Vitest have mature ecosystems with battle-tested solutions for common E2E and coverage problems. Custom solutions introduce maintenance burden and miss edge cases (async waiting, race conditions, cross-browser quirks, coverage calculation nuances).

## Common Pitfalls

### Pitfall 1: Flaky Selectors Due to Dynamic UI
**What goes wrong:** Tests pass locally but fail in CI because selectors rely on timing assumptions or framework-specific rendering
**Why it happens:** Modern React apps mount/unmount/re-render constantly, CSS-in-JS changes class hashes, hydration re-renders components
**How to avoid:**
- Use semantic selectors (`getByRole('button', { name: /start/i })`) that reflect user behavior
- Add stable `data-testid` attributes for dynamic elements
- Avoid structural selectors (`.container > div:nth-child(2)`)
**Warning signs:** Tests that fail intermittently, different results between local and CI, failures after unrelated UI changes

### Pitfall 2: Race Conditions in localStorage Tests
**What goes wrong:** Tests check localStorage immediately after action but value hasn't been written yet
**Why it happens:** localStorage operations may be async in some contexts, React state updates are batched
**How to avoid:**
- Use `expect.poll()` for async localStorage checks
- Wait for visible UI changes before checking persistence
- Use `page.waitForFunction()` to poll for localStorage state
**Warning signs:** Tests fail with "null" or "undefined" when checking localStorage, pass on retry

### Pitfall 3: Browser Binary Cache Overhead
**What goes wrong:** CI runs slower after adding browser caching, cache size grows large
**Why it happens:** Playwright browser binaries are large (~1GB), cache restore time equals download time per official docs
**How to avoid:** Don't cache Playwright browsers, cache only `node_modules` with lockfile hash
**Warning signs:** CI cache steps take 30s+, cache size warnings in GitHub Actions logs

### Pitfall 4: Missing Mobile Viewport Testing
**What goes wrong:** Focus mode UI breaks on mobile, controls overlap, click targets too small
**Why it happens:** Desktop-only testing misses responsive breakpoints, touch events behave differently
**How to avoid:**
- Add mobile viewport project (`devices['iPhone 12']` gives 375px width)
- Test focus mode activation/exit on mobile viewport
- Verify keyboard shortcuts have touch alternatives
**Warning signs:** Production bug reports from mobile users, responsive CSS not tested

### Pitfall 5: Coverage Thresholds Block Legitimate Changes
**What goes wrong:** Adding new uncovered code causes CI to fail even if overall coverage is good
**Why it happens:** Global thresholds apply to all new files, including experimental features
**How to avoid:**
- Use per-file thresholds for critical paths only (`rsvp.ts`, `useRSVP.ts` at 90%+)
- Set realistic global threshold (75% not 100%)
- Use `autoUpdate` to ratchet up when coverage improves
**Warning signs:** Developers disable coverage checks, PRs blocked by coverage for exploratory code

### Pitfall 6: E2E Tests Run Before Unit Tests Fail
**What goes wrong:** CI runs all test jobs in parallel, E2E tests waste CI minutes even when unit tests fail
**Why it happens:** Default GitHub Actions jobs run in parallel without dependencies
**How to avoid:** Use `needs` keyword to create sequential pipeline: unit → integration → E2E
**Warning signs:** CI logs show E2E tests starting/failing while unit tests are still running

### Pitfall 7: Screenshots on Every Test Run
**What goes wrong:** CI artifacts fill up storage, test runs slow down significantly
**Why it happens:** Default Playwright config may capture screenshots/videos/traces for all tests
**How to avoid:**
- Set `screenshot: 'only-on-failure'`
- Set `trace: 'on-first-retry'` (not 'on' for all tests)
- Don't enable video unless debugging specific issue
**Warning signs:** test-results/ directory grows to 100MB+, artifact upload takes 2+ minutes

## Code Examples

Verified patterns from official sources:

### Complete Reading Flow Test (E2E-01)
```typescript
// Source: Combined from Playwright docs and Next.js guide
import { test, expect } from '@playwright/test';
import { ReaderPage } from './pages/ReaderPage';

test.describe('Complete reading flow', () => {
  test('user can paste text, play, pause, resume, and complete reading', async ({ page }) => {
    const reader = new ReaderPage(page);
    await reader.goto();

    // Paste text
    await reader.pasteText('hello world test');

    // Play
    await reader.startReading();
    await reader.expectFocusModeActive();
    await expect(reader.wordDisplay).toHaveText('hello');

    // Pause
    await page.keyboard.press('Space');
    await expect(reader.pauseButton).toBeVisible();

    // Resume
    await reader.startReading();

    // Complete (let timer run through all words)
    await page.waitForTimeout(3000); // Allow completion
    await expect(reader.focusModeOverlay).not.toBeVisible();
  });
});
```

### Multi-Browser Test Configuration
```typescript
// Source: https://playwright.dev/docs/test-configuration
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 },
      },
    },
  ],

  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### GitHub Actions CI Pipeline
```yaml
# Source: https://playwright.dev/docs/ci-intro
name: Playwright Tests
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test

  integration-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test -- src/__tests__/integration

  e2e-tests:
    needs: integration-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  coverage:
    needs: integration-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:coverage
      - name: Check coverage thresholds
        run: |
          npm run test:coverage -- --reporter=json --reporter=text
```

### Vitest Coverage Configuration with Ratchet Effect
```typescript
// Source: https://vitest.dev/config/coverage
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      exclude: [
        'node_modules/**',
        'src/test-utils/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      thresholds: {
        lines: 75,
        branches: 75,
        functions: 75,
        statements: 75,
        autoUpdate: true, // Ratchet effect
      },
    },
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Selenium with manual waits | Playwright with auto-waiting | 2020-2021 | Fewer flaky tests, simpler test code |
| Separate tools per browser | Playwright multi-browser support | 2020 | Single API for Chrome/Firefox/Safari |
| Istanbul coverage | V8 coverage | 2022-2023 | Faster execution, lower memory usage |
| Manual coverage tracking | Vitest `autoUpdate` threshold | 2023-2024 | Automated ratchet effect |
| Cypress (Chrome-only) | Playwright (all browsers) | 2021-2022 | True cross-browser testing including Safari |
| Test-only CI runs | Sequential pipeline with `needs` | 2022+ | Faster feedback, reduced CI waste |

**Deprecated/outdated:**
- **Selenium WebDriver**: Still works but verbose, manual waiting, poor debugging experience compared to Playwright
- **Protractor**: Officially deprecated by Angular team in 2021, replaced by Playwright or Cypress
- **PhantomJS**: Headless browser discontinued in 2018, replaced by Chrome/Firefox headless modes
- **Browser caching in CI**: Playwright team recommends against it as of 2023 (restore time ≈ download time)

## Open Questions

Things that couldn't be fully resolved:

1. **Per-directory coverage thresholds in Vitest**
   - What we know: Vitest supports per-file glob patterns for thresholds
   - What's unclear: Exact syntax for targeting "critical paths" directory vs individual files
   - Recommendation: Use file-level globs (`**/{rsvp,useRSVP}.{ts,tsx}`) until per-directory syntax confirmed

2. **Mobile viewport testing coverage**
   - What we know: CONTEXT.md requires mobile viewport (375px width) testing
   - What's unclear: Should all E2E tests run on both desktop AND mobile, or just focus-mode tests?
   - Recommendation: Run all tests on desktop (Chrome/Firefox/WebKit), run subset (focus-mode, click-to-pause) on mobile viewport

3. **Coverage threshold enforcement in CI**
   - What we know: Vitest fails tests when thresholds not met
   - What's unclear: Does `autoUpdate` write to config file in CI, or just check?
   - Recommendation: Use `autoUpdate: true` locally to update thresholds, commit changes, CI checks against committed thresholds

## Sources

### Primary (HIGH confidence)
- [Playwright Official Docs - Introduction](https://playwright.dev/docs/intro) - Browser support, version info
- [Playwright Official Docs - Configuration](https://playwright.dev/docs/test-configuration) - Multi-browser projects, screenshot/trace config
- [Playwright Official Docs - CI Setup](https://playwright.dev/docs/ci) - GitHub Actions, caching guidance
- [Playwright Official Docs - Page Object Model](https://playwright.dev/docs/pom) - POM pattern principles
- [Playwright Official Docs - Keyboard API](https://playwright.dev/docs/api/class-keyboard) - Keyboard testing methods
- [Next.js Official Docs - Playwright Testing](https://nextjs.org/docs/pages/guides/testing/playwright) - Next.js integration
- [Vitest Official Docs - Coverage](https://vitest.dev/guide/coverage) - V8 vs Istanbul providers
- [Vitest Official Docs - Coverage Config](https://vitest.dev/config/coverage) - Threshold options, autoUpdate

### Secondary (MEDIUM confidence)
- [Strapi Blog - Next.js Testing Guide](https://strapi.io/blog/nextjs-testing-guide-unit-and-e2e-tests-with-vitest-and-playwright) - Next.js + Vitest + Playwright integration patterns
- [BrowserStack - Playwright Best Practices 2026](https://www.browserstack.com/guide/playwright-best-practices) - Community best practices verified against official docs
- [GitHub Resources - Application Testing with GitHub Actions](https://resources.github.com/learn/pathways/automation/essentials/application-testing-with-github-actions/) - Sequential job patterns with `needs`
- [Medium - Vitest Code Coverage with GitHub Actions](https://medium.com/@alvarado.david/vitest-code-coverage-with-github-actions-report-compare-and-block-prs-on-low-coverage-67fceaa79a47) - Coverage enforcement in CI
- [BrowserStack - Playwright Local Storage](https://www.browserstack.com/guide/playwright-local-storage) - localStorage testing patterns
- [Medium - Page Object Model in Playwright with TypeScript](https://medium.com/@anandpak108/page-object-model-in-playwright-with-typescript-best-practices-133fb349c462) - POM implementation verified against official docs

### Tertiary (LOW confidence)
- Community blog posts about Playwright pitfalls (marked for validation)
- Stack Overflow discussions about coverage thresholds (needs official verification)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Playwright/Vitest docs confirm versions, features, and compatibility
- Architecture: HIGH - Patterns verified from official Playwright docs and Next.js guide
- Pitfalls: MEDIUM - Combination of official docs (cache, selectors) and community experience (needs validation during implementation)
- Coverage enforcement: HIGH - Official Vitest docs confirm autoUpdate and threshold configuration

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - Playwright and Vitest are stable, fast-moving framework changes unlikely)
