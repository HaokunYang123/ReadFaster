# Test Architecture for Next.js 14 Projects

**Project:** ReadFaster
**Researched:** 2026-01-28
**Confidence:** HIGH

## Executive Summary

Testing architecture for Next.js 14 with App Router follows a **hybrid colocation strategy**: unit tests live alongside source code, integration tests reside in feature directories, and E2E tests occupy a top-level directory. Modern Next.js projects favor **Vitest** over Jest for speed (10-20x faster) while maintaining compatibility with React Testing Library patterns.

The ReadFaster project has an ideal structure for testing integration: pure utility functions (`src/utils/`), testable custom hooks (`src/hooks/`), presentational components (`src/components/`), and an API route. Each category has distinct testing requirements and file placement strategies.

## Recommended Test Architecture

### Three-Tier Testing Strategy

```
ReadFaster/
├── src/
│   ├── utils/
│   │   ├── rsvp.ts
│   │   ├── rsvp.test.ts                    # Unit tests (colocated)
│   │   ├── storage.ts
│   │   └── storage.test.ts                 # Unit tests (colocated)
│   │
│   ├── hooks/
│   │   ├── useRSVP.ts
│   │   ├── useRSVP.test.ts                 # Hook tests (colocated)
│   │   ├── useLibrary.ts
│   │   ├── useLibrary.test.ts
│   │   ├── useSettings.ts
│   │   └── useSettings.test.ts
│   │
│   ├── components/
│   │   ├── WordDisplay.tsx
│   │   ├── WordDisplay.test.tsx            # Component tests (colocated)
│   │   ├── Controls.tsx
│   │   ├── Controls.test.tsx
│   │   ├── ReaderDisplay.tsx
│   │   ├── ReaderDisplay.test.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── SettingsModal.test.tsx
│   │   └── [other components...]
│   │
│   └── app/
│       ├── api/
│       │   └── fetch-url/
│       │       ├── route.ts
│       │       └── route.test.ts           # API route tests (colocated)
│       │
│       ├── page.tsx
│       └── __tests__/                      # Page-level integration tests
│           └── page.integration.test.tsx
│
├── tests/
│   └── e2e/                                # End-to-end tests (separate)
│       ├── reader-flow.spec.ts
│       ├── library-management.spec.ts
│       └── settings-persistence.spec.ts
│
├── vitest.config.mts                       # Vitest configuration
├── playwright.config.ts                    # Playwright configuration
└── vitest.setup.ts                         # Test setup file
```

### Rationale for Structure

**Colocated Unit Tests (utils/, hooks/, components/):**
- **Why:** Lowers friction to write and maintain tests, makes it clear what is tested
- **Pattern:** `filename.test.ts` or `filename.test.tsx` adjacent to source
- **Official support:** Next.js explicitly allows colocation in App Router without routing conflicts

**Colocated API Route Tests:**
- **Why:** API routes are testable as Node.js functions, colocation keeps tests near implementation
- **Environment:** Requires `node` environment, not `jsdom`
- **Pattern:** `route.test.ts` in same directory as `route.ts`

**Separate Integration Tests (app/__tests__/):**
- **Why:** Page-level tests involve multiple components, belong at route level
- **Pattern:** `__tests__/*.integration.test.tsx` within route directories
- **Scope:** Test component interactions, not full user flows

**Top-level E2E Tests (tests/e2e/):**
- **Why:** Cross-page flows need separate directory, run against running server
- **Pattern:** `tests/e2e/*.spec.ts` following Playwright conventions
- **Scope:** Critical user paths (start reading, save to library, adjust settings)

## Technology Stack

### Core Testing Framework: Vitest

**Why Vitest over Jest:**
- 10-20x faster on large codebases (Vite integration, native ESM)
- Native Next.js App Router support
- Better TypeScript experience
- Modern API (compatible with Jest patterns)

**Installation:**
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

**Version:** Latest stable (4.x+)

### Component Testing: React Testing Library

**Why RTL:**
- User-centric testing (test behavior, not implementation)
- Official Next.js documentation uses RTL
- `renderHook()` now built-in (no separate package needed for React 18+)

**Installation:**
Already included with Vitest setup above.

### E2E Testing: Playwright

