# Test Coverage Feature Landscape

**Domain:** RSVP Reading Application Testing
**Researched:** 2026-01-28
**Confidence:** HIGH

## Executive Summary

Production-quality RSVP reading apps require comprehensive test coverage across three layers: unit tests for algorithm correctness and utility functions (70%), integration tests for component interactions and state management (20%), and E2E tests for critical user workflows (10%). The ReadFaster app has unique testing challenges including multi-language text processing (CJK, RTL), complex timing-based RSVP engine logic, file parsing with OCR, and localStorage persistence.

Industry standard coverage targets 75-80% code coverage with 70% minimum threshold for CI/CD pipelines. However, meaningful coverage prioritizes testing algorithm correctness, edge cases, and user workflows over hitting arbitrary percentage targets.

## Table Stakes

Features users expect from a production testing suite. Missing = app feels incomplete or unreliable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Unit: RSVP Algorithm Tests** | Core business logic must be correct | Medium | tokenize, calculatePivotIndex, wpmToInterval, splitWordByPivot |
| **Unit: Pivot Correctness** | ORP calculation defines user experience | Medium | All word lengths (0, 1, 2, 3, 4+), CJK characters, emoji, special chars |
| **Unit: Edge Case Coverage** | Real text has many edge cases | High | Empty strings, single words, very long words (45+ chars), whitespace variations, line breaks |
| **Unit: Storage Functions** | localStorage persistence is core feature | Low | saveSession, loadSession, saveToLibrary, loadLibrary, clearSession |
| **Unit: Multi-language Text** | Global audience requires i18n support | High | CJK (Chinese/Japanese/Korean), RTL (Arabic/Hebrew), accented characters, emoji, mixed scripts |
| **Integration: useRSVP Hook** | State management drives entire app | High | start/pause/reset, WPM changes, skip forward/backward, completion detection |
| **Integration: Timer Behavior** | setInterval-based playback must be reliable | High | Fake timers, interval updates, pause/resume, WPM change during playback |
| **Integration: useLibrary Hook** | Library CRUD with localStorage | Medium | Add/remove/load texts, 50-item limit, persistence |
| **Integration: useSettings Hook** | Settings persistence and defaults | Low | Load/save settings, default merging for backward compatibility |
| **Integration: Component Rendering** | All components render without errors | Medium | WordDisplay, Controls, TextInput, FileInput, Library, SettingsModal |
| **E2E: Complete Reading Flow** | Primary user workflow | Medium | Load text → adjust WPM → play → pause → resume → complete |
| **E2E: Library Management** | Save/load workflow | Low | Save text → navigate away → reload from library |
| **E2E: Keyboard Shortcuts** | Power users expect keyboard control | Medium | Space (play/pause), arrows (skip), Escape (reset focus) |
| **Coverage Metrics** | CI/CD quality gates | Low | 75% coverage target, 70% minimum threshold, branch coverage |

## Differentiators

Features that set production apps apart. Not expected by all users, but valued for reliability.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Property-Based Testing** | Catches edge cases conventional tests miss | High | Generate random text samples, verify invariants (pivot always in bounds, tokenize reversible) |
| **Visual Regression Testing** | Ensures pivot alignment stays correct | Medium | Snapshot tests for WordDisplay with different word lengths and settings |
| **Accessibility Testing** | Ensures keyboard nav and screen readers work | Medium | aria-labels, focus management, keyboard-only navigation |
| **Performance Benchmarks** | Verifies tokenization performance on large texts | Medium | Test 10k, 100k, 1M word texts; ensure <100ms processing |
| **File Parser Integration Tests** | Complex file parsing needs verification | High | Mock PDF.js, Tesseract.js, JSZip; test actual file formats |
| **Internationalization Test Suite** | Comprehensive i18n validation | Very High | Dedicated test files per language family (CJK, RTL, Latin+accents) |
| **Error Boundary Testing** | Graceful failure handling | Low | Component error states, fallback UI, error logging |
| **localStorage Quota Handling** | Test behavior when storage full | Low | Mock quota exceeded errors, verify graceful degradation |
| **Cross-Browser E2E** | Ensure consistency across browsers | High | Run E2E on Chrome, Firefox, Safari (timing behavior differs) |
| **Flaky Test Detection** | Identify timing-dependent test failures | Medium | Run tests 100x, track failure rates, fix non-determinism |
| **Mutation Testing** | Verify test quality (tests catch bugs) | High | Use Stryker or similar to verify tests actually catch regressions |
| **Focus Mode E2E** | Immersive mode critical for UX | Medium | Test auto-activation, click-to-pause, 200ms debounce, background dim |
| **Session Restoration** | Test persistence across page reloads | Medium | Save mid-reading → hard refresh → verify state restored |

