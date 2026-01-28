# Phase 4: Integration Tests - Research

**Researched:** 2026-01-28
**Domain:** React integration testing with hooks, components, timers, and localStorage
**Confidence:** HIGH

## Summary

Integration testing for React hooks and components using Vitest and React Testing Library (RTL) in 2026 follows a user-centric approach that tests behavior rather than implementation details. The standard stack combines Vitest (fast, modern test runner with built-in fake timers) with React Testing Library (behavior-focused component testing) in a jsdom environment.

Key insights for this phase: (1) Testing hooks is best done by rendering actual components rather than using `renderHook` for integration tests, as it produces more maintainable tests; (2) Fake timer setup requires careful per-test lifecycle management to avoid deadlocks with React Testing Library's async utilities; (3) localStorage persistence testing uses `vi.spyOn(Storage.prototype)` pattern established in Phase 3; (4) Multi-language rendering verification needs only smoke tests confirming successful render without errors.

**Primary recommendation:** Use `render()` with test wrapper components for integration tests, establish per-test fake timer lifecycle (`beforeEach`/`afterEach`), wrap timer advancement in `act()`, and focus on state transitions rather than timing precision.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vitest | 4.0+ | Test runner with fake timers | 10-20× faster than Jest, native ESM support, same API surface |
| @testing-library/react | 16.3+ | Component & hook testing | Industry standard, behavior-focused, includes `renderHook` since v13.1 |
| @testing-library/jest-dom | 6.9+ | Custom DOM matchers | Readable assertions like `toBeInTheDocument()` |
| jsdom | 27.4+ | Browser API emulation | localStorage, DOM APIs in Node test environment |
| @vitejs/plugin-react | 5.1+ | React JSX support | Vitest requires this for React component testing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vite-tsconfig-paths | 6.0+ | Path alias resolution | Enable @/* imports in tests (already installed Phase 3) |
| @vitest/coverage-v8 | 4.0+ | Code coverage | Already configured for text reporter only |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Jest | Jest is stable/enterprise but 10-20× slower on large codebases |
| render() | renderHook() | renderHook is convenient for hook libraries but less readable/robust for integration tests |
| vi.useFakeTimers() | Real timers with waitFor | Fake timers are faster and deterministic, real timers are brittle |

**Installation:**
```bash
# Already installed in Phase 3
# No additional dependencies needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── __tests__/
│   └── integration/           # Integration tests (separate from unit tests)
│       ├── hooks/
│       │   ├── useRSVP.test.ts
│       │   ├── useLibrary.test.ts
│       │   └── useSettings.test.ts
│       ├── components/
│       │   ├── WordDisplay.test.tsx
│       │   ├── Controls.test.tsx
│       │   └── SettingsModal.test.tsx
│       └── integration-utils.ts   # Custom render wrappers, test helpers
├── test-utils/               # Shared utilities (fixtures, setup)
│   ├── setup.ts
│   └── fixtures.ts
```

### Pattern 1: Testing Hooks with Real Components (Integration Approach)

**What:** Render a test component that uses the hook rather than using `renderHook()` for integration tests.

**When to use:** Integration tests that verify hooks work within component context, state management flows, and user interactions.

**Example:**
```typescript
// ✅ Recommended: Test hook through component
function TestComponent() {
  const { isPlaying, start, pause } = useRSVP()
  return (
    <div>
      <span data-testid="status">{isPlaying ? 'playing' : 'paused'}</span>
      <button onClick={() => start('hello world')}>Start</button>
      <button onClick={pause}>Pause</button>
    </div>
  )
}

it('pauses playback when pause button clicked', () => {
  render(<TestComponent />)
  fireEvent.click(screen.getByText('Start'))
  fireEvent.click(screen.getByText('Pause'))
  expect(screen.getByTestId('status')).toHaveTextContent('paused')
})

// ❌ Avoid for integration tests: renderHook hides behavior
it('pauses playback', () => {
  const { result } = renderHook(() => useRSVP())
  act(() => result.current.start('hello'))
  act(() => result.current.pause())
  expect(result.current.isPlaying).toBe(false)  // Hidden behind abstraction
})
```

**Source:** [React Testing Library API docs](https://testing-library.com/docs/react-testing-library/api/) explicitly recommends "prefer `render` since a custom test component results in more readable and robust tests."

### Pattern 2: Fake Timer Lifecycle Management

**What:** Per-test setup/teardown of fake timers to avoid state leakage and deadlocks with React Testing Library async utilities.

**When to use:** Any test involving `setInterval`, `setTimeout`, or async state updates with timers.

**Example:**
```typescript
// Source: https://testing-library.com/docs/using-fake-timers/
describe('useRSVP hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()  // Critical: flush before switching
    vi.useRealTimers()
  })

  it('advances to next word after interval', async () => {
    render(<TestComponent />)

    fireEvent.click(screen.getByText('Start'))

    // Wrap timer advancement in act() to flush React updates
    await act(async () => {
      vi.advanceTimersByTime(200)  // wpm=300 -> 200ms interval
    })

    expect(screen.getByTestId('current-word')).toHaveTextContent('world')
  })
})
```

**Critical insight:** Omitting `vi.runOnlyPendingTimers()` causes "scheduled tasks won't get executed and you'll get an unexpected behavior" (RTL docs). This is especially problematic with third-party libraries that schedule cleanup tasks.

### Pattern 3: localStorage Mocking with Storage.prototype Spies

**What:** Mock localStorage using `vi.spyOn(Storage.prototype)` pattern established in Phase 3 (03-03).

**When to use:** Testing hooks that persist to localStorage (useLibrary, useSettings).

**Example:**
```typescript
// Established pattern from Phase 3
describe('useSettings hook', () => {
  let getItemSpy: ReturnType<typeof vi.spyOn>
  let setItemSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
  })

  afterEach(() => {
    getItemSpy.mockRestore()
    setItemSpy.mockRestore()
    localStorage.clear()
  })

  it('loads settings from localStorage on mount', () => {
    const mockSettings = { fontFamily: 'serif', pivotColor: '#00FF00' }
    getItemSpy.mockReturnValue(JSON.stringify(mockSettings))

    render(<TestComponent />)

    expect(screen.getByText(/serif/i)).toBeInTheDocument()
  })
})
```

**Why this pattern:** jsdom limitations require spying on `Storage.prototype` rather than directly mocking `localStorage`. This pattern was validated in Phase 3 unit tests.

### Pattern 4: User Interaction Testing

**What:** Prefer `userEvent` over `fireEvent` for realistic user interactions, but use `fireEvent` for keyboard shortcuts in integration tests.

**When to use:** Testing button clicks, keyboard shortcuts, form interactions.

**Example:**
```typescript
// Source: https://blog.mimacom.com/react-testing-library-fireevent-vs-userevent/
import { fireEvent } from '@testing-library/react'

it('toggles playback with spacebar', () => {
  render(<TestComponent />)

  // fireEvent for keyboard shortcuts (simpler for single events)
  fireEvent.keyDown(document, { key: ' ', code: 'Space' })

  expect(screen.getByTestId('status')).toHaveTextContent('playing')
})

// Note: userEvent would be preferred for typing text:
// await userEvent.type(input, 'hello world')
// But keyboard shortcuts work fine with fireEvent for integration tests
```

**Tradeoff:** `userEvent` simulates complete interaction chains (keyDown + keyPress + keyUp), but `fireEvent` is simpler for testing single keyboard shortcuts in integration context.

### Anti-Patterns to Avoid

- **Testing implementation details:** Don't check state values directly; verify rendered output that users see
- **act() wrapping render/fireEvent:** These are already wrapped internally; explicit wrapping causes warnings
- **Global fake timers without cleanup:** Always restore real timers in `afterEach` to prevent test pollution
- **Testing exact timing:** Verify state transitions (word changed) not millisecond precision (changed at exactly 200ms)
- **Focus management assertions in jsdom:** Skip focus checks as they're brittle in jsdom environment

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Custom hook testing utilities | Custom `renderHook` wrapper | `renderHook` from `@testing-library/react` (v13.1+) or test components | Built-in since RTL 13.1, handles React 18 concurrent mode |
| Timer mocking utilities | Custom timer mock/spy system | `vi.useFakeTimers()` from Vitest | Vitest provides complete fake timer implementation with act() compatibility |
| localStorage test doubles | Mock localStorage object | `vi.spyOn(Storage.prototype)` + real localStorage in jsdom | jsdom provides real localStorage; spies verify calls without reimplementing |
| Custom render with providers | Manual wrapper components per test | Custom render function in `integration-utils.ts` | Centralize provider setup (future: theme, i18n) |

**Key insight:** Vitest and React Testing Library provide all necessary primitives for integration testing. Custom utilities should only wrap these for test-specific context (providers, common setup), not reimplement core functionality.

## Common Pitfalls

### Pitfall 1: Fake Timer Deadlock with waitFor

**What goes wrong:** Using `vi.runAllTimersAsync()` with React Testing Library's `waitFor` causes "not wrapped in act()" warnings or test timeouts.

**Why it happens:** React 18's concurrent rendering + async timer APIs create timing conflicts. `waitFor` expects real time advancement, but `runAllTimersAsync()` exhausts all timers instantly.

**How to avoid:**
- Use `vi.advanceTimersByTime(ms)` wrapped in `act()` instead of `runAllTimersAsync()`
- Test state transitions, not exact timing: "word changed after advancement" not "word changed at 200ms"
- Start tests paused, manually trigger play for explicit control

**Warning signs:**
```
Warning: An update to TestComponent inside a test was not wrapped in act(...)
```

**Solution pattern:**
```typescript
// ❌ Avoid: runAllTimersAsync with React 18
await act(async () => {
  await vi.runAllTimersAsync()  // Causes act() warning
})

// ✅ Use: Controlled advancement
await act(async () => {
  vi.advanceTimersByTime(200)  // Advance by known interval
})
```

**Source:** [Vitest issue #7196](https://github.com/vitest-dev/vitest/issues/7196) and [RTL issue #1198](https://github.com/testing-library/react-testing-library/issues/1198) document this ongoing challenge as of January 2025.

### Pitfall 2: MSW Compatibility with Fake Timers

**What goes wrong:** Using `vi.useFakeTimers()` with MSW v2 causes tests to hang or fail unexpectedly.

**Why it happens:** MSW v2 uses `queueMicrotask` internally, and faking this breaks MSW's request handling.

**How to avoid:** Configure `toFake` option to exclude `queueMicrotask`:

```typescript
beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval']
    // Exclude queueMicrotask to preserve MSW functionality
  })
})
```

**Warning signs:** Tests hang indefinitely, MSW handlers never fire, network requests timeout.

**Note:** This project doesn't use MSW yet, but documenting for future API mocking phases.

### Pitfall 3: Missing Timer Cleanup Between Tests

**What goes wrong:** Timers from one test leak into subsequent tests, causing flaky failures or unexpected behavior.

**Why it happens:** Forgetting `vi.useRealTimers()` in `afterEach` leaves fake timers active globally.

**How to avoid:**
```typescript
afterEach(() => {
  vi.runOnlyPendingTimers()  // Flush scheduled timers
  vi.useRealTimers()         // Restore real timers
  cleanup()                  // RTL cleanup (already in setup.ts)
})
```

**Warning signs:** Tests pass individually but fail when run together; random timeout errors.

### Pitfall 4: Testing Multi-Language Rendering Logic vs Visual Display

**What goes wrong:** Integration tests try to verify RTL text direction styling or CJK character spacing, which are browser-specific rendering concerns.

**Why it happens:** Confusion between "does the text render" (integration) vs "does it look correct" (visual regression).

**How to avoid:**
- Integration tests: Verify text appears in DOM without error (smoke test)
- Visual tests: Out of scope (would need Playwright/Chromatic for real browser rendering)
- Unit tests already validate: Pivot calculation correctness for CJK/RTL/emoji

**Pattern for multi-language integration tests:**
```typescript
describe('multi-language rendering', () => {
  it('renders CJK text without error', () => {
    const { container } = render(<WordDisplay word="日本語" />)
    expect(container.querySelector('.pivot')).toHaveTextContent('本')
    // Don't test: font metrics, character width, visual spacing
  })

  it('renders RTL text without error', () => {
    const { container } = render(<WordDisplay word="مرحبا" />)
    expect(container.querySelector('.pivot')).toBeInTheDocument()
    // Don't test: direction: rtl CSS, visual right-to-left flow
  })
})
```

**Warning signs:** Tests check `getComputedStyle()`, measure element widths, or assert on CSS properties.

## Code Examples

Verified patterns from official sources:

### Testing Hook State Transitions with Timers
```typescript
// Source: https://testing-library.com/docs/using-fake-timers/
// Combined with https://vitest.dev/guide/mocking/timers
describe('useRSVP playback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('advances word index when playing', async () => {
    function TestComponent() {
      const { currentIndex, start, currentWord } = useRSVP()
      return (
        <div>
          <button onClick={() => start('hello world')}>Start</button>
          <span data-testid="index">{currentIndex}</span>
          <span data-testid="word">{currentWord}</span>
        </div>
      )
    }

    render(<TestComponent />)

    fireEvent.click(screen.getByText('Start'))
    expect(screen.getByTestId('word')).toHaveTextContent('hello')

    // Advance by interval (300 WPM = 200ms)
    await act(async () => {
      vi.advanceTimersByTime(200)
    })

    expect(screen.getByTestId('word')).toHaveTextContent('world')
    expect(screen.getByTestId('index')).toHaveTextContent('1')
  })
})
```

### Testing localStorage Persistence with useEffect
```typescript
// Pattern established in Phase 3 (03-03-PLAN.md)
describe('useSettings persistence', () => {
  let getItemSpy: ReturnType<typeof vi.spyOn>
  let setItemSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
  })

  afterEach(() => {
    getItemSpy.mockRestore()
    setItemSpy.mockRestore()
    localStorage.clear()
  })

  it('loads settings from localStorage on mount', () => {
    const savedSettings = { fontFamily: 'serif', pivotColor: '#00FF00' }
    getItemSpy.mockReturnValue(JSON.stringify(savedSettings))

    function TestComponent() {
      const { settings } = useSettings()
      return <div data-testid="font">{settings.fontFamily}</div>
    }

    render(<TestComponent />)

    expect(screen.getByTestId('font')).toHaveTextContent('serif')
    expect(getItemSpy).toHaveBeenCalledWith('readfaster_settings')
  })

  it('persists settings updates to localStorage', () => {
    function TestComponent() {
      const { settings, updateSettings } = useSettings()
      return (
        <div>
          <span data-testid="color">{settings.pivotColor}</span>
          <button onClick={() => updateSettings({ pivotColor: '#00FF00' })}>
            Change
          </button>
        </div>
      )
    }

    render(<TestComponent />)
    fireEvent.click(screen.getByText('Change'))

    expect(setItemSpy).toHaveBeenCalledWith(
      'readfaster_settings',
      expect.stringContaining('#00FF00')
    )
  })
})
```

### Testing Component User Interactions
```typescript
// Source: https://blog.mimacom.com/react-testing-library-fireevent-vs-userevent/
describe('Controls component', () => {
  it('enables pause button when playing', () => {
    const mockPause = vi.fn()

    render(
      <Controls
        isPlaying={true}
        hasWords={true}
        hasText={true}
        onPause={mockPause}
        // ... other props
      />
    )

    const pauseButton = screen.getByText('Pause')
    expect(pauseButton).not.toBeDisabled()

    fireEvent.click(pauseButton)
    expect(mockPause).toHaveBeenCalledTimes(1)
  })

  it('disables start button when playing', () => {
    render(
      <Controls
        isPlaying={true}
        hasText={true}
        // ... other props
      />
    )

    expect(screen.getByText('Start')).toBeDisabled()
  })
})
```

### Testing Keyboard Shortcuts
```typescript
// Source: https://testing-library.com/docs/dom-testing-library/api-events/
describe('keyboard shortcuts', () => {
  it('toggles playback with spacebar', () => {
    const mockStart = vi.fn()
    const mockPause = vi.fn()

    render(
      <Controls
        isPlaying={false}
        hasText={true}
        onStart={mockStart}
        onPause={mockPause}
        // ... other props
      />
    )

    // Space bar to start
    fireEvent.keyDown(document, { key: ' ', code: 'Space' })
    expect(mockStart).toHaveBeenCalled()
  })
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@testing-library/react-hooks` package | `renderHook` built into `@testing-library/react` | React 18 / RTL 13.1+ (2022) | No separate package needed; better React 18 concurrent mode support |
| Jest + jsdom setup | Vitest with native jsdom | Vitest 0.1+ (2021) | 10-20× faster test execution, native ESM, simpler config |
| `jest.useFakeTimers('legacy')` | `vi.useFakeTimers()` with modern timers | Vitest 1.0+ (2023) | Better async/await support, no "legacy" vs "modern" confusion |
| Testing implementation (state, refs) | Testing behavior (rendered output) | RTL philosophy (ongoing) | More maintainable tests that survive refactoring |
| `userEvent` required for all interactions | `fireEvent` acceptable for keyboard shortcuts | RTL best practices (2024+) | Pragmatic balance: userEvent for typing, fireEvent for single events |

**Deprecated/outdated:**
- `@testing-library/react-hooks`: Merged into `@testing-library/react` in v13.1
- `jest.useFakeTimers('legacy')`: Removed in Jest 27+
- `cleanup()` in every `afterEach`: Auto-cleanup via `@testing-library/react` config (already in setup.ts)
- `wrapper` prop in every `render()` call: Centralize in custom render function

## Open Questions

1. **Should we test keyboard shortcuts at integration level or defer to E2E?**
   - What we know: Phase context says "keyboard shortcuts tested in integration tests"
   - What's unclear: Scope of keyboard testing (just space/arrows or full suite?)
   - Recommendation: Test critical shortcuts only (space=play/pause, left/right=skip) at integration level. Full keyboard accessibility testing deferred to E2E if needed.

2. **How deeply to test multi-language rendering?**
   - What we know: Context says "smoke tests only," unit tests already verify pivot calculation
   - What's unclear: What constitutes "successful render" for CJK/RTL?
   - Recommendation: One test per language type confirming pivot element exists and contains expected character. Don't test visual layout/spacing.

3. **Should integration tests use real useSettings/useLibrary or mock them?**
   - What we know: These hooks are simple wrappers around storage utilities already unit tested
   - What's unclear: Whether to test full integration (real hooks + real storage mocks) or mock hooks
   - Recommendation: Use real hooks with Storage.prototype spies for true integration. Hook behavior is simple enough to test without additional mocking layer.

## Sources

### Primary (HIGH confidence)
- [React Testing Library API](https://testing-library.com/docs/react-testing-library/api/) - renderHook vs render guidance
- [Using Fake Timers with RTL](https://testing-library.com/docs/using-fake-timers/) - Setup/teardown patterns, act() usage
- [Vitest Fake Timers](https://vitest.dev/guide/mocking/timers) - API reference and examples
- Phase 3 plans (03-01, 03-02, 03-03) - Established patterns for this project

### Secondary (MEDIUM confidence)
- [React Testing Library best practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) - Kent C. Dodds guidance
- [fireEvent vs userEvent](https://blog.mimacom.com/react-testing-library-fireevent-vs-userevent/) - When to use each
- [Testing React hooks with Vitest](https://mayashavin.com/articles/test-react-hooks-with-vitest) - Modern patterns

### Tertiary (LOW confidence)
- [Testing in 2026 strategies](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies) - General landscape (verify specific claims)
- GitHub issues ([#7196](https://github.com/vitest-dev/vitest/issues/7196), [#1198](https://github.com/testing-library/react-testing-library/issues/1198)) - Known issues, workarounds evolving

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation, established in Phase 3
- Architecture: HIGH - RTL official patterns, verified in Phase 3 unit tests
- Pitfalls: MEDIUM - Known issues documented in GitHub, but solutions evolving (timer deadlock patterns)

**Research date:** 2026-01-28
**Valid until:** 30 days (2026-02-27) - Stable testing stack, minimal API churn expected