**Why Playwright:**
- Official Next.js recommendation
- Multi-browser testing (Chromium, Firefox, WebKit)
- Better debugging (traces, screenshots)
- WebServer integration (auto-starts Next.js dev server)

**Installation:**
```bash
npm init playwright
```

**Version:** Latest stable (1.x+)

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@testing-library/user-event` | Latest | Simulate user interactions | Component tests with complex interactions |
| `vitest-localstorage-mock` | Latest | Mock localStorage/sessionStorage | Tests involving storage.ts |
| `msw` (Mock Service Worker) | Latest (2.x+) | Mock API requests | Integration tests calling `/api/fetch-url` |

## Configuration Files

### 1. vitest.config.mts (Root Level)

Primary Vitest configuration supporting path aliases and jsdom environment.

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/e2e/',
        '*.config.*',
        '.next/',
      ],
    },
  },
})
```

**Key features:**
- `tsconfigPaths()`: Resolves `@/*` path aliases
- `environment: 'jsdom'`: Enables DOM API for component tests
- `setupFiles`: Runs setup before each test file
- `globals: true`: Auto-imports `describe`, `it`, `expect`

### 2. vitest.setup.ts (Root Level)

Test environment setup, mocks, and global configuration.

```typescript
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import 'vitest-localstorage-mock'

// Extend Vitest matchers with jest-dom
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
})

// Mock window.matchMedia (for responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

**Purpose:**
- Auto-cleanup between tests
- Clear storage mocks
- Mock browser APIs unavailable in jsdom
- Add jest-dom matchers (toBeInTheDocument, toHaveTextContent, etc.)

### 3. playwright.config.ts (Root Level)

Playwright E2E test configuration with webServer integration.

```typescript
import { defineConfig, devices } from '@playwright/test'

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
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

**Key features:**
- `webServer`: Auto-starts Next.js dev server before tests
- `baseURL`: Simplifies test URLs (`await page.goto('/')`)
- Multi-browser testing (Chromium, Firefox, WebKit)
- CI optimizations (retries, serial execution)

### 4. Update package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 5. Update tsconfig.json

Add test file includes:

```json
{
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "vitest.config.mts",
    "vitest.setup.ts"
  ]
}
```

## Testing Patterns by Component Type

### Pure Utility Functions (src/utils/)

**Example:** `rsvp.ts` functions (tokenize, calculatePivotIndex, wpmToInterval, splitWordByPivot)

**Test pattern:**
```typescript
// rsvp.test.ts
import { describe, it, expect } from 'vitest'
import { tokenize, calculatePivotIndex, wpmToInterval, splitWordByPivot } from './rsvp'

describe('tokenize', () => {
  it('splits text into words', () => {
    expect(tokenize('Hello world')).toEqual(['Hello', 'world'])
  })

  it('handles multiple spaces', () => {
    expect(tokenize('Hello  world')).toEqual(['Hello', 'world'])
  })

  it('filters empty strings', () => {
    expect(tokenize('  Hello   ')).toEqual(['Hello'])
  })
})

describe('calculatePivotIndex', () => {
  it('returns 0 for words of length 0-2', () => {
    expect(calculatePivotIndex('')).toBe(0)
    expect(calculatePivotIndex('a')).toBe(0)
    expect(calculatePivotIndex('ab')).toBe(0)
  })

  it('returns 1 for 3-character words', () => {
    expect(calculatePivotIndex('the')).toBe(1)
  })

  it('calculates 35% position for longer words', () => {
    expect(calculatePivotIndex('reading')).toBe(2) // 7 * 0.35 = 2.45 -> 2
  })
})
```

**Characteristics:**
- Pure input/output testing
- No mocking needed
- Fast execution
- High coverage priority

### Custom Hooks (src/hooks/)

**Example:** `useRSVP.ts`, `useLibrary.ts`, `useSettings.ts`

