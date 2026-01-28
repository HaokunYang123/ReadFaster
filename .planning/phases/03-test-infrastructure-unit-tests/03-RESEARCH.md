# Phase 3: Test Infrastructure & Unit Tests - Research

**Researched:** 2026-01-28
**Domain:** Vitest unit testing with Next.js 14, TypeScript, multi-language text handling
**Confidence:** HIGH

## Summary

This research establishes the standard approach for implementing comprehensive unit test infrastructure with Vitest in a Next.js 14 TypeScript project. The key finding is that Vitest integrates seamlessly with Next.js 14 through official documentation and examples, requiring minimal configuration beyond installing dependencies and creating a config file. The project's utility functions (tokenize, calculatePivotIndex, splitWordByPivot, wpmToInterval) are pure functions that are ideal for unit testing with straightforward input-output assertions.

Critical considerations include:
- **jsdom environment** provides adequate browser API emulation for localStorage and DOM utilities
- **v8 coverage provider** (default in Vitest) offers superior performance with AST-based accuracy since Vitest v3.2.0
- **Unicode handling** requires careful testing patterns for emoji (surrogate pairs) and multi-language text (CJK, RTL), as JavaScript's `.length` property doesn't account for grapheme clusters
- **Path alias resolution** via `vite-tsconfig-paths` plugin ensures Next.js `@/*` imports work correctly in tests
- **localStorage mocking** via `vi.spyOn(Storage.prototype)` is the recommended pattern for jsdom environments

**Primary recommendation:** Use Vitest with official Next.js configuration, v8 coverage provider, co-located `.test.ts` files, and explicit Unicode test fixtures for multi-language edge cases.

## Standard Stack

The established libraries/tools for Vitest testing in Next.js 14 TypeScript projects:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | Latest (≥v3.2.0) | Test framework | Official Next.js recommended, Vite-native, fast execution |
| @vitejs/plugin-react | Latest | React JSX transform | Required for React component support in Vitest |
| jsdom | Latest | DOM environment | Most complete browser API emulation, widely adopted |
| @testing-library/react | Latest | Component testing utilities | Industry standard for React testing, user-centric queries |
| @testing-library/jest-dom | Latest | Custom DOM matchers | Provides `toBeInTheDocument()` and semantic assertions |
| vite-tsconfig-paths | Latest | Path alias resolution | Enables Next.js `@/*` imports in test files |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vitest/coverage-v8 | Latest | Coverage reporting | Built-in with Vitest, use for fast coverage reports |
| @playwright/test | Latest | E2E testing | Required for INFRA-03, not used in Phase 3 unit tests |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jsdom | happy-dom | Faster startup, lower memory, but missing some Web APIs; jsdom preferred for completeness |
| v8 coverage | istanbul coverage | Istanbul works in all JS runtimes but 300% slower; v8 sufficient for Node.js projects |
| co-located tests | `__tests__/` folders | Separate folders scale better but co-location provides better proximity per user decision |

**Installation:**
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom vite-tsconfig-paths @vitest/coverage-v8
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── utils/
│   ├── rsvp.ts              # Pure functions
│   ├── rsvp.test.ts         # Co-located tests
│   ├── storage.ts           # localStorage utilities
│   └── storage.test.ts      # Storage tests with mocks
├── hooks/
│   ├── useRSVP.ts           # (Phase 4 - integration)
│   └── useRSVP.test.ts
├── components/
│   ├── WordDisplay.tsx      # (Phase 4 - integration)
│   └── WordDisplay.test.tsx
└── test-utils/
    ├── setup.ts             # Global test setup
    ├── fixtures.ts          # Shared test data (Unicode corpus)
    └── helpers.ts           # Test utility functions
```

### Pattern 1: Pure Function Unit Tests

**What:** Test pure utility functions with input-output assertions
**When to use:** For functions like tokenize, calculatePivotIndex, wpmToInterval
**Example:**
```typescript
// Source: Best practices for testing pure functions
// https://markheath.net/post/testable-code-with-pure-functions
import { describe, it, expect } from 'vitest'
import { tokenize } from './rsvp'

