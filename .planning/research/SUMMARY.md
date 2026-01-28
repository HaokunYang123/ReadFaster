# Project Research Summary

**Project:** ReadFaster v1.1 Testing Infrastructure
**Domain:** Next.js 14 RSVP Speed Reading App Testing
**Researched:** 2026-01-28
**Confidence:** HIGH

## Executive Summary

Comprehensive testing for ReadFaster requires a three-tier strategy: unit tests for RSVP algorithms and utilities (70% of coverage), integration tests for component interactions and state management (20%), and E2E tests for critical user workflows (10%). The testing stack should use **Vitest 4.x** (10-20x faster than Jest) with React Testing Library for unit/integration tests and **Playwright 1.57** for E2E testing across browsers.

ReadFaster's unique testing challenges include multi-language text processing (CJK, RTL, emoji), complex timing-based RSVP engine logic with setInterval, localStorage persistence across sessions, and pivot algorithm correctness for all word types. Industry standard for production apps is 75-80% code coverage with 70% minimum CI threshold, but meaningful coverage prioritizes algorithm correctness, edge cases, and user workflows over arbitrary percentage targets.

The most critical pitfall is **fake timer deadlock** with React Testing Library's async utilities—using jest.useFakeTimers() breaks waitFor() causing tests to hang. Secondary concerns include localStorage pollution between tests, testing implementation details instead of user behavior, and missing CJK/RTL test coverage. The recommended strategy is "test what you touch"—focus on new functionality and refactored code rather than attempting 100% coverage of stable legacy code.

## Key Findings

### Recommended Stack

**Vitest 4.x** is the clear winner over Jest for Next.js projects in 2026 due to 10-20x speed improvement, native ESM/TypeScript support, and zero-config integration. Pair with **jsdom** (not happy-dom) for accurate browser API emulation critical for testing DOM-heavy features like WordDisplay and SettingsModal. Use **Playwright 1.57** for E2E testing—it's faster than Cypress (14 min vs 90 min on enterprise suites), less flaky (1.8% vs 6.5%), and includes Safari support critical for validating RSVP animation rendering across WebKit.

**Core technologies:**
- **Vitest ^4.0.18**: Unit & integration testing — 10-20x faster than Jest, native ESM, official Next.js recommendation
- **jsdom ^25.0.1**: DOM environment — More accurate browser APIs than happy-dom for localStorage and file APIs
- **@testing-library/react ^16.3.1**: Component testing — Industry standard, React 18 concurrent features support
- **@testing-library/user-event ^14.6.1**: User interactions — Simulates real browser events (not just fireEvent)
- **Playwright ^1.57.0**: E2E testing — Cross-browser, auto-waits, built-in parallelization, trace viewer
- **@vitest/coverage-v8 ^4.0.18**: Coverage reporting — V8 now as accurate as Istanbul but 10x faster

**Version compatibility:** All tools fully compatible with ReadFaster's current stack (Next.js 14.2, React 18.2, TypeScript 5.3, Node.js 20).

### Expected Features

**Must have (table stakes):**
- **RSVP Algorithm Tests**: tokenize, calculatePivotIndex, wpmToInterval, splitWordByPivot — Core business logic correctness
- **Pivot Correctness**: All word lengths (0, 1, 2, 3, 4+), CJK characters, emoji, special chars — ORP calculation defines UX
- **Edge Case Coverage**: Empty strings, single words, very long words (45+ chars), whitespace variations — Real text is messy
- **Storage Functions**: saveSession, loadSession, saveToLibrary, loadLibrary, clearSession — localStorage persistence is core
- **Multi-language Text**: CJK (Chinese/Japanese/Korean), RTL (Arabic/Hebrew), accented characters, mixed scripts — Global audience
- **useRSVP Hook Integration**: start/pause/reset, WPM changes, skip forward/backward, completion detection — State management drives app
- **Timer Behavior**: setInterval-based playback with fake timers, interval updates, pause/resume — Timing must be reliable
- **Component Rendering**: All components render without errors — WordDisplay, Controls, TextInput, FileInput, Library, SettingsModal
- **E2E Complete Reading Flow**: Load text → adjust WPM → play → pause → resume → complete — Primary user workflow
- **E2E Keyboard Shortcuts**: Space (play/pause), arrows (skip), Escape (reset focus) — Power users expect this
- **Coverage Metrics**: 75% coverage target, 70% minimum CI threshold — Production-quality gates