**Test pattern:**
```typescript
// useRSVP.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRSVP } from './useRSVP'

describe('useRSVP', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('tokenizes text and starts playing', () => {
    const { result } = renderHook(() => useRSVP())

    act(() => {
      result.current.start('Hello world test')
    })

    expect(result.current.words).toEqual(['Hello', 'world', 'test'])
    expect(result.current.isPlaying).toBe(true)
    expect(result.current.currentWord).toBe('Hello')
  })

  it('advances words based on WPM interval', async () => {
    const { result } = renderHook(() => useRSVP())

    act(() => {
      result.current.setWpm(600) // 100ms per word
      result.current.start('First Second Third')
    })

    expect(result.current.currentWord).toBe('First')

    act(() => {
      vi.advanceTimersByTime(100)
    })

    await waitFor(() => {
      expect(result.current.currentWord).toBe('Second')
    })
  })

  it('pauses and rewinds by 5 words', () => {
    const { result } = renderHook(() => useRSVP())

    act(() => {
      result.current.start('One Two Three Four Five Six Seven')
    })

    act(() => {
      vi.advanceTimersByTime(600) // Advance 6 words
    })

    act(() => {
      result.current.pause()
    })

    expect(result.current.isPlaying).toBe(false)
    expect(result.current.currentIndex).toBeLessThan(6) // Rewound by 5
  })
})
```

**Characteristics:**
- Use `renderHook()` from RTL (now built-in)
- Wrap state changes in `act()`
- Mock timers for interval testing (`vi.useFakeTimers()`)
- Test state transitions, not implementation

### Storage Hooks with localStorage

**Example:** `useLibrary.ts`, `useSettings.ts`

**Test pattern:**
```typescript
// useSettings.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSettings } from './useSettings'

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads default settings', () => {
    const { result } = renderHook(() => useSettings())

    expect(result.current.settings).toMatchObject({
      wpm: 300,
      pivotEnabled: true,
      // ... other defaults
    })
  })

  it('persists settings to localStorage', () => {
    const { result } = renderHook(() => useSettings())

    act(() => {
      result.current.updateSettings({ wpm: 500 })
    })

    expect(localStorage.getItem('settings')).toBeTruthy()
    const stored = JSON.parse(localStorage.getItem('settings')!)
    expect(stored.wpm).toBe(500)
  })

  it('loads persisted settings on mount', () => {
    localStorage.setItem('settings', JSON.stringify({ wpm: 450 }))

    const { result } = renderHook(() => useSettings())

    expect(result.current.settings.wpm).toBe(450)
  })
})
```

**Setup required:**
- `vitest-localstorage-mock` in setup file
- Clear storage in `beforeEach`
- Test both persistence and retrieval

### React Components (src/components/)

**Example:** `WordDisplay.tsx`, `Controls.tsx`, `SettingsModal.tsx`

**Test pattern:**
```typescript
// WordDisplay.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WordDisplay } from './WordDisplay'

describe('WordDisplay', () => {
  it('renders the current word', () => {
    render(<WordDisplay word="testing" pivotIndex={2} pivotEnabled={true} />)

    expect(screen.getByText(/testing/i)).toBeInTheDocument()
  })

  it('highlights pivot character', () => {
    render(<WordDisplay word="reading" pivotIndex={2} pivotEnabled={true} />)

    const pivotChar = screen.getByText('a') // Pivot is 're[a]ding'
    expect(pivotChar).toHaveClass('pivot') // Assuming CSS class
  })

  it('does not highlight when pivotEnabled is false', () => {
    render(<WordDisplay word="reading" pivotIndex={2} pivotEnabled={false} />)

    // Assert no pivot styling applied
    expect(screen.queryByTestId('pivot-character')).not.toBeInTheDocument()
  })
})
```

**User interaction testing:**
```typescript
// Controls.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Controls } from './Controls'

describe('Controls', () => {
  it('calls onPlay when play button clicked', async () => {
    const user = userEvent.setup()
    const onPlay = vi.fn()

    render(
      <Controls
        isPlaying={false}
        onPlay={onPlay}
        onPause={vi.fn()}
        onReset={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /play/i }))

    expect(onPlay).toHaveBeenCalledTimes(1)
  })

  it('shows pause button when playing', () => {
    render(
      <Controls
        isPlaying={true}
        onPlay={vi.fn()}
        onPause={vi.fn()}
        onReset={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /play/i })).not.toBeInTheDocument()
  })
})
```

**Characteristics:**
- Query by role/label (user-centric)
- Use `@testing-library/user-event` for interactions
- Mock callbacks with `vi.fn()`
- Test UI state, not implementation details

### API Routes (src/app/api/)

**Example:** `src/app/api/fetch-url/route.ts`

**Important:** API route tests require **Node environment**, not jsdom.

