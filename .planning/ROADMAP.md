# Roadmap: ReadFaster

## Milestones

- ✅ **v1.0 Enhancement** - Phases 1-2 (shipped 2026-01-28)
- ✅ **v1.1 Reliability & Testing** - Phases 3-5 (shipped 2026-01-28)

## Phases

<details>
<summary>✅ v1.0 Enhancement (Phases 1-2) - SHIPPED 2026-01-28</summary>

### Phase 1: Focus Mode Experience
**Goal**: Auto-activating immersive reading mode with responsive scaling
**Plans**: 2 plans

Plans:
- [x] 01-01: Auto-activate focus mode on reading start
- [x] 01-02: Enhanced focus mode styling with responsive word display

### Phase 2: Pivot Customization
**Goal**: User-customizable pivot letter highlighting
**Plans**: 2 plans

Plans:
- [x] 02-01: Focus mode UX refinement (click-to-pause, debouncing)
- [x] 02-02: Pivot highlight customization UI

</details>

### ✅ v1.1 Reliability & Testing (Complete)

**Milestone Goal:** Comprehensive test coverage for RSVP algorithms, React components, and critical user workflows with automated quality gates.
**Completed:** 2026-01-28

#### ✅ Phase 3: Test Infrastructure & Unit Tests (Complete)
**Goal**: Testing foundation established with complete utility function coverage
**Depends on**: Phase 2 (v1.0 shipped)
**Requirements**: INFRA-01, INFRA-02, INFRA-04, UNIT-01, UNIT-02, UNIT-03, UNIT-04, UNIT-05, UNIT-06, UNIT-07, UNIT-08, UNIT-09
**Success Criteria** (what must be TRUE):
  1. ✓ Developer can run `npm test` to execute unit tests with Vitest
  2. ✓ All RSVP utility functions (tokenize, calculatePivotIndex, wpmToInterval, splitWordByPivot) pass tests for standard text
  3. ✓ Multi-language text (CJK, RTL, accented, emoji) processes correctly through tokenize and calculatePivotIndex
  4. ✓ Edge cases (empty strings, single characters, 100+ character words) handle gracefully without errors
  5. ✓ Storage utilities (save/load session, library management) work correctly with localStorage mocking
**Plans**: 3 plans
**Completed**: 2026-01-28

Plans:
- [x] 03-01: Test infrastructure setup (Vitest, dependencies, test-utils)
- [x] 03-02: RSVP utility unit tests (tokenize, calculatePivotIndex, wpmToInterval, splitWordByPivot)
- [x] 03-03: Storage utility unit tests (session, library, settings with localStorage mocking)

#### ✅ Phase 4: Integration Tests (Complete)
**Goal**: React hooks and components verified for state management and user interactions
**Depends on**: Phase 3
**Requirements**: INTG-01, INTG-02, INTG-03, INTG-04, INTG-05, INTG-06, INTG-07, INTG-08
**Success Criteria** (what must be TRUE):
  1. ✓ useRSVP hook correctly manages play/pause/reset state transitions with fake timers
  2. ✓ useLibrary and useSettings hooks persist data to localStorage and restore on component mount
  3. ✓ WordDisplay component renders pivot letter highlighting correctly for all word types
  4. ✓ Controls and SettingsModal components respond to user interactions (clicks, keyboard input)
  5. ✓ Components render multi-language text correctly (CJK characters, RTL text direction)
**Plans**: 3 plans
**Completed**: 2026-01-28

Plans:
- [x] 04-01: Integration test infrastructure and useRSVP hook tests (INTG-01, INTG-02)
- [x] 04-02: Persistence hooks tests - useLibrary and useSettings (INTG-03, INTG-04)
- [x] 04-03: Component integration tests - WordDisplay, Controls, SettingsModal (INTG-05, INTG-06, INTG-07, INTG-08)

#### ✅ Phase 5: E2E Tests & CI/CD (Complete)
**Goal**: Critical user workflows validated across browsers with automated CI quality gates
**Depends on**: Phase 4
**Requirements**: E2E-01, E2E-02, E2E-03, E2E-04, E2E-05, E2E-06, E2E-07, E2E-08, E2E-09, QUAL-01, QUAL-02, QUAL-03
**Success Criteria** (what must be TRUE):
  1. ✓ User can complete full reading flow (paste text → play → pause → resume → complete) in all browsers
  2. ✓ Keyboard shortcuts (space for play/pause, arrows for speed) work correctly
  3. ✓ Focus mode activates on play and click-to-pause exits correctly
  4. ✓ Settings and library changes persist across browser page reloads
  5. ✓ All E2E tests pass in Chrome, Firefox, and Safari/WebKit browsers
  6. ✓ Test coverage reaches 75% minimum with critical paths (rsvp.ts, hooks) at 90%+
  7. ✓ GitHub Actions CI pipeline runs all tests on PR and blocks merge if tests fail
**Plans**: 4 plans
**Completed**: 2026-01-28

Plans:
- [x] 05-01: Playwright infrastructure and Page Object Model setup (INFRA-03)
- [x] 05-02: Reading flow and keyboard shortcut E2E tests (E2E-01, E2E-02, E2E-07, E2E-08, E2E-09)
- [x] 05-03: Focus mode, settings, and library E2E tests (E2E-03, E2E-04, E2E-05, E2E-06)
- [x] 05-04: GitHub Actions CI/CD pipeline and coverage thresholds (INFRA-05, QUAL-01, QUAL-02, QUAL-03)

## Progress

**Execution Order:**
Phases execute in numeric order: 3 → 4 → 5

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Focus Mode Experience | v1.0 | 2/2 | Complete | 2026-01-28 |
| 2. Pivot Customization | v1.0 | 2/2 | Complete | 2026-01-28 |
| 3. Test Infrastructure & Unit Tests | v1.1 | 3/3 | Complete | 2026-01-28 |
| 4. Integration Tests | v1.1 | 3/3 | Complete | 2026-01-28 |
| 5. E2E Tests & CI/CD | v1.1 | 4/4 | Complete | 2026-01-28 |

---
*Last updated: 2026-01-28 — v1.1 Milestone Complete*
