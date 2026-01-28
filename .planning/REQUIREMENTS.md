# Requirements: ReadFaster v1.1

**Defined:** 2026-01-28
**Core Value:** Users can read text faster by focusing on one word at a time with the pivot letter centered and highlighted.

## v1.1 Requirements

Requirements for reliability and testing milestone. Each maps to roadmap phases.

### Infrastructure

- [x] **INFRA-01**: Vitest configured with Next.js 14 and TypeScript support
- [x] **INFRA-02**: React Testing Library installed with jsdom environment
- [ ] **INFRA-03**: Playwright configured for E2E testing
- [x] **INFRA-04**: Test scripts added to package.json (test, test:coverage, test:e2e)
- [ ] **INFRA-05**: GitHub Actions workflow runs tests on PR and push

### Unit Tests

- [x] **UNIT-01**: `tokenize()` tested with various whitespace patterns
- [x] **UNIT-02**: `tokenize()` tested with multi-language text (CJK, RTL, accented)
- [x] **UNIT-03**: `calculatePivotIndex()` tested for words length 0-20+
- [x] **UNIT-04**: `calculatePivotIndex()` tested with CJK characters
- [x] **UNIT-05**: `calculatePivotIndex()` tested with emoji and surrogate pairs
- [x] **UNIT-06**: `splitWordByPivot()` tested across all word types
- [x] **UNIT-07**: `wpmToInterval()` tested for boundary values (100, 1000)
- [x] **UNIT-08**: Edge cases tested: empty string, single char, very long words (100+ chars)
- [x] **UNIT-09**: Storage utilities tested with localStorage mocking

### Integration Tests

- [x] **INTG-01**: `useRSVP` hook tested with fake timers for playback
- [x] **INTG-02**: `useRSVP` hook tested for play/pause/reset state transitions
- [x] **INTG-03**: `useLibrary` hook tested with localStorage persistence
- [x] **INTG-04**: `useSettings` hook tested with default values and updates
- [x] **INTG-05**: `WordDisplay` component renders pivot correctly
- [x] **INTG-06**: `Controls` component handles user interactions
- [x] **INTG-07**: `SettingsModal` component updates settings state
- [x] **INTG-08**: Components tested with multi-language text rendering

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
| INFRA-01 | Phase 3 | Complete |
| INFRA-02 | Phase 3 | Complete |
| INFRA-03 | Phase 5 | Pending |
| INFRA-04 | Phase 3 | Complete |
| INFRA-05 | Phase 5 | Pending |
| UNIT-01 | Phase 3 | Complete |
| UNIT-02 | Phase 3 | Complete |
| UNIT-03 | Phase 3 | Complete |
| UNIT-04 | Phase 3 | Complete |
| UNIT-05 | Phase 3 | Complete |
| UNIT-06 | Phase 3 | Complete |
| UNIT-07 | Phase 3 | Complete |
| UNIT-08 | Phase 3 | Complete |
| UNIT-09 | Phase 3 | Complete |
| INTG-01 | Phase 4 | Complete |
| INTG-02 | Phase 4 | Complete |
| INTG-03 | Phase 4 | Complete |
| INTG-04 | Phase 4 | Complete |
| INTG-05 | Phase 4 | Complete |
| INTG-06 | Phase 4 | Complete |
| INTG-07 | Phase 4 | Complete |
| INTG-08 | Phase 4 | Complete |
| E2E-01 | Phase 5 | Pending |
| E2E-02 | Phase 5 | Pending |
| E2E-03 | Phase 5 | Pending |
| E2E-04 | Phase 5 | Pending |
| E2E-05 | Phase 5 | Pending |
| E2E-06 | Phase 5 | Pending |
| E2E-07 | Phase 5 | Pending |
| E2E-08 | Phase 5 | Pending |
| E2E-09 | Phase 5 | Pending |
| QUAL-01 | Phase 5 | Pending |
| QUAL-02 | Phase 5 | Pending |
| QUAL-03 | Phase 5 | Pending |

**Coverage:**
- v1.1 requirements: 32 total
- Mapped to phases: 32 (Phase 3: 14, Phase 4: 8, Phase 5: 10)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 after Phase 4 completion*