**Test pattern:**
```typescript
// route.test.ts
import { describe, it, expect, vi } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'

// Override environment for this file only
vi.setConfig({ environment: 'node' })

describe('GET /api/fetch-url', () => {
  it('fetches URL and returns text content', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('Fetched content'),
    })
    global.fetch = mockFetch

    const request = new NextRequest('http://localhost/api/fetch-url?url=https://example.com')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.content).toBe('Fetched content')
  })

  it('returns 400 if URL missing', async () => {
    const request = new NextRequest('http://localhost/api/fetch-url')
    const response = await GET(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBeTruthy()
  })

  it('returns 500 on fetch failure', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    global.fetch = mockFetch

    const request = new NextRequest('http://localhost/api/fetch-url?url=https://example.com')
    const response = await GET(request)

    expect(response.status).toBe(500)
  })
})
```

**Alternative:** Use `next-test-api-route-handler` package for more accurate Next.js environment emulation.

**Characteristics:**
- Test as Node.js functions (no browser APIs)
- Mock `fetch` and external dependencies
- Test request parsing and error handling
- Consider `msw` for more complex API mocking

### Page-Level Integration Tests (src/app/__tests__/)

**Example:** `src/app/__tests__/page.integration.test.tsx`

**Test pattern:**
```typescript
// page.integration.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Page from '../page'

describe('Reader Page Integration', () => {
  it('renders all main components', () => {
    render(<Page />)

    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/paste text/i)).toBeInTheDocument()
    expect(screen.getByText(/library/i)).toBeInTheDocument()
  })

  it('starts RSVP when text entered and play clicked', async () => {
    const user = userEvent.setup()
    render(<Page />)

    const textarea = screen.getByPlaceholderText(/paste text/i)
    await user.type(textarea, 'Test reading content')

    const playButton = screen.getByRole('button', { name: /play/i })
    await user.click(playButton)

    await waitFor(() => {
      expect(screen.getByText(/Test|reading|content/i)).toBeInTheDocument()
    })
  })

  it('saves completed text to library', async () => {
    // Integration test covering TextInput -> useRSVP -> useLibrary flow
    // Mock localStorage persistence
    // Assert library shows saved item
  })
})
```

**Characteristics:**
- Test component interactions
- Mock minimal dependencies (localStorage, API routes)
- Focus on user flows within a page
- Faster than E2E, broader than unit tests

### End-to-End Tests (tests/e2e/)

**Example:** `tests/e2e/reader-flow.spec.ts`

**Test pattern:**
```typescript
// reader-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('RSVP Reader Flow', () => {
  test('user can paste text and start reading', async ({ page }) => {
    await page.goto('/')

    // Paste text
    await page.fill('[placeholder*="paste text"]', 'End-to-end test content')

    // Start reading
    await page.click('button:has-text("Play")')

    // Verify words are displaying
    await expect(page.locator('[data-testid="word-display"]')).toBeVisible()
    await expect(page.locator('[data-testid="word-display"]')).toContainText(/End-to-end|test|content/)

    // Pause reading
    await page.click('button:has-text("Pause")')

    // Verify paused state
    await expect(page.locator('button:has-text("Play")')).toBeVisible()
  })

  test('user can adjust WPM settings', async ({ page }) => {
    await page.goto('/')

    // Open settings
    await page.click('button:has-text("Settings")')

    // Adjust WPM
    await page.fill('input[type="number"]', '500')
    await page.click('button:has-text("Save")')

    // Verify settings persisted (check localStorage)
    const wpm = await page.evaluate(() => {
      const settings = JSON.parse(localStorage.getItem('settings') || '{}')
      return settings.wpm
    })
    expect(wpm).toBe(500)
  })
})
```

**Critical flows to test:**
1. **Reader flow:** Paste text → Play → Pause → Reset
2. **Library management:** Save text → Load from library → Delete item
3. **Settings persistence:** Adjust WPM → Close app → Reopen → Verify settings
4. **File upload:** Upload TXT/PDF → Extract text → Start reading

**Characteristics:**
- Test real user workflows
- Run against running server
- Cross-page navigation
- Verify localStorage persistence
- Screenshot on failure

## Component Boundaries and Integration Points

### Layer 1: Pure Functions (src/utils/)

**No external dependencies, highest test priority**

