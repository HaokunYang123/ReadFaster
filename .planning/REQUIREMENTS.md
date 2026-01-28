# Requirements: ReadFaster v1.1

**Defined:** 2026-01-28
**Core Value:** Users can read text faster by focusing on one word at a time with the pivot letter centered and highlighted.

## v1.1 Requirements

Requirements for reliability and testing milestone. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: Vitest configured with Next.js 14 and TypeScript support
- [ ] **INFRA-02**: React Testing Library installed with jsdom environment
- [ ] **INFRA-03**: Playwright configured for E2E testing
- [ ] **INFRA-04**: Test scripts added to package.json (test, test:coverage, test:e2e)
- [ ] **INFRA-05**: GitHub Actions workflow runs tests on PR and push

### Unit Tests

- [ ] **UNIT-01**: `tokenize()` tested with various whitespace patterns
- [ ] **UNIT-02**: `tokenize()` tested with multi-language text (CJK, RTL, accented)
- [ ] **UNIT-03**: `calculatePivotIndex()` tested for words length 0-20+
- [ ] **UNIT-04**: `calculatePivotIndex()` tested with CJK characters
- [ ] **UNIT-05**: `calculatePivotIndex()` tested with emoji and surrogate pairs
- [ ] **UNIT-06**: `splitWordByPivot()` tested across all word types
- [ ] **UNIT-07**: `wpmToInterval()` tested for boundary values (100, 1000)
- [ ] **UNIT-08**: Edge cases tested: empty string, single char, very long words (100+ chars)
- [ ] **UNIT-09**: Storage utilities tested with localStorage mocking

### Integration Tests

- [ ] **INTG-01**: `useRSVP` hook tested with fake timers for playback
- [ ] **INTG-02**: `useRSVP` hook tested for play/pause/reset state transitions
- [ ] **INTG-03**: `useLibrary` hook tested with localStorage persistence
- [ ] **INTG-04**: `useSettings` hook tested with default values and updates
- [ ] **INTG-05**: `WordDisplay` component renders pivot correctly
- [ ] **INTG-06**: `Controls` component handles user interactions
- [ ] **INTG-07**: `SettingsModal` component updates settings state
- [ ] **INTG-08**: Components tested with multi-language text rendering

### E2E Tests

- [ ] **E2E-01**: Complete reading flow: paste text → play → pause → resume → complete
- [ ] **E2E-02**: Keyboard shortcuts: space (play/pause), arrows (speed adjustment)
- [ ] **E2E-03**: Focus mode activates on play, exits on pause/complete
- [ ] **E2E-04**: Click-to-pause works in focus mode
- [ ] **E2E-05**: Settings changes persist across page reload
- [ ] **E2E-06**: Library saves and loads texts correctly
- [ ] **E2E-07**: Tests pass in Chrome browser
- [ ] **E2E-08**: Tests pass in Firefox browser
- [ ] **E2E-09**: Tests pass in Safari/WebKit browser

### Coverage & Quality

- [ ] **QUAL-01**: Overall test coverage reaches 75% minimum
- [ ] **QUAL-02**: Critical paths (rsvp.ts, hooks) reach 90% coverage
- [ ] **QUAL-03**: All tests pass in CI before merge

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### Advanced Testing

- **ADV-01**: Property-based testing with fast-check for algorithm fuzzing
- **ADV-02**: Mutation testing to verify test quality
- **ADV-03**: Accessibility testing with jest-axe
- **ADV-04**: Visual regression testing with Playwright screenshots
- **ADV-05**: Performance benchmarks for RSVP timing accuracy

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| 100% code coverage | Diminishing returns, focus on critical paths |
| File parser unit tests | Complex mocking (PDF.js, Tesseract), defer to manual testing |
| Mobile device E2E | Desktop-first, add mobile testing in future milestone |
| Load/stress testing | Not needed for single-user app |
| API route testing | fetch-url route is simple, E2E covers it |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 3 | Pending |
| INFRA-02 | Phase 3 | Pending |
| INFRA-03 | Phase 3 | Pending |
| INFRA-04 | Phase 3 | Pending |
| INFRA-05 | Phase 3 | Pending |
| UNIT-01 | Phase 3 | Pending |
| UNIT-02 | Phase 3 | Pending |
| UNIT-03 | Phase 3 | Pending |
| UNIT-04 | Phase 3 | Pending |
| UNIT-05 | Phase 3 | Pending |
| UNIT-06 | Phase 3 | Pending |
| UNIT-07 | Phase 3 | Pending |
| UNIT-08 | Phase 3 | Pending |
| UNIT-09 | Phase 3 | Pending |
| INTG-01 | Phase 3 | Pending |
| INTG-02 | Phase 3 | Pending |
| INTG-03 | Phase 3 | Pending |
| INTG-04 | Phase 3 | Pending |
| INTG-05 | Phase 3 | Pending |
| INTG-06 | Phase 3 | Pending |
| INTG-07 | Phase 3 | Pending |
| INTG-08 | Phase 3 | Pending |
| E2E-01 | Phase 3 | Pending |
| E2E-02 | Phase 3 | Pending |
| E2E-03 | Phase 3 | Pending |
| E2E-04 | Phase 3 | Pending |
| E2E-05 | Phase 3 | Pending |
| E2E-06 | Phase 3 | Pending |
| E2E-07 | Phase 3 | Pending |
| E2E-08 | Phase 3 | Pending |
| E2E-09 | Phase 3 | Pending |
| QUAL-01 | Phase 3 | Pending |
| QUAL-02 | Phase 3 | Pending |
| QUAL-03 | Phase 3 | Pending |

**Coverage:**
- v1.1 requirements: 32 total
- Mapped to phases: 32 (placeholder Phase 3, will be updated by roadmapper)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 after initial definition*
