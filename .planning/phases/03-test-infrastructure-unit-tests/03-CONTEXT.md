# Phase 3: Test Infrastructure & Unit Tests - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish testing foundation with Vitest and achieve complete unit test coverage for RSVP utility functions. This includes test infrastructure setup, utility function tests, multi-language handling tests, edge case coverage, and localStorage mocking for storage utilities. Integration tests (hooks, components) and E2E tests belong to Phases 4 and 5.

</domain>

<decisions>
## Implementation Decisions

### Test organization
- Co-located test files: `rsvp.ts` → `rsvp.test.ts` in same folder
- Group tests by function: `describe('tokenize', ...)` with tests nested inside
- Behavior-focused naming: `it('returns empty array for empty string')` — no "should" prefix
- Shared test utilities in `src/test-utils/` folder for helpers, mocks, fixtures

### Coverage goals
- No coverage enforcement this phase — write thorough tests without gates
- Coverage reports on-demand only: `npm test` runs fast, `npm run test:coverage` for reports
- Text summary in terminal only (no HTML report generation)
- Include everything in coverage calculation (only exclude node_modules)

### Edge case priority
- Thorough empty/null testing: empty string, null, undefined, whitespace-only for each function
- High priority for i18n: CJK, RTL, emoji, accented characters all need dedicated test suites
- Test extreme inputs with limits: 100+ char words, 10k+ word texts to verify no crashes
- Graceful degradation expected: functions return safe defaults (empty array, 0), don't throw

### Claude's Discretion
- Vitest configuration details
- Specific assertion library choices
- Test file naming beyond the `.test.ts` convention
- Order of test implementation

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for Vitest setup and test patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-test-infrastructure-unit-tests*
*Context gathered: 2026-01-28*