describe('tokenize', () => {
  it('returns empty array for empty string', () => {
    expect(tokenize('')).toEqual([])
  })

  it('splits words on single spaces', () => {
    expect(tokenize('hello world')).toEqual(['hello', 'world'])
  })

  it('handles multiple spaces between words', () => {
    expect(tokenize('hello    world')).toEqual(['hello', 'world'])
  })

  it('filters out empty strings from leading/trailing spaces', () => {
    expect(tokenize('  hello world  ')).toEqual(['hello', 'world'])
  })
})
```

### Pattern 2: Unicode Test Fixtures

**What:** Test multi-language text with explicit Unicode corpus fixtures
**When to use:** For UNIT-02, UNIT-04, UNIT-05 (CJK, RTL, emoji, surrogate pairs)
**Example:**
```typescript
// Source: Unicode testing best practices
// https://strapi.io/blog/unicode-and-emoji-encoding
import { describe, it, expect } from 'vitest'
import { calculatePivotIndex } from './rsvp'

describe('calculatePivotIndex - Unicode edge cases', () => {
  it('calculates pivot for CJK characters', () => {
    const cjkWord = '日本語'  // 3 characters
    expect(calculatePivotIndex(cjkWord)).toBe(1) // 35% of 3 = 1.05 → 1
  })

  it('calculates pivot for emoji with surrogate pairs', () => {
    // '👋' is 2 code units (surrogate pair), but JS .length = 2
    const emoji = '👋'
    expect(emoji.length).toBe(2) // Document the reality
    expect(calculatePivotIndex(emoji)).toBe(0) // length=2 → returns 0
  })

  it('handles RTL text (Arabic)', () => {
    const rtlWord = 'مرحبا' // Arabic: "hello"
    const pivotIndex = calculatePivotIndex(rtlWord)
    expect(pivotIndex).toBeGreaterThanOrEqual(0)
    expect(pivotIndex).toBeLessThan(rtlWord.length)
  })

  it('handles accented characters', () => {
    expect(calculatePivotIndex('café')).toBe(1) // 4 chars → 35% = 1.4 → 1
    expect(calculatePivotIndex('naïve')).toBe(1) // 5 chars → 35% = 1.75 → 1
  })
})
```

### Pattern 3: localStorage Mocking with vi.spyOn

**What:** Mock localStorage using Vitest spies on Storage.prototype
**When to use:** For UNIT-09 (storage utilities)
**Example:**
```typescript
// Source: Vitest localStorage mocking patterns
// https://runthatline.com/vitest-mock-localstorage/
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { saveSession, loadSession } from './storage'

