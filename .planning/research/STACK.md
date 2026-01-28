# Technology Stack: Testing Infrastructure

**Project:** ReadFaster Testing Infrastructure
**Researched:** January 28, 2026
**Domain:** Next.js 14 + React 18 + TypeScript speed reading app
**Overall Confidence:** HIGH

## Executive Summary

Testing stack for ReadFaster should use **Vitest 4.x** for unit/integration testing and **Playwright 1.57** for E2E testing. This combination provides modern, fast testing with minimal configuration overhead. Vitest is the clear winner over Jest for Next.js projects in 2026 due to speed (10-20x faster), native ESM support, and zero-config integration with TypeScript.

## Recommended Stack

### Core Testing Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vitest** | ^4.0.18 | Unit & integration testing | 10-20x faster than Jest, native ESM/TypeScript, zero-config with Next.js, watch mode out-of-box. Official Next.js recommendation. |
| **jsdom** | ^25.0.1 | DOM environment for Vitest | More accurate browser API emulation than happy-dom. Critical for testing DOM-heavy features (WordDisplay, SettingsModal). |
| **@vitejs/plugin-react** | ^4.3.4 | Vitest React support | Required for React component testing with JSX transformation. |
| **vite-tsconfig-paths** | ^5.1.4 | TypeScript path aliases | Resolves Next.js path aliases (`@/components`) in tests without config duplication. |

**Rationale:** Vitest 4.0 (released December 2025) brings stable browser mode and visual regression testing. Since ReadFaster uses Vite-adjacent tooling (TypeScript, ESM), Vitest's native support eliminates the transpilation overhead that makes Jest slow.

### React Testing Utilities

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **@testing-library/react** | ^16.3.1 | Component testing | Industry standard for user-centric React testing. Version 16+ includes React 18 concurrent features support. |
| **@testing-library/dom** | ^10.5.2 | DOM query utilities | Required peer dependency for @testing-library/react v16+. |
| **@testing-library/user-event** | ^14.6.1 | User interaction simulation | More realistic than `fireEvent` - simulates actual browser event sequences (click = mousedown + mouseup + click). |
| **@testing-library/jest-dom** | ^6.9.1 | Custom matchers | Provides semantic assertions (`toBeInTheDocument()`, `toBeDisabled()`). Works with Vitest despite the name. |

**Rationale:** React Testing Library enforces testing from user perspective, not implementation details. Version 16.3.1 (latest) supports React 18's concurrent rendering, which Next.js 14 uses. `user-event` v14 is critical for testing keyboard shortcuts (space, arrows) accurately.

### E2E Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Playwright** | ^1.57.0 | End-to-end testing | Cross-browser (Chrome, Firefox, Safari), faster and less flaky than Cypress (1.8% vs 6.5% flakiness in enterprise benchmarks), built-in parallelization, trace viewer for debugging. |
| **@playwright/test** | ^1.57.0 | Playwright test runner | Includes assertions, fixtures, parallelization. Better DX than standalone playwright package. |

**Rationale:** Playwright over Cypress because:
1. **Speed:** 14 minutes vs 90 minutes on enterprise test suites (same CI budget)
2. **Safari support:** Critical for validating RSVP animation rendering across WebKit
3. **Native parallelization:** No paid tier needed (Cypress requires paid plan for parallelization)
4. **Lower flakiness:** Auto-waits for actionability (visible + stable + enabled) before interaction
5. **Next.js integration:** First-class support for testing Server Components (async components that Vitest can't test)

Cypress wins on debugging experience, but Playwright's trace viewer + UI mode is close enough.

### Code Coverage

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| **@vitest/coverage-v8** | ^4.0.18 | Coverage reporting | Default Vitest coverage provider. As of Vitest 3.2+, V8 uses AST-based remapping for Istanbul-level accuracy at 10x speed. |

**Rationale:** V8 coverage over Istanbul because:
- **Performance:** 10% overhead vs 300% overhead (Istanbul maintainer's own benchmark)
- **Accuracy:** Post-v3.2 AST remapping eliminates V8's historical blind spots
- **No transpilation:** Works directly with V8 profiler, no Babel instrumentation needed

Istanbul only makes sense for non-V8 runtimes (Firefox, Bun, Cloudflare Workers) or if you hit specific JSX ternary blind spots (rare).

### API Mocking (Optional, post-MVP)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **msw** | ^2.12.7 | Network request mocking | If testing URL fetching feature, mock fetch at network level (not function level). Works in both Vitest and Playwright. |

**Rationale:** MSW intercepts at network level (Service Worker in browser, http interceptor in Node), so mocks work identically in unit tests, E2E tests, and Storybook. More realistic than mocking `fetch` directly. **However**, ReadFaster's URL fetching is simple text extraction - may not need mocking for MVP testing.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Unit testing framework | **Vitest 4.x** | Jest 29.x | Jest is 10-20x slower, requires complex config for ESM/TypeScript, experimental ESM support still buggy. Only choose Jest for React Native (mandatory) or if team is deeply invested in Jest ecosystem. |
| DOM environment | **jsdom** | happy-dom | happy-dom is faster but missing browser APIs. ReadFaster uses `localStorage` heavily + file reading APIs - jsdom's completeness is worth the speed tradeoff. |
| E2E framework | **Playwright 1.57** | Cypress 13.x | Cypress has better debugging (time-travel), but Playwright is 6x faster, cross-browser (Safari), lower flakiness (1.8% vs 6.5%), and free parallelization. Playwright's trace viewer + UI mode bridges the debugging gap. |
| Coverage | **@vitest/coverage-v8** | @vitest/coverage-istanbul | V8 is now as accurate as Istanbul (post-v3.2) but 10x faster. Istanbul only needed for non-V8 runtimes or specific JSX blind spots (which ReadFaster doesn't have). |
| User events | **@testing-library/user-event** | fireEvent | fireEvent dispatches single events (one `click`). user-event simulates real sequences (`hover` → `mousedown` → `focus` → `mouseup` → `click`). Critical for testing keyboard shortcuts properly. |

## Installation

### 1. Core Vitest Setup

```bash
npm install -D vitest @vitejs/plugin-react jsdom vite-tsconfig-paths
```

### 2. React Testing Library

```bash
npm install -D @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom
```

### 3. Playwright (E2E)

```bash
npm init playwright@latest
```

Follow prompts:
- TypeScript: Yes (matches project)
- Tests folder: `e2e` or `tests/e2e`
- GitHub Actions: Yes (CI workflow)
- Install browsers: Yes

### 4. Coverage

```bash
npm install -D @vitest/coverage-v8
```

### 5. Optional: API Mocking (post-MVP)

```bash
npm install -D msw@latest
npx msw init public/ --save
```

## Configuration Files

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.tsx',
        'src/**/__tests__/**',
      ],
    },
  },
})
```

### tests/setup.ts

```typescript
import '@testing-library/jest-dom/vitest'