| Function | Purpose | Integration Point |
|----------|---------|-------------------|
| `tokenize()` | Text → words array | Used by `useRSVP.start()` |
| `calculatePivotIndex()` | Word → pivot position | Used by `WordDisplay` |
| `wpmToInterval()` | WPM → milliseconds | Used by `useRSVP` interval |
| `splitWordByPivot()` | Word → {before, pivot, after} | Used by `WordDisplay` |

**Test focus:** Edge cases, boundary conditions, mathematical accuracy

### Layer 2: Custom Hooks (src/hooks/)

**Depend on utils/, manage state, interact with localStorage**

| Hook | Purpose | Integration Points |
|------|---------|-------------------|
| `useRSVP` | RSVP playback logic | Uses `rsvp.ts` functions, used by page components |
| `useLibrary` | Library CRUD operations | Uses `storage.ts`, used by `Library.tsx` |
| `useSettings` | Settings persistence | Uses `storage.ts`, used by `SettingsModal.tsx` |

**Test focus:** State transitions, localStorage persistence, timer behavior

### Layer 3: Components (src/components/)

**Consume hooks, render UI, handle user input**

| Component | Purpose | Integration Points |
|-----------|---------|-------------------|
| `ReaderDisplay` | Main reader container | Composes `WordDisplay` + `Controls` |
| `WordDisplay` | Displays current word | Receives state from `useRSVP` |
| `Controls` | Play/pause/reset buttons | Calls `useRSVP` methods |
| `TextInput` | Text entry interface | Passes text to `useRSVP.start()` |
| `Library` | Saved texts list | Uses `useLibrary` hook |
| `SettingsModal` | Settings UI | Uses `useSettings` hook |

**Test focus:** Rendering, user interactions, prop handling

### Layer 4: Pages (src/app/)

**Compose components, provide context, handle routing**

| Page | Purpose | Integration Points |
|------|---------|-------------------|
| `page.tsx` | Main reader page | Composes all reader components |
| `api/fetch-url/route.ts` | URL content fetcher | Called by `UrlInput` component |

**Test focus:** Component composition, data flow, API integration

### Layer 5: E2E Flows (tests/e2e/)

**Test complete user journeys across multiple pages and persistence**

| Flow | Coverage |
|------|----------|
| Reader flow | Text input → RSVP playback → Controls |
| Library flow | Save text → Browse library → Load text → Delete |
| Settings flow | Adjust settings → Persistence → Effect on reading |

**Test focus:** Critical user paths, cross-page interactions, data persistence

## Build Order for Test Infrastructure

### Phase 1: Foundation (Week 1)

**Goal:** Establish testing environment and configuration

1. **Install dependencies**
   - Vitest + plugins
   - React Testing Library
   - Testing utilities

2. **Create configuration files**
   - `vitest.config.mts`
   - `vitest.setup.ts`
   - Update `package.json` scripts

3. **Write first test**
   - Pick simplest utility function (`tokenize`)
   - Verify test runs successfully
   - Establish pattern for team

**Deliverables:**
- Working Vitest setup
- Green test suite (1 test)
- Documentation for running tests

**Dependencies:** None (pure setup)

### Phase 2: Unit Tests - Pure Functions (Week 1-2)

**Goal:** Achieve high coverage on utility functions

**Test order (easiest → hardest):**
1. `tokenize()` - Simple string splitting
2. `wpmToInterval()` - Basic math
3. `calculatePivotIndex()` - Logic with branches
4. `splitWordByPivot()` - Object construction

**Deliverables:**
- 100% coverage on `src/utils/rsvp.ts`
- Coverage for `src/utils/storage.ts`
- Established testing patterns

**Dependencies:** Phase 1 complete

### Phase 3: Unit Tests - Custom Hooks (Week 2-3)

**Goal:** Test state management and localStorage interaction

**Test order:**
1. `useSettings` - Simplest hook, localStorage only
2. `useLibrary` - CRUD operations, localStorage
3. `useRSVP` - Complex timing logic, multiple state variables

**Setup needs:**
- Mock timers (`vi.useFakeTimers()`)
- Mock localStorage (via `vitest-localstorage-mock`)
- `renderHook()` pattern established

**Deliverables:**
- All hooks tested
- Timer testing pattern documented
- localStorage mocking pattern documented

**Dependencies:** Phase 2 complete (hooks use utility functions)