## Anti-Features

Testing approaches to explicitly AVOID. Common mistakes in test suites.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **100% Coverage Target** | Creates meaningless tests just to hit percentage | Focus on meaningful coverage of logic, not lines. 75-80% is ideal, 70% minimum. |
| **Testing Implementation Details** | Makes tests brittle, breaks on refactoring | Test user-facing behavior and outputs, not internal state or private methods |
| **Mocking Everything** | Loses confidence in integration points | Mock external dependencies (Tesseract, PDF.js) but test real component interactions |
| **E2E for Everything** | Too slow, flaky, expensive to maintain | E2E only for 3-5 critical workflows. Unit/integration for everything else. |
| **Snapshot Testing UI** | Brittle, hard to review diffs | Use targeted assertions for specific attributes. Reserve snapshots for visual regression only. |
| **No Fake Timers** | Tests take forever waiting for intervals | Always use vi.useFakeTimers() for setInterval/setTimeout logic |
| **Skipped/Disabled Tests** | Technical debt that accumulates | Either fix immediately or delete. No .skip() or .only() in committed code. |
| **Large beforeEach Blocks** | Hidden setup makes tests hard to understand | Setup in individual tests for clarity, extract setup functions if needed |
| **Testing Library Internals** | Not your code, already tested by library authors | Trust React, Next.js, Tailwind. Test your code that uses them. |
| **Ignoring Flaky Tests** | Indicates real timing/race condition issues | Fix root cause (usually missing await, poor fake timer usage, or race conditions) |
| **Manual Test Data** | Hard to maintain, misses edge cases | Generate test data with factories or property-based testing |
| **No CI/CD Integration** | Tests not run consistently | Run full suite on every PR, block merges on failure, track coverage trends |

## Feature Dependencies

```
Foundation Layer (must test first):
├── rsvp.ts utility functions
│   ├── tokenize (enables all text processing)
│   ├── calculatePivotIndex (enables word display)
│   ├── wpmToInterval (enables timing)
│   └── splitWordByPivot (enables rendering)
└── storage.ts utilities
    └── All CRUD operations (enables hooks)

Core Integration Layer (test second):
├── useRSVP hook (depends on rsvp.ts)
│   └── Timer behavior with fake timers
├── useLibrary hook (depends on storage.ts)
└── useSettings hook (depends on storage.ts)

Component Layer (test third):
├── WordDisplay (depends on useRSVP, useSettings)
├── Controls (depends on useRSVP)
├── TextInput (depends on useRSVP)
├── FileInput (complex, needs mocking)
└── Library (depends on useLibrary)

E2E Workflows (test last):
├── Complete reading flow (depends on all components)
├── Library management (depends on Library + useLibrary)
├── Keyboard shortcuts (depends on Controls + focus management)
└── Focus mode (depends on WordDisplay + reading state)
```

## MVP Recommendation (v1.1 Milestone)

For testing milestone, prioritize in this order:

### Phase 1: Foundation (Week 1)
1. Unit tests for all rsvp.ts functions
2. Unit tests for all storage.ts functions
3. Multi-language test data suite (CJK, RTL, accented, emoji)
4. Edge case test suite (empty, single, long words, special chars)
5. Target: 80%+ coverage of utils/

### Phase 2: Integration (Week 2)
6. useRSVP hook tests with fake timers
7. useLibrary hook tests with localStorage mocks
8. useSettings hook tests with localStorage mocks
9. Component rendering tests (smoke tests)
10. Target: 75%+ coverage of hooks/, 60%+ coverage of components/

### Phase 3: Critical Workflows (Week 3)
11. E2E: Complete reading flow with Playwright
12. E2E: Keyboard shortcuts
13. E2E: Focus mode behavior
14. Target: 3-5 critical user paths covered

### Defer to Post-v1.1:
- File parser integration tests: Complex, requires extensive mocking. Test manually for now.
- Property-based testing: Nice-to-have, significant learning curve
- Visual regression testing: Adds infrastructure complexity
- Cross-browser E2E: Start with Chrome only, expand if issues found
- Mutation testing: Advanced technique, high setup cost
- Performance benchmarks: Optimize if users report issues

## Test-Specific Edge Cases

Beyond standard edge cases, test suites need to handle:

### Text Processing Edge Cases
- **Empty/Whitespace**: `""`, `"   "`, `"\n\n\n"`, `"\t\t"`
- **Single Elements**: `"a"`, `"I"`, `"好"` (single CJK), `"👍"` (single emoji)
- **Very Long Words**: `"supercalifragilisticexpialidocious"` (34 chars), `"pneumonoultramicroscopicsilicovolcanoconiosis"` (45 chars)
- **Special Characters**: `"don't"`, `"hello—world"`, `"$100"`, `"#hashtag"`, `"user@email.com"`
- **Numbers**: `"123"`, `"3.14"`, `"1,000,000"`
- **Mixed Scripts**: `"Hello世界"`, `"café123"`, `"مرحبا world"`
- **Emoji**: `"Hello 👋"`, `"😀😃😄"`, `"🏴󠁧󠁢󠁥󠁮󠁧󠁿"` (flag sequences)
- **RTL Text**: `"مرحبا"`, `"שלום"`, mixed RTL+LTR
- **Zero-Width Characters**: Zero-width joiners, combining diacritics
- **Surrogate Pairs**: Characters outside BMP (e.g., `"𝕳𝖊𝖑𝖑𝖔"`)

### Timing Edge Cases
- **WPM Boundaries**: 100 WPM (6000ms), 1000 WPM (60ms), extreme values
- **Rapid WPM Changes**: Change WPM multiple times while playing
- **Pause During Interval**: Pause between ticks, verify clean timer cleanup
- **Complete at Boundary**: Last word should trigger completion
- **Skip Past End**: skipForward past last word should clamp to bounds

### Storage Edge Cases
- **localStorage Unavailable**: Private browsing, storage disabled
- **Quota Exceeded**: Library at 50-item limit
- **Corrupted Data**: Invalid JSON in storage
- **Session Expiry**: 7-day session timeout
- **Concurrent Modifications**: Multiple tabs (if supported)

## Testing Tool Ecosystem

Based on 2026 best practices:

| Category | Recommended | Why |
|----------|-------------|-----|
| **Test Framework** | Vitest | 10-20x faster than Jest, native ESM, Vite integration |
| **React Testing** | React Testing Library | User-focused testing, avoids implementation details |
| **Hook Testing** | @testing-library/react renderHook | Official hook testing utilities |
| **E2E** | Playwright | Best for keyboard shortcuts, focus mode, cross-browser |
| **DOM Environment** | jsdom | Fast, sufficient for most React tests |
| **Mocking** | vi.mock, vi.spyOn | Built into Vitest, consistent API |
| **Coverage** | v8 (Vitest default) | Fast, accurate, integrated |
| **CI/CD** | GitHub Actions | Free for public repos, matrix testing |