**Should have (competitive differentiators):**
- **Property-Based Testing**: Generate random text samples, verify invariants — Catches edge cases conventional tests miss
- **Accessibility Testing**: aria-labels, focus management, keyboard-only navigation — Screen reader compatibility
- **Performance Benchmarks**: Test 10k, 100k, 1M word texts; ensure <100ms processing — Verify scalability
- **Cross-Browser E2E**: Run on Chrome, Firefox, Safari — Timing behavior differs across browsers
- **Focus Mode E2E**: Auto-activation, click-to-pause, 200ms debounce, background dim — Immersive mode is critical UX
- **Session Restoration**: Save mid-reading → hard refresh → verify state restored — Persistence across reloads

**Defer (v2+):**
- File parser integration tests (PDF.js, Tesseract.js, JSZip mocking) — Complex, test manually for now
- Visual regression testing for pivot alignment — Adds infrastructure complexity
- Mutation testing (Stryker) — High setup cost, advanced technique
- Comprehensive i18n test suite — Dedicated test files per language family

**Anti-features to avoid:**
- 100% coverage target (creates meaningless tests)
- Testing implementation details (brittle, breaks on refactor)
- Mocking everything (loses confidence in integration)
- E2E for everything (too slow, flaky)
- Snapshot testing UI (brittle, hard to review)
- Skipped/disabled tests (.skip(), .only() in committed code)

### Architecture Approach

Testing architecture follows a **hybrid colocation strategy**: unit tests live alongside source code (src/utils/rsvp.test.ts), integration tests reside in feature directories (src/app/__tests__/), and E2E tests occupy a top-level directory (tests/e2e/). This structure is officially supported by Next.js 14 App Router and lowers friction for writing and maintaining tests.

**Major components and test approach:**

1. **Pure Utility Functions (src/utils/)** — Test with direct imports, no rendering needed
   - rsvp.ts: tokenize, calculatePivotIndex, wpmToInterval, splitWordByPivot
   - storage.ts: All CRUD operations for localStorage
   - Priority: 100% coverage (pure functions, easy to test, critical algorithms)

2. **Custom Hooks (src/hooks/)** — Test with renderHook() from React Testing Library
   - useRSVP: State management drives app, uses fake timers for intervals
   - useLibrary: CRUD with localStorage, 50-item limit
   - useSettings: Settings persistence and defaults merging
   - Priority: 85-95% coverage (complex timing logic, some edge cases difficult)

3. **React Components (src/components/)** — Test with render() and user-event
   - WordDisplay: Receives state from useRSVP, displays current word with pivot
   - Controls: Play/pause/reset buttons, calls useRSVP methods
   - TextInput: Text entry, passes to useRSVP.start()
   - Library: Saved texts list, uses useLibrary hook
   - SettingsModal: Settings UI, uses useSettings hook
   - Priority: 70% coverage (focus on critical paths, not every render permutation)

4. **API Routes (src/app/api/)** — Test as Node.js functions with fetch mocking
   - fetch-url/route.ts: URL content fetcher for text extraction
   - Requires Node environment, not jsdom
   - Priority: 80% coverage (mock external services, test error handling)

5. **E2E Workflows (tests/e2e/)** — Test with Playwright against running server
   - Reader flow: Paste text → Play → Pause → Reset
   - Library management: Save → Load → Delete
   - Settings persistence: Adjust WPM → Reopen → Verify
   - Keyboard shortcuts: Space, arrows, Escape
   - Priority: 3-5 critical user paths