// Mock localStorage (if needed for isolated tests)
const localStorageMock: Storage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    key: (index: number) => Object.keys(store)[index] || null,
    length: Object.keys(store).length,
  }
})()

// Only mock if not available (jsdom provides localStorage, but can be flaky)
if (typeof window !== 'undefined' && !window.localStorage) {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })
}
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
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
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### package.json scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

## Testing Strategy by Component Type

| Component Type | Test With | Why |
|---------------|-----------|-----|
| **Pure logic** (tokenize, calculatePivot) | Vitest unit tests | Fast, no DOM needed. Test edge cases exhaustively. |
| **Hooks** (useRSVP, useLibrary, useSettings) | Vitest + @testing-library/react | Test state transitions, localStorage interactions. Mock timers for `useRSVP` intervals. |
| **UI components** (WordDisplay, Controls, SettingsModal) | Vitest + React Testing Library | Test user interactions (click, type), accessibility, conditional rendering. |
| **Integration flows** (paste text → tokenize → display) | Vitest integration tests | Test multiple units together. Ensure data flows correctly through hooks and components. |
| **Full user journeys** (load text → adjust WPM → play → pause → save to library) | Playwright E2E | Test in real browser. Validate localStorage persistence, keyboard shortcuts, file uploads. |

## What NOT to Add

| Anti-Pattern | Why Avoid | Instead |
|--------------|-----------|---------|
| **Enzyme** | Deprecated, React 18 support abandoned, promotes testing implementation details (shallow rendering). | Use React Testing Library exclusively. |
| **Snapshot tests for UI** | Brittle (break on any HTML change), hard to review diffs, give false confidence. | Test user-facing behavior (text content, accessibility, interactions). |
| **100% coverage goal** | Encourages testing implementation, not behavior. 80% is ideal target. | Focus on critical paths: RSVP logic, persistence, user interactions. |
| **Testing library for Storybook** | Storybook is for visual documentation, not testing. Adds complexity without value. | Use Playwright visual regression if needed (post-MVP). |
| **Multiple test runners** | Jest + Vitest creates config duplication and confusion. | Pick one: Vitest for all unit/integration tests. |
| **Mocking everything** | Over-mocking tests implementation, not integration. Tests become useless. | Only mock external dependencies (fetch, timers, file system). Test real localStorage, real DOM events. |

## Known Limitations

### Vitest + Next.js

1. **Async Server Components not supported:** Vitest cannot test `async` React Server Components. ReadFaster doesn't use Server Components (uses client-side rendering), so this is not a blocker.

2. **Next.js-specific imports:** Some Next.js imports (`next/navigation`, `next/image`) need mocking. Use `vi.mock()` in setup file.

### Playwright

1. **File upload testing:** `page.setInputFiles()` works for `<input type="file">`, but ReadFaster's drag-and-drop may need extra testing.

2. **localStorage in E2E:** Playwright runs in real browser, so localStorage persists between tests unless explicitly cleared. Use `page.evaluate(() => localStorage.clear())` in `beforeEach`.