### Phase 4: Component Tests (Week 3-4)

**Goal:** Test UI rendering and user interactions

**Test order (simple → complex):**
1. `WordDisplay` - Pure presentational component
2. `Controls` - Button interactions
3. `TextInput` - Form handling
4. `SettingsModal` - Form + localStorage
5. `Library` - List rendering + CRUD
6. `ReaderDisplay` - Composition of multiple components

**Setup needs:**
- `@testing-library/user-event` for interactions
- Mock custom hooks when testing components in isolation

**Deliverables:**
- Key components tested
- User interaction patterns documented
- Component testing guidelines

**Dependencies:** Phase 3 complete (components use hooks)

### Phase 5: API Route Tests (Week 4)

**Goal:** Test API endpoint reliability

**Test coverage:**
- `src/app/api/fetch-url/route.ts`

**Setup needs:**
- Node environment override (`vi.setConfig({ environment: 'node' })`)
- Mock `fetch` API
- Request/response testing pattern

**Deliverables:**
- API route tested
- Error handling verified
- API testing pattern documented

**Dependencies:** Phase 1 complete (independent of other tests)

### Phase 6: Integration Tests (Week 5)

**Goal:** Test component interactions and page composition

**Test coverage:**
- `src/app/__tests__/page.integration.test.tsx`

**Flows to test:**
- Text input → RSVP start → Word display
- Settings adjustment → Effect on reader
- Library save → Library load

**Deliverables:**
- Main page integration tests
- Flow testing patterns documented

**Dependencies:** Phases 2-4 complete (integration builds on units)

### Phase 7: E2E Test Setup (Week 5)

**Goal:** Install and configure Playwright

1. **Install Playwright**
   - `npm init playwright`
   - Configure `playwright.config.ts`

2. **Setup webServer**
   - Auto-start Next.js dev server
   - Configure baseURL

3. **Create test directory**
   - `tests/e2e/` structure
   - First smoke test

**Deliverables:**
- Working Playwright setup
- One passing E2E test
- E2E testing documentation

**Dependencies:** None (independent setup)

### Phase 8: E2E Critical Paths (Week 6)

**Goal:** Cover critical user flows

**Priority order:**
1. Reader flow (highest priority - core feature)
2. Settings persistence (affects all usage)
3. Library management (secondary feature)

**Deliverables:**
- 3 E2E test suites
- CI integration ready
- Failure debugging guide

**Dependencies:** Phase 7 complete

### Phase 9: CI/CD Integration (Week 6)

**Goal:** Automate testing in GitHub Actions

**Setup:**
- Create `.github/workflows/test.yml`
- Run tests on PR and push to main
- Generate coverage reports
- Run E2E tests in CI

**Deliverables:**
- GitHub Actions workflow
- Coverage reporting
- CI badge for README

**Dependencies:** Phases 1-8 complete

### Phase 10: Coverage & Polish (Week 7)

**Goal:** Fill gaps and improve test quality

**Tasks:**
- Review coverage reports
- Add tests for uncovered branches
- Refactor brittle tests
- Document testing guidelines
- Add pre-commit hooks (optional)

**Deliverables:**
- >80% coverage target
- Testing best practices doc
- Team onboarding guide

**Dependencies:** All previous phases complete

## CI/CD Integration Pattern

### GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Build Next.js
        run: npm run build
        env:
          CI: true

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright Report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

**Key features:**
- Matrix testing (Node 18.x, 20.x)
- Separate unit and E2E jobs
- Coverage upload to Codecov
- Playwright reports on failure
- Fast feedback (parallel jobs)

### Pre-commit Hook (Optional)

**Using Husky + lint-staged:**

```bash
npm install -D husky lint-staged
npx husky init
```

**`.husky/pre-commit`:**
```bash
#!/bin/sh
npx lint-staged
```

**`package.json`:**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"
    ]
  }
}
```

**Runs on commit:**
- Lint staged files
- Run tests related to changed files
- Prevent broken code from entering repo

## Pitfalls and Solutions

### Pitfall 1: Async Server Components Testing

**Problem:** Vitest does not support async Server Components (Next.js App Router limitation)

**Detection:**
- Error: "Cannot test async components with Vitest"
- Next.js warns about Server Component testing

**Prevention:**
- Use E2E tests (Playwright) for pages with async Server Components
- Keep components synchronous when possible
- Use Client Components (`'use client'`) for testable components

**Solution:**
Test async components with Playwright, not Vitest:
```typescript
// Don't: Try to unit test async Server Component
// test('async component', () => {
//   render(<AsyncServerComponent />) // Will fail
// })

