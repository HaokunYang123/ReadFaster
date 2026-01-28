# Testing Pitfalls: Adding Tests to ReadFaster

**Domain:** Testing infrastructure for existing Next.js RSVP reader
**Researched:** 2026-01-28
**Confidence:** HIGH for React/Next.js testing, MEDIUM for CJK-specific edge cases

## Critical Pitfalls

Mistakes that cause rewrites, broken tests, or major refactoring.

---

### Pitfall 1: Fake Timers Conflicting with React Testing Library Async Utilities

**What goes wrong:** When testing `useRSVP` hook (which uses `setInterval`), enabling `jest.useFakeTimers()` breaks React Testing Library's `waitFor` and async utilities. The test hangs indefinitely because `waitFor` itself uses the mocked `setTimeout`.

**Why it happens:** `waitFor` from `@testing-library/react` relies on real timers to poll for conditions. When you call `jest.useFakeTimers()`, ALL timers in your test—including RTL's internal ones—become fake. This creates a deadlock where `waitFor` can't advance time, and you can't advance time without resolving `waitFor`.

**Consequences:**
- Tests timeout after 5+ seconds
- `useRSVP` playback tests fail silently
- CI/CD pipeline becomes unreliable
- Developers disable timer tests entirely

**Prevention:**
```typescript
// WRONG: This will hang
test('plays through words', async () => {
  jest.useFakeTimers();
  const { result } = renderHook(() => useRSVP());

  act(() => result.current.start('hello world'));

  // This hangs forever - waitFor uses the faked timer
  await waitFor(() => expect(result.current.currentIndex).toBe(1));
});

// RIGHT: Use modern timer mode or real timers strategically
test('plays through words', async () => {
  jest.useFakeTimers();
  const { result } = renderHook(() => useRSVP());

  act(() => result.current.start('hello world'));

  // Advance timers manually, don't wait
  act(() => jest.advanceTimersByTime(100));

  expect(result.current.currentIndex).toBe(1);

  jest.useRealTimers();
});
```

**Detection:**
- Test hangs on first `waitFor` or `findBy*` call
- `act()` warnings about updates not being wrapped
- Tests pass individually but fail in suite

**Phase:** Phase 1 (Unit Testing Core Logic) - Must resolve before testing any timing-dependent behavior.