**Data flow testing priorities:**
1. Foundation Layer: Utils first (enables all other tests)
2. Integration Layer: Hooks second (depend on utils)
3. Component Layer: Components third (depend on hooks)
4. E2E Layer: Full workflows last (depend on all components)

### Critical Pitfalls

1. **Fake Timers Deadlock with React Testing Library** — When testing useRSVP (uses setInterval), enabling jest.useFakeTimers() breaks waitFor(). RTL's async utilities rely on real timers. Solution: Use act() with advanceTimersByTime() instead of waitFor(), or use modern timer mode. Must resolve in Phase 1 before testing timing-dependent behavior.

2. **localStorage Pollution Between Tests** — Tests for useSettings, useLibrary, useRSVP leak state between tests. localStorage is singleton, writes in Test A affect Test B. Solution: Add beforeEach(() => localStorage.clear()) to test setup file. Critical for Phase 1 before testing storage utilities.

3. **Testing Implementation Details** — Tests verify internal state (intervalRef.current) instead of user behavior, making them brittle. Refactoring breaks 30+ tests even though behavior unchanged. Solution: Test observable behavior (currentWord, isPlaying), not implementation. Use RTL queries by role/label, not internal state. Establish patterns in Phase 1 to avoid rewriting.

4. **CJK Input Method Editor Events Not Firing** — jsdom doesn't implement IME composition flow (compositionstart/compositionupdate/compositionend), causing pivot tests to pass with English but fail with Chinese/Japanese/Korean in production. Solution: Manually dispatch composition events in tests or use E2E tests for CJK validation. Address in Phase 2 before claiming multi-language support.

5. **RTL (Right-to-Left) Text Not Tested** — Pivot calculation works for English but Arabic/Hebrew render incorrectly (LTR logic applied to RTL text, alignment breaks). Solution: Add RTL test cases with dir="rtl" attribute, verify bidirectional text handling. Include in Phase 2 component tests.

## Implications for Roadmap

Based on research, suggested phase structure aligns with test dependency layers:

### Phase 1: Foundation Testing (Week 1-2)
**Rationale:** Pure utility functions have no dependencies and enable all other tests. Establish patterns early to avoid costly rewrites. Critical pitfalls (fake timers, localStorage pollution) must be resolved here.

**Delivers:**
- Working Vitest + Playwright setup
- All rsvp.ts utility tests (tokenize, calculatePivotIndex, wpmToInterval, splitWordByPivot)
- All storage.ts utility tests
- Multi-language test data suite (CJK, RTL, accented, emoji)
- Edge case test suite (empty, single, long words, special chars)

**Addresses:**
- Table stakes: RSVP algorithm tests, pivot correctness, edge case coverage, storage functions
- Stack: Vitest configuration, jsdom setup, React Testing Library integration

**Avoids:**
- Pitfall 1 (fake timers) by establishing pattern early
- Pitfall 2 (localStorage pollution) with beforeEach cleanup
- Pitfall 3 (implementation details) by setting RTL patterns

**Target:** 100% coverage on utils/, green CI pipeline, test patterns documented

### Phase 2: Integration Testing (Week 2-4)
**Rationale:** Hooks depend on utility functions tested in Phase 1. Components depend on hooks. Test state management and React integration before E2E workflows. Must address CJK/RTL pitfalls before claiming i18n support.

**Delivers:**
- useRSVP hook tests with fake timers
- useLibrary hook tests with localStorage mocks
- useSettings hook tests with localStorage mocks
- Component rendering tests (WordDisplay, Controls, TextInput, SettingsModal, Library)
- CJK composition event tests
- RTL text rendering tests
- Keyboard shortcut tests with userEvent

**Uses:**
- @testing-library/react renderHook()
- @testing-library/user-event for keyboard interactions
- vitest-localstorage-mock for storage

