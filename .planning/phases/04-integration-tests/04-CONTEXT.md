# Phase 4: Integration Tests - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

React hooks and components verified for state management and user interactions. Tests cover useRSVP hook state transitions, persistence hooks (useLibrary, useSettings), WordDisplay rendering, and component interactions. Multi-language rendering is verified at smoke test level.

</domain>

<decisions>
## Implementation Decisions

### Test organization
- Files organized by component/hook — mirrors source structure (useRSVP.test.ts, WordDisplay.test.tsx)
- Tests live in `__tests__/integration/` — separate from unit tests
- Dedicated `integration-utils.ts` for custom render wrappers and setup helpers
- Test descriptions are behavior-focused ("pauses playback when user clicks word display")

### Timer patterns
- Per-test setup/teardown — `vi.useFakeTimers()` in beforeEach, `vi.useRealTimers()` in afterEach
- Timer advancement wrapped in `act()` — `await act(() => vi.advanceTimersByTime(ms))` to flush React updates
- Tests verify state transitions only, not exact timing — more maintainable
- Tests start paused, manually trigger play — explicit control over test flow

### Multi-language depth
- Smoke tests only — one test per language type (CJK, RTL, emoji)
- No RTL text direction styling verification — unit tests cover logic, trust browser for direction
- Reuse fixtures.ts from unit tests — consistent test data with documented edge cases
- Verify successful render only — component mounts without error, text appears in DOM

### Interaction scope
- Critical click paths only — play/pause button, click-to-pause on WordDisplay, settings modal open/close
- Keyboard shortcuts tested in integration tests — space for play/pause, arrows for speed
- No focus management verification — skip focus assertions, too brittle in jsdom
- Mock localStorage with Storage.prototype spies — same pattern as unit tests for persistence

### Claude's Discretion
- Specific test helper implementations in integration-utils.ts
- Grouping of describe blocks within test files
- Exact assertion methods (toBeInTheDocument vs getBy queries)
- Which edge cases warrant integration vs unit coverage

</decisions>

<specifics>
## Specific Ideas

- Timer tests must avoid deadlock patterns — STATE.md notes this as a concern
- Reuse Storage.prototype spy pattern established in Phase 3 (03-03)
- Behavior-focused descriptions align with user story format ("when user does X, Y happens")

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-integration-tests*
*Context gathered: 2026-01-28*