**Sources:**
- [Testing Library: Using Fake Timers](https://testing-library.com/docs/using-fake-timers/)
- [GitHub Issue: waitFor doesn't work if jest fake timers are used](https://github.com/testing-library/react-hooks-testing-library/issues/631)
- [Infinum Frontend Handbook: Testing Timers](https://infinum.com/handbook/frontend/react/testing/timers)

---

### Pitfall 2: CJK Input Method Editor (IME) Composition Events Not Firing

**What goes wrong:** When testing multi-language text input (Chinese, Japanese, Korean), composition events (`compositionstart`, `compositionupdate`, `compositionend`) don't fire in jsdom, causing pivot calculation tests to pass with Latin text but fail in production with CJK text.

**Why it happens:** jsdom doesn't implement the full IME input flow. In real browsers, typing Chinese via Pinyin triggers:
1. `compositionstart` (user starts typing Pinyin)
2. Multiple `input` events (partial composition)
3. `compositionend` (user selects character)

In tests, `userEvent.type()` fires `input` events directly, bypassing composition entirely.

**Consequences:**
- Pivot calculation appears correct for "hello" but breaks for "你好"
- CJK tokenization tests give false positives
- Production bugs in pivot highlighting for 1.4+ billion CJK users
- No test coverage for IME-triggered re-renders

**Prevention:**
```typescript
// WRONG: This doesn't test real CJK input behavior
test('tokenizes CJK text', () => {
  const result = tokenize('你好世界');
  expect(result).toEqual(['你好世界']); // Passes, but wrong assumption
});

// RIGHT: Test actual character-level handling
test('calculates pivot for CJK characters', () => {
  // CJK has no spaces - each character is a semantic unit
  const word = '你好'; // 2 characters, no spaces
  const pivot = calculatePivotIndex(word);

  // For 2-char word, pivot should be index 0 (first char)
  expect(pivot).toBe(0);
});

// BETTER: Integration test with manual event dispatch
test('handles CJK composition in TextInput', () => {
  render(<TextInput />);
  const input = screen.getByRole('textbox');

  // Simulate IME composition
  fireEvent.compositionStart(input, { data: '' });
  fireEvent.input(input, { target: { value: 'ni' } }); // Pinyin
  fireEvent.compositionUpdate(input, { data: 'ni' });
  fireEvent.compositionEnd(input, { data: '你' }); // Character selected

  // Verify tokenization handles CJK correctly
});
```

**Detection:**
- Tests pass with English but manual testing shows CJK pivot misalignment
- Word Display component centers incorrectly for non-Latin scripts
- Users report "letters jumping around" in Chinese/Japanese/Korean

**Phase:** Phase 2 (Component Integration Tests) - Critical before shipping multi-language support.

**Sources:**
- [GitHub Issue: Composition Events problem in controlled components](https://github.com/facebook/react/issues/8683)
- [GitHub Issue: ReactNative's setState breaks text input for CJK](https://github.com/facebook/react-native/issues/19339)
- [Fasiha: CJK Text Processing](https://fasiha.github.io/cjk-2021/)

---

### Pitfall 3: localStorage Mock Pollution Across Tests

**What goes wrong:** Tests for `useSettings`, `useLibrary`, and `useRSVP` (which all use localStorage) leak state between tests. Test B fails because Test A left data in mocked localStorage, causing flaky failures that only appear when tests run in a specific order.

**Why it happens:** `jest-localstorage-mock` or manual mocks persist data across tests unless explicitly cleared. localStorage is a singleton, so writes in one test affect reads in another.

**Consequences:**
- Test suite is order-dependent (tests pass individually, fail in suite)
- CI runs fail intermittently based on test shuffling
- Developers add `only` to tests, hiding the real issue
- "It works on my machine" bugs during PR reviews

**Prevention:**
```typescript
// WRONG: No cleanup between tests
describe('useSettings', () => {
  test('saves theme preference', () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.setTheme('dark'));

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'settings',
      expect.stringContaining('dark')
    );
  });

  test('loads default settings', () => {
    // FAILS: Previous test left 'dark' in localStorage
    const { result } = renderHook(() => useSettings());
    expect(result.current.theme).toBe('light'); // Expected light, got dark
  });
});

// RIGHT: Clear localStorage in beforeEach
describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('saves theme preference', () => {
    // Test implementation
  });

  test('loads default settings', () => {
    // Now isolated - passes reliably
  });
});
```

**Detection:**
- Tests fail with "Expected X, received Y" where Y is from a previous test
- Adding `beforeEach(() => localStorage.clear())` fixes multiple tests
- Test order matters (`npm test -- --shard=1/2` gives different results)

**Phase:** Phase 1 (Unit Testing Core Logic) - Must establish before testing storage utilities.

**Sources:**
- [GitHub: jest-localstorage-mock](https://github.com/clarkbw/jest-localstorage-mock)
- [Medium: Mocking local storage with Jest](https://marek-rozmus.medium.com/mocking-local-storage-with-jest-c4b35a45d62e)
- [DEV: Mocking localStorage in Jest](https://dev.to/taratimmerman/mocking-localstorage-in-jest-wo-breaking-your-brain--4bma)

---

### Pitfall 4: Testing Implementation Details Instead of User Behavior

**What goes wrong:** Tests verify internal state (`expect(result.current.intervalRef).toBeDefined()`) or call private methods, making them brittle. Refactoring `useRSVP` to use `requestAnimationFrame` instead of `setInterval` breaks 30+ tests even though user-facing behavior is identical.

**Why it happens:** Following unit testing dogma from backend testing, where you test every function. React Testing Library philosophy is "test how users interact," but developers test how components work internally.

**Consequences:**
- Refactoring becomes expensive (every change breaks tests)
- Tests don't catch real bugs (interval works, but words don't display)
- False confidence from 100% "coverage" of internal state
- Team stops trusting test suite, skips running tests

**Prevention:**
```typescript
// WRONG: Testing implementation details
test('useRSVP creates interval reference', () => {
  const { result } = renderHook(() => useRSVP());

  act(() => result.current.start('hello world'));

  // Breaks if we switch to requestAnimationFrame
  expect(result.current.intervalRef.current).not.toBeNull();
});

// RIGHT: Test observable behavior
test('useRSVP advances to second word after interval', () => {
  jest.useFakeTimers();
  const { result } = renderHook(() => useRSVP());

  act(() => result.current.start('hello world'));

  // Test what users see, not how it's implemented
  expect(result.current.currentWord).toBe('hello');

  act(() => jest.advanceTimersByTime(100)); // 600 WPM = 100ms

  expect(result.current.currentWord).toBe('world');

  jest.useRealTimers();
});

// WRONG: Testing component internals
test('WordDisplay calculates pivot offset', () => {
  const { container } = render(<WordDisplay word="hello" />);
  const wordEl = container.querySelector('.word-display');

  // Brittle - breaks if CSS class changes
  expect(wordEl).toHaveStyle({ transform: 'translateX(...)' });
});

// RIGHT: Test visual output users see
test('WordDisplay centers pivot character', () => {
  render(<WordDisplay word="hello" />);

  // Test semantic content, not implementation
  expect(screen.getByText('he')).toBeInTheDocument(); // before
  expect(screen.getByText('l')).toHaveClass('pivot'); // pivot
  expect(screen.getByText('lo')).toBeInTheDocument(); // after
});
```

**Detection:**
- Test names include "creates," "initializes," "sets up" (internal actions)
- Tests break from harmless refactors (rename variable, change data structure)
- Code coverage is high but bugs still slip through
- Tests query by `.className` or check internal `ref` values

**Phase:** Phase 1 & 2 (All testing phases) - Establish patterns early to avoid rewriting tests.

**Sources:**
- [Kent C. Dodds: Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Medium: React Testing Library + Vitest Mistakes](https://medium.com/@samueldeveloper/react-testing-library-vitest-the-mistakes-that-haunt-developers-and-how-to-fight-them-like-ca0a0cda2ef8)
- [ITNEXT: 6 Anti-Patterns in React Test Code](https://itnext.io/unveiling-6-anti-patterns-in-react-test-code-pitfalls-to-avoid-fd7e5a3a7360)

---

## Moderate Pitfalls

Mistakes that cause delays or technical debt, but are fixable.

---

### Pitfall 5: Not Testing RTL (Right-to-Left) Text Rendering

**What goes wrong:** Pivot calculation works for English, but Arabic/Hebrew text renders incorrectly because:
1. Pivot highlights wrong character (LTR logic applied to RTL text)
2. Word alignment breaks (text flows right-to-left, but pivot centers left-to-right)
3. Mixed content (English words in Arabic sentences) displays incorrectly

**Why it happens:** Tests only use English text. RTL rendering requires `dir="rtl"` attribute AND logical CSS properties (`margin-inline-start` vs `margin-left`), but jsdom doesn't enforce visual correctness.

**Prevention:**
```typescript
// Add RTL test cases to existing tests
describe('calculatePivotIndex', () => {
  test('calculates pivot for RTL text', () => {
    // Arabic word: مرحبا (marhaban - hello)
    const word = 'مرحبا'; // 5 Arabic characters
    const pivot = calculatePivotIndex(word);

    // Pivot should still be ~35% in, but reading direction reverses
    expect(pivot).toBe(1); // 5 * 0.35 = 1.75 → 1
  });

  test('handles mixed LTR/RTL text (bidirectional)', () => {
    // "مرحبا world" - Arabic + English
    const text = 'مرحبا world';
    const words = tokenize(text);

    // Should tokenize correctly regardless of direction
    expect(words).toEqual(['مرحبا', 'world']);
  });
});

// Visual regression test for WordDisplay
test('WordDisplay renders RTL text correctly', () => {
  render(
    <div dir="rtl">
      <WordDisplay word="مرحبا" />
    </div>
  );

  const wordContainer = screen.getByTestId('word-display');

  // Verify dir attribute propagates
  expect(wordContainer.closest('[dir="rtl"]')).toBeInTheDocument();

  // Verify text content is present (visual correctness needs E2E)
  expect(screen.getByText(/مرحبا/)).toBeInTheDocument();
});
```

**Detection:**
- Manual testing with Arabic/Hebrew shows misaligned text
- Users report "pivot moves to wrong character"
- Screenshots show English-style left-alignment on RTL text

**Phase:** Phase 2 (Component Integration Tests) - Add before claiming multi-language support.

**Sources:**
- [PlaceholderText: Complete Guide to RTL Layout Testing](https://placeholdertext.org/blog/the-complete-guide-to-rtl-right-to-left-layout-testing-arabic-hebrew-more/)
- [LeanCode: Right to Left in React](https://leancode.co/blog/right-to-left-in-react)
- [DEV: Is your React app RTL language ready?](https://dev.to/redraushan/is-your-react-app-rtl-language-ready-1009)

---

### Pitfall 6: Keyboard Shortcut Tests Using Wrong Event APIs

**What goes wrong:** Testing keyboard shortcuts with `fireEvent.keyDown()` works for simple keys (Enter, Space) but fails for modifier combinations (Ctrl+K, Shift+Arrow). Tests pass, but shortcuts don't work in production.

**Why it happens:** `fireEvent` dispatches low-level DOM events without simulating full user interaction. Modifiers require correct `key`, `code`, `keyCode`, `which`, AND modifier booleans (`ctrlKey`, `shiftKey`). Easy to miss one.

**Prevention:**
```typescript
// WRONG: fireEvent with incomplete event properties
test('skips forward on right arrow', () => {
  render(<Controls />);
  const controls = screen.getByTestId('controls');

  fireEvent.keyDown(controls, { key: 'ArrowRight' });
  // Might not trigger if component checks keyCode or code

  expect(mockSkipForward).toHaveBeenCalled(); // False positive
});

// RIGHT: Use userEvent.keyboard for realistic input
test('skips forward on right arrow', async () => {
  const user = userEvent.setup();
  render(<Controls />);

  // Simulates full keyboard interaction
  await user.keyboard('{ArrowRight}');

  expect(mockSkipForward).toHaveBeenCalled();
});

// RIGHT: Test modifier combinations correctly
test('pauses on Space key', async () => {
  const user = userEvent.setup();
  render(<ReaderDisplay />);

  await user.keyboard(' '); // Space key

  expect(mockPause).toHaveBeenCalled();
});

// For complex shortcuts, verify event properties
test('opens settings on Ctrl+K', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.keyboard('{Control>}k{/Control}');

  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
```

**Detection:**
- Test passes but manual testing shows shortcut doesn't work
- Different results between `fireEvent` and `userEvent`
- Shortcuts work on some browsers but not others

**Phase:** Phase 2 (Component Integration Tests) - Verify keyboard navigation before Phase 3.

**Sources:**
- [Testing Library: user-event v13](https://testing-library.com/docs/user-event/v13/)
- [GitHub Discussion: Does userEvent.keyboard('[Enter]') work?](https://github.com/testing-library/user-event/discussions/1164)
- [Jake Trent: Keyboard Control of Buttons in Testing Library](https://jaketrent.com/post/keyboard-access-buttons-testing-library/)

---

### Pitfall 7: Async Server Components in Next.js 14 Not Testable with Vitest

**What goes wrong:** Vitest fails with "Cannot use 'await' in sync function" when testing Next.js Server Components marked `async`. Tests crash during setup, blocking entire test suite.

**Why it happens:** Vitest doesn't support React's async Server Component architecture yet. Next.js 14 allows `async` components for server-side data fetching, but testing tools haven't caught up.

**Prevention:**
```typescript
// If you have async Server Components (unlikely in ReadFaster):
// app/page.tsx
export default async function Page() {
  const data = await fetchData();
  return <ReaderDisplay data={data} />;
}

// WRONG: Unit test will fail
test('Page renders with data', async () => {
  // This crashes Vitest
  render(<Page />);
});

// RIGHT: Skip unit tests, use E2E tests instead
// In Phase 3 (E2E with Playwright):
test('page loads with text', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('reader-display')).toBeVisible();
});

// OR: Extract logic to testable Client Components
// app/page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData();
  return <ReaderClient data={data} />;
}

// components/ReaderClient.tsx (Client Component)
'use client';
export function ReaderClient({ data }) {
  // Now testable with Vitest
  return <ReaderDisplay data={data} />;
}
```

**Detection:**
- Vitest crashes with async/await errors during component import
- Error message: "async Server Components are not yet supported"
- Tests fail before even running assertions

**Phase:** Phase 1 (Setup) - Identify async components early, plan E2E tests instead.

**Sources:**
- [Next.js Docs: Testing with Vitest](https://nextjs.org/docs/app/guides/testing/vitest)
- [Strapi: Next.js Testing Guide](https://strapi.io/blog/nextjs-testing-guide-unit-and-e2e-tests-with-vitest-and-playwright)

---

### Pitfall 8: Testing Untested Code Without Breaking Existing Behavior

**What goes wrong:** Adding tests to existing codebase reveals bugs, but fixing bugs breaks production behavior that users rely on (even if technically incorrect). Tests force changes that introduce regressions.

**Why it happens:** Legacy code often has "quirks" users have adapted to. For example, pause rewinds 5 words—users expect this. Test reveals it's inconsistent, developer "fixes" it to be consistent, users complain behavior changed.

**Prevention:**
```typescript
// WRONG: "Fix" behavior that tests reveal as inconsistent
test('pause rewinds by REWIND_AMOUNT', () => {
  // Test reveals: sometimes rewinds 5, sometimes 4 (edge case at index 3)
  // Developer "fixes" to always be exactly 5
  // Users complain: "pause used to go back 4 sometimes, now it's wrong"
});

// RIGHT: Test existing behavior FIRST, then decide if it's a bug
test('pause rewinds by 5 words (current behavior)', () => {
  const { result } = renderHook(() => useRSVP());

  act(() => result.current.start('one two three four five six'));
  act(() => jest.advanceTimersByTime(500)); // Advance to word 6

  act(() => result.current.pause());

  // Document ACTUAL behavior, even if quirky
  // currentIndex after pause: 6 - 5 = 1 (word "two")
  expect(result.current.currentIndex).toBe(1);

  // If this IS a bug, file issue separately - don't fix while adding tests
});

// Add tests incrementally around changes, not wholesale
describe('useRSVP (new tests for v1.1)', () => {
  test('NEW: skipForward advances by SKIP_AMOUNT', () => {
    // Only test new functionality or code you're changing
  });

  // Don't add tests for stable code unless refactoring it
});
```

**Detection:**
- Tests reveal "bugs" that turn out to be expected behavior
- Users report "new version broke X" after test suite added
- Tests force refactors that introduce regressions

**Phase:** Phase 1 (Unit Testing Core Logic) - Adopt "test what you touch" strategy.

**Sources:**
- [Understand Legacy Code: 3 steps to add tests with short deadlines](https://understandlegacycode.com/blog/3-steps-to-add-tests-on-existing-code-when-you-have-short-deadlines/)
- [Understand Legacy Code: Best way to start testing untested code](https://understandlegacycode.com/blog/best-way-to-start-testing-untested-code/)
- [Medium: Testing legacy code techniques](https://medium.com/tbc-engineering/testing-legacy-code-5286a4b9c4ad)

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable quickly.

---

### Pitfall 9: Emoji in Test Strings Breaking Pivot Calculations

**What goes wrong:** Tests pass with `calculatePivotIndex('hello')`, but fail with `calculatePivotIndex('hello👍')`. Emoji are multi-byte UTF-16 characters—`'👍'.length === 2`—so pivot calculation is off by one.

**Prevention:**
```typescript
// Add emoji test cases
test('calculates pivot for words with emoji', () => {
  const word = 'hello👍'; // JavaScript sees length as 6, not 5
  const pivot = calculatePivotIndex(word);

  // Use Array.from() or [...word] to handle surrogate pairs
  const chars = Array.from(word); // ['h', 'e', 'l', 'l', 'o', '👍']
  expect(chars.length).toBe(6); // Document expected behavior
});

// Better: Use grapheme-aware string library if supporting emoji
```

**Phase:** Phase 1 (Unit Testing Core Logic) - Add to edge case tests.

---

### Pitfall 10: Tests Run Slowly Due to Unnecessary Rendering

**What goes wrong:** Test suite takes 30+ seconds for 100 tests because every test renders full component tree. CI times out, developers skip running tests locally.

**Prevention:**
```typescript
// SLOW: Renders entire app
test('tokenize splits on whitespace', () => {
  render(<App />); // Unnecessary - tokenize is pure function
  // ... test tokenize()
});

// FAST: Test utility functions directly
test('tokenize splits on whitespace', () => {
  const result = tokenize('hello world');
  expect(result).toEqual(['hello', 'world']);
  // No rendering needed - instant test
});
```

**Phase:** Phase 1 (Unit Testing Core Logic) - Separate pure function tests from component tests.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| **Phase 1: Unit Testing Core Logic** | Fake timer deadlock with `useRSVP` | Use `advanceTimersByTime` + `act()`, avoid `waitFor` with fake timers |
| **Phase 1: Unit Testing Core Logic** | localStorage pollution | Add `beforeEach(() => localStorage.clear())` to test setup |
| **Phase 1: Unit Testing Core Logic** | Testing implementation details | Establish RTL patterns early: test outputs, not internals |
| **Phase 2: Component Integration** | CJK composition events not firing | Add manual `fireEvent.composition*` tests for IME input |
| **Phase 2: Component Integration** | RTL text misalignment | Include Arabic/Hebrew test cases in WordDisplay tests |
| **Phase 2: Component Integration** | Keyboard shortcuts incomplete | Use `userEvent.keyboard()` for all keyboard tests |
| **Phase 3: E2E Critical Workflows** | Async Server Components crash Vitest | Use Playwright for Server Component testing, not Vitest |
| **All Phases** | Breaking existing behavior | Only test code you're actively changing ("test what you touch") |

---

## Testing Stack Recommendations

Based on pitfall analysis, recommended setup for ReadFaster:

### Core Testing Framework
- **Vitest** (not Jest) - Faster, better ESM support, Next.js 14 compatible
- **@testing-library/react** - Enforces user-behavior testing patterns
- **@testing-library/user-event** - Realistic keyboard/input simulation
- **jsdom** - More spec-compliant than happy-dom for ReadFaster's DOM manipulation

### Specialized Tools
- **jest-localstorage-mock** - Reliable localStorage mocking
- **MSW (Mock Service Worker)** - Mock `/api/fetch-url` endpoint for URL input tests
- **Playwright** - E2E tests for focus mode, timing, visual regression

### Setup Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
});

// vitest.setup.ts
import '@testing-library/jest-dom';
import 'jest-localstorage-mock';

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
```

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| React/Next.js testing pitfalls | **HIGH** | Official Next.js docs, Kent C. Dodds articles, Testing Library docs |
| Timer mocking with React hooks | **HIGH** | Multiple GitHub issues, Testing Library documentation, confirmed patterns |
| localStorage mocking patterns | **HIGH** | jest-localstorage-mock docs, multiple Medium articles with code examples |
| CJK IME composition events | **MEDIUM** | GitHub issues from 2017-2020, may have improved in React 18+ |
| RTL text rendering tests | **MEDIUM** | Comprehensive guides exist, but visual correctness requires E2E verification |
| Vitest + Next.js 14 setup | **HIGH** | Official Next.js documentation updated for 2026, Strapi guide |
| Legacy code testing strategy | **HIGH** | Multiple authoritative sources (Understand Legacy Code, Michael Feathers patterns) |

---

## Research Gaps

Areas where research was inconclusive or requires phase-specific investigation:

1. **Performance benchmarks for Vitest vs Jest in Next.js 14**: Found setup guides but no recent performance comparisons for ReadFaster's specific use case (timer-heavy tests).

2. **Grapheme cluster handling for emoji pivot calculation**: Found the problem (surrogate pairs), but no authoritative library recommendation for emoji-aware string manipulation in 2026.

3. **Visual regression testing for pivot alignment**: Found Playwright as recommended tool, but no specific guidance on testing sub-pixel alignment of highlighted characters.

4. **CJK tokenization accuracy**: Found issues with IME events, but unclear if React 18's automatic batching resolved the composition event problems from 2017-2020 issues.

**Recommendation:** Address gaps in Phase 3 (E2E testing) when visual correctness becomes critical.

---

## Summary

The most critical pitfall for ReadFaster testing is **fake timer deadlock** (Pitfall 1), which will block all timing-based tests if not addressed in Phase 1 setup. Secondary concerns are **localStorage pollution** (Pitfall 3) and **testing implementation details** (Pitfall 4), which create technical debt and false confidence.

For multi-language support, **CJK composition events** (Pitfall 2) and **RTL text rendering** (Pitfall 5) must be addressed in Phase 2 before claiming comprehensive internationalization support.

The overarching strategy: **Test what you touch** (Pitfall 8). Don't attempt 100% coverage of existing stable code—focus tests on new functionality and code being refactored, avoiding regressions from well-intentioned "fixes" of quirky-but-working behavior.