describe('storage utilities', () => {
  let getItemSpy: ReturnType<typeof vi.spyOn>
  let setItemSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Spy on Storage.prototype, not localStorage directly (jsdom limitation)
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
  })

  afterEach(() => {
    getItemSpy.mockClear()
    setItemSpy.mockClear()
    localStorage.clear()
  })

  it('saves session to localStorage', () => {
    const session = { text: 'hello', currentIndex: 0, wpm: 300, savedAt: Date.now() }
    saveSession(session)

    expect(setItemSpy).toHaveBeenCalledWith(
      'readfaster_session',
      JSON.stringify(session)
    )
  })

  it('loads session from localStorage', () => {
    const session = { text: 'hello', currentIndex: 5, wpm: 400, savedAt: Date.now() }
    getItemSpy.mockReturnValue(JSON.stringify(session))

    const loaded = loadSession()
    expect(loaded).toEqual(session)
  })

  it('returns null when localStorage is empty', () => {
    getItemSpy.mockReturnValue(null)
    expect(loadSession()).toBeNull()
  })
})
```

### Pattern 4: Test Organization with describe/it

**What:** Group tests by function with nested describes, use behavior-focused naming
**When to use:** All unit tests following user decision from CONTEXT.md
**Example:**
```typescript
// Source: User decision from CONTEXT.md
describe('tokenize', () => {
  describe('whitespace handling', () => {
    it('splits on single spaces', () => { /* ... */ })
    it('handles multiple consecutive spaces', () => { /* ... */ })
    it('handles tabs and newlines', () => { /* ... */ })
  })

  describe('edge cases', () => {
    it('returns empty array for empty string', () => { /* ... */ })
    it('returns empty array for whitespace-only string', () => { /* ... */ })
    it('handles single word with no spaces', () => { /* ... */ })
  })
})
```

### Anti-Patterns to Avoid

- **Testing implementation details:** Don't test private helper logic; test public API behavior only
- **Magic numbers in tests:** Use named constants for expected values: `const EXPECTED_PIVOT = 1` not bare `1`
- **Brittle Unicode assumptions:** Don't assume `.length` matches visual characters for emoji; document actual behavior
- **Global test state pollution:** Always clean up mocks in `afterEach` to prevent test interdependencies
- **Synchronous timer APIs with async code:** Use `advanceTimersByTimeAsync()` not `advanceTimersByTime()` (Phase 4 concern)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Custom DOM matchers | `expect(el !== null)` checks | `@testing-library/jest-dom` | Provides semantic matchers like `toBeInTheDocument()`, `toHaveTextContent()` |
| Manual grapheme counting | Loop with surrogate pair detection | `Intl.Segmenter` or `graphemer` library | Unicode Standard Annex #29 compliance is complex; use battle-tested solutions |
| Coverage reporting | Custom code instrumentation | Vitest built-in v8 coverage | AST-based accuracy, zero-config, includes all standard reporters |
| Fake timers implementation | Manual `Date.now()` mocking | Vitest `vi.useFakeTimers()` | Handles setTimeout, setInterval, Date, and microtasks correctly |
| Test file discovery | Custom glob patterns | Vitest default `.test.ts` convention | Zero-config, supports co-location and `__tests__` folders |

**Key insight:** Testing infrastructure has matured significantly. Vitest provides built-in solutions for mocking, timers, coverage, and watch mode. Avoid reinventing these capabilities.

## Common Pitfalls

### Pitfall 1: Emoji/Surrogate Pair Length Assumptions

**What goes wrong:** Tests assume `'👋'.length === 1` but JavaScript reports `length === 2` (surrogate pair)
**Why it happens:** JavaScript uses UTF-16 encoding where characters above U+FFFF require two code units
**How to avoid:**
- Document actual `.length` behavior in tests: `expect('👋'.length).toBe(2)`
- Test that functions handle the **actual** string length, not visual character count
- For Phase 3, accept that `calculatePivotIndex('👋')` returns 0 because length=2 triggers the length===2 branch
**Warning signs:** Test failures with emoji input, unexpected pivot positions for non-ASCII text
**References:**
- [JavaScript has a Unicode problem](https://mathiasbynens.be/notes/javascript-unicode)
- [Why does "👩🏾‍🌾" have a length of 7](https://evanhahn.com/javascript-string-lengths/)

### Pitfall 2: localStorage Spying Directly on localStorage

**What goes wrong:** `vi.spyOn(localStorage, 'getItem')` fails in jsdom with "Cannot spy on property"
**Why it happens:** jsdom's localStorage implementation doesn't allow direct spying on methods
**How to avoid:** Spy on `Storage.prototype` instead: `vi.spyOn(Storage.prototype, 'getItem')`
**Warning signs:** Error messages about "non-configurable property" or "cannot redefine property"
**References:**
- [How to Test LocalStorage with Vitest](https://runthatline.com/vitest-mock-localstorage/)
- [Mocking and spying on local storage in vitest](https://dylanbritz.dev/writing/mocking-local-storage-vitest/)

### Pitfall 3: Path Alias Resolution Failures

**What goes wrong:** Tests fail with "Cannot find module '@/utils/rsvp'" despite working in Next.js
**Why it happens:** Vite doesn't automatically read Next.js path aliases from tsconfig.json
**How to avoid:** Install and configure `vite-tsconfig-paths` plugin in `vitest.config.ts`
**Warning signs:** Module resolution errors for `@/*` imports in test files
**References:**
- [Next.js Vitest documentation](https://nextjs.org/docs/app/guides/testing/vitest)

### Pitfall 4: Fake Timers with waitFor Deadlocks

**What goes wrong:** Tests hang indefinitely when using `vi.useFakeTimers()` with React Testing Library's `waitFor`
**Why it happens:** Fake timers freeze time, preventing `waitFor` polling from progressing
**How to avoid:** Use async timer APIs: `advanceTimersByTimeAsync()` instead of `advanceTimersByTime()`
**Warning signs:** Tests timeout after 5+ seconds, console shows repeated polling attempts
**Note:** This is primarily a Phase 4 integration testing concern, but document it now for awareness
**References:**
- [Using Fake Timers - Testing Library](https://testing-library.com/docs/using-fake-timers/)
- [React Testing Library + Vitest: The Mistakes That Bite](https://medium.com/@samueldeveloper/react-testing-library-vitest-the-mistakes-that-haunt-developers-and-how-to-fight-them-like-ca0a0cda2ef8)

### Pitfall 5: Node v25 Web Storage API Conflicts

**What goes wrong:** Tests fail in Node v25+ with "Web Storage API already exists" errors
**Why it happens:** Node v25 introduced native Web Storage API that conflicts with jsdom
**How to avoid:** Set environment variable `NODE_OPTIONS="--no-webstorage"` or upgrade to latest Vitest
**Warning signs:** Test errors mentioning "globalThis.localStorage already defined"
**References:**
- [Node v25 breaks tests with Web Storage API](https://github.com/vitest-dev/vitest/issues/8757)

### Pitfall 6: Coverage Exclusion Patterns Missing Test Files

**What goes wrong:** Coverage reports show test files inflating coverage percentages
**Why it happens:** Default exclusions don't match all test file patterns
**How to avoid:** Configure `coverage.exclude` with comprehensive patterns: `['**/*.test.ts', '**/*.spec.ts', '**/test-utils/**']`
**Warning signs:** Coverage reports list test files, coverage drops after adding tests

## Code Examples

Verified patterns from official sources:

### Complete Vitest Configuration

```typescript
// Source: https://nextjs.org/docs/app/guides/testing/vitest
// vitest.config.mts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths(), // Resolve @/* path aliases
    react(),         // Enable React JSX
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-utils/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },
  },
})
```

### Test Setup File

```typescript
// Source: https://markus.oberlehner.net/blog/using-testing-library-jest-dom-with-vitest
// src/test-utils/setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

### TypeScript Configuration for Tests

```json
// Source: https://github.com/testing-library/jest-dom
// tsconfig.json (add to existing config)
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

### Package.json Test Scripts

```json
// Source: https://vitest.dev/guide/
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Boundary Value Testing Pattern

```typescript
// Source: Unit testing best practices for edge cases
describe('calculatePivotIndex - boundary values', () => {
  it('returns 0 for empty string', () => {
    expect(calculatePivotIndex('')).toBe(0)
  })

  it('returns 0 for single character', () => {
    expect(calculatePivotIndex('a')).toBe(0)
  })

  it('returns 0 for two characters', () => {
    expect(calculatePivotIndex('ab')).toBe(0)
  })

  it('returns 1 for three characters', () => {
    expect(calculatePivotIndex('abc')).toBe(1)
  })

  it('handles very long words (100+ chars)', () => {
    const longWord = 'a'.repeat(100)
    const pivot = calculatePivotIndex(longWord)
    expect(pivot).toBeGreaterThanOrEqual(0)
    expect(pivot).toBeLessThan(longWord.length)
  })
})
```

### WPM to Interval Testing

```typescript
// Source: Testing pure functions with mathematical calculations
describe('wpmToInterval', () => {
  it('converts 600 WPM to 100ms interval', () => {
    expect(wpmToInterval(600)).toBe(100)
  })

  it('converts 300 WPM to 200ms interval', () => {
    expect(wpmToInterval(300)).toBe(200)
  })

  it('handles boundary value 100 WPM', () => {
    expect(wpmToInterval(100)).toBe(600)
  })

  it('handles boundary value 1000 WPM', () => {
    expect(wpmToInterval(1000)).toBe(60)
  })
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest | Vitest | 2021-2022 | Vite-native, 10x faster, zero-config ESM support |
| v8-to-istanbul mapping | AST-based v8 remapping | Vitest v3.2.0 (2024) | V8 coverage now as accurate as Istanbul |
| Manual jsdom setup | Built-in environment: 'jsdom' | Vitest v0.10+ | Zero-config jsdom integration |
| Separate test config | Unified vite.config.ts | Vitest design | Single source of truth for aliases, plugins |
| String.charCodeAt() | String.codePointAt() | ES2015 | Proper handling of surrogate pairs (emoji) |
| happy-dom default | jsdom recommended | 2023-2024 | happy-dom faster but missing APIs; jsdom more complete |

**Deprecated/outdated:**
- **Jest with Next.js:** Vitest is now officially recommended by Next.js docs for unit/integration tests
- **v8-to-istanbul package:** Built into Vitest v3+ with better accuracy
- **@vitest/ui as separate install:** Now included with Vitest core

## Open Questions

Things that couldn't be fully resolved:

1. **Grapheme Cluster Handling in calculatePivotIndex**
   - What we know: JavaScript `.length` doesn't match visual character count for complex emoji (e.g., '👨‍👩‍👧‍👦'.length === 11)
   - What's unclear: Should Phase 3 handle grapheme clusters or document current behavior?
   - Recommendation: **Document current behavior in tests.** Accept that emoji with ZWJ sequences will have unexpected pivots. Defer grapheme-aware counting to future enhancement (not in v1.1 scope per REQUIREMENTS.md).

2. **RTL Text Rendering Testing**
   - What we know: Unit tests can verify calculatePivotIndex returns valid indices for RTL text
   - What's unclear: Whether pivot visual positioning works correctly with RTL is a component concern
   - Recommendation: **Phase 3 tests verify mathematical correctness only.** Visual RTL rendering belongs in Phase 4 component tests or Phase 5 E2E tests.

3. **Coverage Threshold Enforcement**
   - What we know: User decided no coverage enforcement in Phase 3 (from CONTEXT.md)
   - What's unclear: Whether to configure thresholds in advance or defer to Phase 5
   - Recommendation: **Configure threshold fields in vitest.config.ts but set to 0%.** Phase 5 will update thresholds to 75%/90% per QUAL-01/QUAL-02.

4. **Playwright vs Vitest Browser Mode**
   - What we know: Playwright is required per INFRA-03; Vitest has new browser mode
   - What's unclear: Whether to use Vitest browser mode for component tests or stick to jsdom
   - Recommendation: **Use jsdom for unit tests (Phase 3), evaluate Vitest browser mode in Phase 4.** Playwright handles E2E (Phase 5).

## Sources

### Primary (HIGH confidence)

- [Next.js Testing Documentation - Vitest](https://nextjs.org/docs/app/guides/testing/vitest) - Official Next.js Vitest setup
- [Vitest Guide](https://vitest.dev/guide/) - Official Vitest documentation
- [Vitest Coverage Guide](https://vitest.dev/guide/coverage) - Official coverage configuration
- [Testing Library jest-dom GitHub](https://github.com/testing-library/jest-dom) - Custom matchers documentation
- [Playwright Documentation](https://playwright.dev/docs/intro) - Official Playwright setup

### Secondary (MEDIUM confidence)

- [Setting up Next.js 14 with Vitest and TypeScript - Medium](https://medium.com/@jplaniran01/setting-up-next-js-14-with-vitest-and-typescript-71b4b67f7ce1) - Verified against official docs
- [How to Test LocalStorage with Vitest](https://runthatline.com/vitest-mock-localstorage/) - WebSearch verified pattern
- [Using Testing Library jest-dom with Vitest](https://markus.oberlehner.net/blog/using-testing-library-jest-dom-with-vitest) - WebSearch verified setup
- [JavaScript has a Unicode problem](https://mathiasbynens.be/notes/javascript-unicode) - Authoritative Unicode reference
- [Using Fake Timers - Testing Library](https://testing-library.com/docs/using-fake-timers/) - Official RTL documentation

### Tertiary (LOW confidence)

- [React Testing Library + Vitest: The Mistakes That Bite](https://medium.com/@samueldeveloper/react-testing-library-vitest-the-mistakes-that-haunt-developers-and-how-to-fight-them-like-ca0a0cda2ef8) - Single author but cross-verified patterns
- [Vitest Code Coverage](https://www.thecandidstartup.org/2024/03/18/vitest-code-coverage.html) - Blog post but aligns with official docs
- Various WebSearch results for community patterns - Used to identify common mistakes, verified against authoritative sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Next.js docs recommend exact stack, versions verified
- Architecture: HIGH - Patterns from official Testing Library and Vitest docs
- Pitfalls: MEDIUM-HIGH - Community-reported issues verified against official GitHub issues
- Unicode handling: MEDIUM - Standards-based but testing implications inferred from community experience

**Research date:** 2026-01-28
**Valid until:** 60 days (2026-03-29) - Vitest and Next.js are stable; major breaking changes unlikely in this timeframe