## Coverage Targets by Module

| Module | Target Coverage | Rationale |
|--------|----------------|-----------|
| `utils/rsvp.ts` | 100% | Pure functions, critical algorithms, easy to test |
| `utils/storage.ts` | 90% | localStorage interactions, some error paths hard to trigger |
| `hooks/useRSVP.ts` | 85% | Complex timing logic, some edge cases difficult |
| `hooks/useLibrary.ts` | 90% | CRUD operations, straightforward to test |
| `hooks/useSettings.ts` | 95% | Simple state management |
| `components/*.tsx` | 70% | Focus on critical paths, not every render permutation |
| `app/api/*.ts` | 80% | API routes, mock external services |
| **Overall** | 75% | Balanced, maintainable, production-ready |

## Sources

**React Testing Best Practices:**
- [Best Practices for React UI Testing in 2026](https://trio.dev/best-practices-for-react-ui-testing/)
- [Testing in 2026: Jest, React Testing Library, and Full Stack Testing Strategies](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies)
- [Top Testing Libraries for React in 2026](https://www.browserstack.com/guide/top-react-testing-libraries)

**Vitest & React Testing Library:**
- [Test your React hooks with Vitest efficiently](https://mayashavin.com/articles/test-react-hooks-with-vitest)
- [Component Testing Guide - Vitest](https://vitest.dev/guide/browser/component-testing)
- [How to test React custom hooks and components with Vitest](https://www.thisdot.co/blog/how-to-test-react-custom-hooks-and-components-with-vitest)

**Internationalization Testing:**
- [Internationalization Testing: Best Practices Guide for 2026](https://aqua-cloud.io/internationalization-testing/)
- [How to Perform Internationalization Testing in 2026](https://www.browserstack.com/guide/internationalization-testing-of-websites-and-apps)

**CJK Text Processing:**
- [Chinese, Japanese, Korean (CJK) text processing and languages](https://fasiha.github.io/cjk-2021/)
- [Working with Chinese, Japanese, and Korean text in Generative AI pipelines](https://tonybaloney.github.io/posts/cjk-chinese-japanese-korean-llm-ai-best-practices.html)

**Playwright E2E Testing:**
- [Keyboard API - Playwright](https://playwright.dev/docs/api/class-keyboard)
- [Actions - Playwright](https://playwright.dev/docs/input)
- [How to Focus on an Element Using Playwright](https://software-testing-tutorials-automation.com/2025/06/focus-on-an-element-using-playwright.html)

**localStorage Testing:**
- [How to Test LocalStorage with Vitest](https://runthatline.com/vitest-mock-localstorage/)
- [How to mock and spy on local storage in vitest](https://dylanbritz.dev/writing/mocking-local-storage-vitest/)
- [vitest-localstorage-mock - npm](https://www.npmjs.com/package/vitest-localstorage-mock)

**Fake Timers:**
- [Using Fake Timers - Testing Library](https://testing-library.com/docs/using-fake-timers/)
- [Mastering Time: Using Fake Timers with Vitest](https://dev.to/brunosabot/mastering-time-using-fake-timers-with-vitest-390b)
- [Timers - Vitest](https://vitest.dev/guide/mocking/timers)

**Code Coverage:**
- [What is Code Coverage? - Atlassian](https://www.atlassian.com/continuous-delivery/software-testing/code-coverage)
- [Minimum Acceptable Code Coverage](https://www.bullseye.com/minimum.html)
- [Is 70%, 80%, 90%, or 100% Code Coverage Good Enough?](https://www.qt.io/quality-assurance/blog/is-70-80-90-or-100-code-coverage-good-enough)

**Algorithm Testing:**
- [From Prompts to Properties: Rethinking LLM Code Generation with Property-Based Testing](https://dl.acm.org/doi/10.1145/3696630.3728702)
- [Property testing - Wikipedia](https://en.wikipedia.org/wiki/Property_testing)