## Version Compatibility Matrix

| Package | Version | Requires |
|---------|---------|----------|
| vitest | ^4.0.18 | Node.js >=20.0.0, Vite >=6.0.0 |
| @testing-library/react | ^16.3.1 | React >=18.0.0 |
| playwright | ^1.57.0 | Node.js 20.x, 22.x, or 24.x |
| @testing-library/user-event | ^14.6.1 | @testing-library/dom >=8.0.0 |

ReadFaster's current stack (Next.js 14.2, React 18.2, TypeScript 5.3, Node.js 20) is fully compatible with all recommended testing tools.

## Confidence Assessment

| Area | Confidence | Source | Notes |
|------|------------|--------|-------|
| Vitest setup | **HIGH** | Official Next.js docs, Vitest 4.0 release notes | Next.js officially recommends Vitest. Configuration verified in Next.js examples repo. |
| React Testing Library | **HIGH** | Official RTL docs, npm registry | Version 16.3.1 confirmed latest. React 18 support validated. |
| Playwright | **HIGH** | Official Playwright docs, multiple 2026 benchmarks | Version 1.57.0 confirmed latest. Flakiness + speed benchmarks from enterprise case studies. |
| Vitest vs Jest decision | **HIGH** | Multiple 2026 comparison articles, Vercel community consensus | 10-20x speed improvement verified across multiple sources. Jest only recommended for React Native. |
| Playwright vs Cypress decision | **HIGH** | 2026 enterprise comparison studies, 500-test benchmark article | Playwright 6x faster with 3.6x lower flakiness in real-world benchmarks. |
| Coverage tooling | **HIGH** | Vitest official docs, V8 vs Istanbul discussions | V8 accuracy improvements (AST remapping) confirmed in Vitest 3.2+ release notes. |

## Migration Notes (for future reference)

If switching from Jest to Vitest later:

1. **Config:** Replace `jest.config.js` with `vitest.config.ts`
2. **Globals:** Vitest auto-imports `describe`, `it`, `expect` (no manual imports needed)
3. **Mocks:** `jest.fn()` → `vi.fn()`, `jest.mock()` → `vi.mock()`
4. **Timers:** `jest.useFakeTimers()` → `vi.useFakeTimers()`
5. **Matchers:** jest-dom matchers work identically with Vitest import

Transition is nearly trivial - most tests run unchanged except mock function names.

## Sources

### Official Documentation
- [Vitest Guide](https://vitest.dev/guide/) - Vitest v4.0.17 documentation
- [Testing: Vitest | Next.js](https://nextjs.org/docs/app/guides/testing/vitest) - Next.js official Vitest integration guide
- [Playwright Documentation](https://playwright.dev/docs/intro) - Playwright v1.57 documentation
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - Official RTL documentation
- [Mock Service Worker](https://mswjs.io/) - MSW official documentation

### Vitest vs Jest Comparisons (2026)
- [Jest vs Vitest: Which Test Runner Should You Use in 2025?](https://medium.com/@ruverd/jest-vs-vitest-which-test-runner-should-you-use-in-2025-5c85e4f2bda9)
- [Vitest vs Jest - Which Should I Use for My Next.js App?](https://www.wisp.blog/blog/vitest-vs-jest-which-should-i-use-for-my-nextjs-app)
- [Testing in 2026: Jest, React Testing Library, and Full Stack Testing Strategies](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies)

### Playwright vs Cypress Comparisons (2026)
- [Cypress vs Playwright: I Ran 500 E2E Tests in Both. Here's What Broke.](https://medium.com/lets-code-future/cypress-vs-playwright-i-ran-500-e2e-tests-in-both-heres-what-broke-2afc448470ee)
- [Playwright vs Cypress: The 2026 Enterprise Testing Guide](https://devin-rosario.medium.com/playwright-vs-cypress-the-2026-enterprise-testing-guide-ade8b56d3478)

### React Testing Library Best Practices
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Best Practices for Using React Testing Library](https://medium.com/@ignatovich.dm/best-practices-for-using-react-testing-library-0f71181bb1f4)

### Coverage & Configuration
- [Coverage | Guide | Vitest](https://vitest.dev/guide/coverage) - V8 vs Istanbul comparison
- [Using Testing Library jest-dom with Vitest](https://markus.oberlehner.net/blog/using-testing-library-jest-dom-with-vitest)
- [jsdom vs happy-dom: Navigating the Nuances](https://blog.seancoughlin.me/jsdom-vs-happy-dom-navigating-the-nuances-of-javascript-testing)

### Package Versions
- [Vitest 4.0 is out!](https://vitest.dev/blog/vitest-4) - Vitest 4.0 release announcement
- [@testing-library/react npm](https://www.npmjs.com/package/@testing-library/react) - Version 16.3.1
- [Playwright Release notes](https://playwright.dev/docs/release-notes) - Version 1.57.0
- [MSW npm](https://www.npmjs.com/package/msw) - Version 2.12.7