**Implements:**
- Custom hooks testing architecture
- Component testing patterns
- Multi-language test coverage

**Avoids:**
- Pitfall 4 (CJK IME events) with manual composition event dispatch
- Pitfall 5 (RTL text) by including Arabic/Hebrew test cases
- Pitfall 6 (keyboard shortcuts) using userEvent.keyboard()

**Target:** 85%+ coverage on hooks/, 70%+ coverage on components/, keyboard nav verified

### Phase 3: E2E Critical Workflows (Week 5-6)
**Rationale:** E2E tests validate full user journeys after unit/integration tests prove components work. Use Playwright for cross-browser testing and visual validation that jsdom can't provide.

**Delivers:**
- Playwright configuration with webServer integration
- Complete reading flow E2E test (paste → play → pause → complete)
- Library management E2E test (save → load → delete)
- Settings persistence E2E test (adjust WPM → reload → verify)
- Keyboard shortcuts E2E test (Space, arrows, Escape)
- Focus mode E2E test (auto-activation, click-to-pause)

**Uses:**
- Playwright cross-browser (Chromium, Firefox, WebKit)
- localStorage persistence validation
- Real browser timing and rendering

**Implements:**
- Critical user path coverage
- Cross-page interactions
- Visual correctness validation

**Avoids:**
- Pitfall 7 (async Server Components) by using E2E for server-rendered pages
- Pitfall 8 (breaking existing behavior) by testing only critical paths, not exhaustive coverage

**Target:** 3-5 critical user paths covered, cross-browser validated, CI integrated

### Phase 4: CI/CD Integration & Polish (Week 7)
**Rationale:** Automate testing in CI after test suite is stable. Fill coverage gaps, refactor brittle tests, document best practices.

**Delivers:**
- GitHub Actions workflow (test on PR, coverage reporting)
- Coverage gap analysis and additional tests
- Testing guidelines documentation
- Pre-commit hooks (optional)
- Team onboarding guide

**Addresses:**
- Overall 75% coverage target (70% minimum)
- Automated quality gates
- Developer experience improvements

**Target:** Green CI on every PR, coverage trending visible, testing patterns documented

### Phase Ordering Rationale

**Dependencies drive order:**
- Utils have no dependencies → Test first
- Hooks depend on utils → Test second
- Components depend on hooks → Test third
- E2E validates full stack → Test last

**Risk mitigation:**
- Phase 1 establishes patterns to avoid Pitfalls 1-3 (most critical)
- Phase 2 addresses i18n pitfalls before shipping multi-language
- Phase 3 validates real browser behavior that jsdom can't catch

**Incremental value:**
- Each phase delivers working tests, not just setup
- CI can run after Phase 1 (faster feedback loop)
- Team learns testing patterns progressively

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 2 (CJK/RTL Testing):** IME composition events may have improved in React 18+, need to validate if manual event dispatch still required. Research phase-specific if issues found during implementation.
- **Phase 3 (Visual Regression):** Pivot alignment testing at sub-pixel level not fully researched. Playwright visual regression setup may need investigation if alignment bugs surface.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Utils Testing):** Pure function testing is well-documented, no additional research needed.
- **Phase 3 (E2E Setup):** Playwright + Next.js integration has official docs and established patterns.
- **Phase 4 (CI/CD):** GitHub Actions workflows for Next.js are standard, multiple examples available.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official Next.js docs recommend Vitest, multiple 2026 sources confirm 10-20x speed improvement. Playwright vs Cypress benchmarks from enterprise case studies. Version compatibility verified. |
| Features | HIGH | React Testing Library best practices well-documented. Coverage targets (70-80%) from industry standards (Atlassian, Qt). CJK/RTL testing requirements from internationalization guides. |
| Architecture | HIGH | Next.js 14 colocation strategy officially supported. Three-tier testing approach (unit/integration/E2E) is industry standard. Test ordering by dependencies is established pattern. |
| Pitfalls | HIGH for React/Next.js patterns, MEDIUM for CJK IME | Fake timer deadlock confirmed in Testing Library docs. localStorage pollution from jest-localstorage-mock docs. CJK IME issues from 2017-2020 GitHub issues may be resolved in React 18+. |