// Do: Use E2E test
test('page with async component', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-testid="content"]')).toBeVisible()
})
```

### Pitfall 2: localStorage Spying in jsdom

**Problem:** `vi.spyOn(localStorage, 'getItem')` doesn't work due to jsdom limitation

**Detection:**
- Spy never called despite localStorage usage
- Tests pass when they should fail

**Prevention:**
- Use `vitest-localstorage-mock` package
- Or spy on `Storage.prototype` instead

**Solution:**
```typescript
// Don't:
const spy = vi.spyOn(localStorage, 'getItem') // Doesn't work

// Do:
const spy = vi.spyOn(Storage.prototype, 'getItem') // Works

// Or use vitest-localstorage-mock:
expect(localStorage.getItem).toHaveBeenCalledWith('settings')
```

### Pitfall 3: API Route Tests Using jsdom

**Problem:** API routes run in Node.js, not browser environment

**Detection:**
- Errors about missing Node.js APIs
- `process`, `Buffer`, `fs` undefined

**Prevention:**
- Configure API route tests to use Node environment
- Keep API tests separate from component tests

**Solution:**
```typescript
// route.test.ts
import { vi } from 'vitest'

// Override environment for this file
vi.setConfig({ environment: 'node' })

// Or: Create separate vitest config for API tests
// vitest.config.api.mts with environment: 'node'
```

### Pitfall 4: Timer Tests Without Fake Timers

**Problem:** Testing `useRSVP` with real timers makes tests slow and flaky

**Detection:**
- Tests take long to run
- Intermittent failures
- Tests timeout

**Prevention:**
- Always use `vi.useFakeTimers()` for interval/timeout testing
- Remember to restore timers in `afterEach`

**Solution:**
```typescript
describe('useRSVP', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('advances words at WPM interval', () => {
    const { result } = renderHook(() => useRSVP())

    act(() => {
      result.current.setWpm(600) // 100ms per word
      result.current.start('First Second')
    })

    act(() => {
      vi.advanceTimersByTime(100) // Fast-forward time
    })

    expect(result.current.currentWord).toBe('Second')
  })
})
```

### Pitfall 5: Path Alias Resolution

**Problem:** Tests fail with "Cannot find module '@/utils/rsvp'"

**Detection:**
- Import errors in tests
- Works in app, fails in tests

**Prevention:**
- Install `vite-tsconfig-paths` plugin
- Add to `vitest.config.mts`

**Solution:**
```typescript
// vitest.config.mts
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()], // Resolves @/* paths
})
```

### Pitfall 6: Playwright Not Waiting for Hydration

**Problem:** E2E tests interact with elements before React hydration completes

**Detection:**
- Flaky tests (pass sometimes, fail sometimes)
- "Element not found" errors
- Tests fail in CI but pass locally

**Prevention:**
- Wait for specific elements before interaction
- Use `waitForLoadState('networkidle')`
- Add explicit waits for dynamic content

**Solution:**
```typescript
// Don't: Click immediately
await page.goto('/')
await page.click('button') // Might fail

// Do: Wait for element
await page.goto('/')
await page.waitForSelector('button:has-text("Play")')
await page.click('button:has-text("Play")')

// Or: Wait for hydration
await page.goto('/')
await page.waitForLoadState('networkidle')
await page.click('button')
```

### Pitfall 7: Testing Implementation Details

**Problem:** Tests break when refactoring internal logic (even though behavior unchanged)

**Detection:**
- Tests fail after refactor
- Tests pass but bugs exist
- Tests tightly coupled to component structure

**Prevention:**
- Query by role/label (user-centric)
- Test behavior, not implementation
- Avoid testing internal state directly

**Solution:**
```typescript
// Don't: Test implementation
expect(component.state.internalCounter).toBe(5)
expect(wrapper.find('.internal-class')).toExist()