**Overall confidence:** HIGH

ReadFaster's testing requirements align with well-documented patterns for Next.js/React apps. The critical pitfalls have clear solutions. Main uncertainty is whether React 18's automatic batching resolved CJK composition event issues from earlier React versions—this can be validated during Phase 2 implementation.

### Gaps to Address

**CJK IME Composition Events:** Research found GitHub issues from 2017-2020 about composition events not working correctly in controlled components. Unclear if React 18's automatic batching (released 2022) resolved these issues. Recommendation: Test manually during Phase 2, add E2E tests if unit tests insufficient.

**Grapheme Cluster Handling for Emoji:** Found the problem (surrogate pairs make 'hello👍'.length === 6, not 5), but no authoritative library recommendation for emoji-aware string manipulation in 2026. Recommendation: Use Array.from(word) for grapheme-aware length, defer full Unicode normalization to v2+ unless users report emoji bugs.

**Performance Benchmarks:** Found setup guides but no recent benchmarks for Vitest vs Jest on timer-heavy test suites like ReadFaster's. Recommendation: Measure during Phase 1 implementation, document actual speed improvements for future reference.

**Visual Regression Testing:** Playwright recommended for visual testing, but no specific guidance on testing sub-pixel alignment of pivot highlighting. Recommendation: Start with functional tests (correct character highlighted), defer pixel-perfect alignment to Phase 3 E2E tests if bugs found.

## Sources

### Primary (HIGH confidence)
- [Vitest Guide](https://vitest.dev/guide/) — Vitest v4.0.17 documentation
- [Testing: Vitest | Next.js](https://nextjs.org/docs/app/guides/testing/vitest) — Next.js official Vitest integration guide
- [Playwright Documentation](https://playwright.dev/docs/intro) — Playwright v1.57 documentation
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) — Official RTL documentation
- [Using Fake Timers - Testing Library](https://testing-library.com/docs/using-fake-timers/) — Timer deadlock solution
- [Kent C. Dodds: Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) — Implementation details pitfall

### Secondary (MEDIUM confidence)
- [Jest vs Vitest: Which Test Runner Should You Use in 2025?](https://medium.com/@ruverd/jest-vs-vitest-which-test-runner-should-you-use-in-2025-5c85e4f2bda9) — Speed comparison
- [Cypress vs Playwright: I Ran 500 E2E Tests in Both. Here's What Broke.](https://medium.com/lets-code-future/cypress-vs-playwright-i-ran-500-e2e-tests-in-both-heres-what-broke-2afc448470ee) — E2E framework benchmark
- [Internationalization Testing: Best Practices Guide for 2026](https://aqua-cloud.io/internationalization-testing/) — CJK/RTL requirements
- [Fasiha: CJK Text Processing](https://fasiha.github.io/cjk-2021/) — Chinese/Japanese/Korean handling
- [GitHub Issue: Composition Events problem in controlled components](https://github.com/facebook/react/issues/8683) — CJK IME pitfall
- [Understand Legacy Code: Best way to start testing untested code](https://understandlegacycode.com/blog/best-way-to-start-testing-untested-code/) — "Test what you touch" strategy

### Tertiary (LOW confidence, needs validation)
- [GitHub Issue: ReactNative's setState breaks text input for CJK](https://github.com/facebook/react-native/issues/19339) — May be React Native-specific, not web
- [PlaceholderText: Complete Guide to RTL Layout Testing](https://placeholdertext.org/blog/the-complete-guide-to-rtl-right-to-left-layout-testing-arabic-hebrew-more/) — Visual regression approaches

---
*Research completed: 2026-01-28*
*Ready for roadmap: yes*