// Do: Test behavior
expect(screen.getByText('5 items')).toBeInTheDocument()
expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled()
```

## Confidence Assessment

| Area | Confidence | Source | Notes |
|------|------------|--------|-------|
| File organization | HIGH | Official Next.js docs | Colocation explicitly supported |
| Vitest vs Jest | HIGH | Multiple 2026 sources | Vitest 10-20x faster, official Next.js guide |
| React Testing Library | HIGH | Official docs + wide adoption | Built-in `renderHook()` for React 18+ |
| Playwright setup | HIGH | Official Next.js docs | Official recommendation, webServer integration |
| API route testing | MEDIUM | Community patterns | Node environment requirement clear, multiple approaches exist |
| localStorage mocking | MEDIUM | Multiple sources + package docs | jsdom limitation well-documented, solutions established |
| CI/CD workflow | HIGH | GitHub Actions docs + examples | Standard pattern across Next.js projects |

## Sources

### Official Documentation
- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing)
- [Next.js Vitest Setup](https://nextjs.org/docs/app/guides/testing/vitest)
- [Next.js Playwright Setup](https://nextjs.org/docs/pages/guides/testing/playwright)
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)

### Architecture & Best Practices
- [Structure Scalable Next.js Project Architecture - LogRocket](https://blog.logrocket.com/structure-scalable-next-js-project-architecture/)
- [Next.js Folder Structure Best Practices - CodeByDeep](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide)
- [Test Strategy in Next.js App Router Era - Shinagawa Labs](https://shinagawa-web.com/en/blogs/nextjs-app-router-testing-setup)
- [Next.js Unit Testing and E2E Testing - Strapi](https://strapi.io/blog/nextjs-testing-guide-unit-and-e2e-tests-with-vitest-and-playwright)

### Testing Setup Guides
- [Setting up Next.js 14 with Vitest - Medium](https://medium.com/@jplaniran01/setting-up-next-js-14-with-vitest-and-typescript-71b4b67f7ce1)
- [How to setup Vitest in Next.js 14 - Codemancers](https://www.codemancers.com/blog/2024-04-26-setup-vitest-on-nextjs-14)
- [Testing in 2026: Jest, RTL, and Full Stack Testing - Nucamp](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies)

### Hook Testing
- [How to Test Custom React Hooks - Kent C. Dodds](https://kentcdodds.com/blog/how-to-test-custom-react-hooks)
- [Testing Custom Hooks with RTL - Builder.io](https://www.builder.io/blog/test-custom-hooks-react-testing-library)
- [Test React Hooks with Vitest - Maya Shavin](https://mayashavin.com/articles/test-react-hooks-with-vitest)

### API Route Testing
- [Unit Testing Next.js API Routes - Sean Connolly](https://seanconnolly.dev/unit-testing-nextjs-api-routes)
- [API Testing with Vitest in Next.js - Medium](https://medium.com/@sanduni.s/api-testing-with-vitest-in-next-js-a-practical-guide-to-mocking-vs-spying-5e5b37677533)
- [Testing Next.js App Router API Routes - Arcjet](https://blog.arcjet.com/testing-next-js-app-router-api-routes/)

### localStorage Testing
- [How to Mock localStorage in Vitest - Dylan Britz](https://dylanbritz.dev/writing/mocking-local-storage-vitest/)
- [How to Test LocalStorage with Vitest - Run That Line](https://runthatline.com/vitest-mock-localstorage/)
- [vitest-localstorage-mock - npm](https://www.npmjs.com/package/vitest-localstorage-mock)

### CI/CD Integration
- [Setting Up CI/CD Pipelines for Next.js - Medium](https://arnab-k.medium.com/setting-up-ci-cd-pipelines-for-next-js-61073c98c994)
- [Automating Linting and Building with GitHub Actions - DevOps.dev](https://blog.devops.dev/automating-linting-and-building-in-next-js-using-github-actions-0167f63a170f)
- [Next.js CI/CD Pipeline Guide - DEV Community](https://dev.to/sizan_mahmud0_e7c3fd0cb68/nextjs-cicd-pipeline-complete-implementation-guide-for-automated-deployments-314h)

### Playwright Setup
- [Integrating Playwright with Next.js - DEV Community](https://dev.to/mehakb7/integrating-playwright-with-nextjs-the-complete-guide-34io)
- [How to Use Playwright with Next.js - Creowis](https://www.creowis.com/blog/how-to-use-playwright-with-nextjs-a-step-by-step-guide)
