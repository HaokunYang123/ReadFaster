# Phase 5: E2E Tests & CI/CD - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Critical user workflows validated across browsers with automated CI quality gates. This includes Playwright E2E tests for reading flows, keyboard shortcuts, focus mode, and persistence — plus GitHub Actions pipeline with coverage enforcement. Adding new features or changing app behavior is out of scope.

</domain>

<decisions>
## Implementation Decisions

### E2E test framework
- Playwright as the E2E framework (Microsoft-backed, native multi-browser)
- Headless mode by default (headed mode for debugging)
- Test files organized by user flow: reading-flow.spec.ts, settings.spec.ts, library.spec.ts
- Screenshots on failure only (no video capture)

### Browser coverage
- All three browsers required: Chrome, Firefox, WebKit (Safari)
- Test both desktop and mobile viewport (375px width for mobile)
- Browsers run in parallel for faster CI
- All browsers must pass to merge (no non-blocking browsers)

### CI pipeline design
- GitHub Actions workflow
- Trigger on PR and push to main
- Sequential job structure: Unit/Integration tests run first, E2E only if those pass
- Cache node_modules and Playwright browsers between runs
- Block merge on any test failure

### Coverage enforcement
- 75% minimum overall coverage threshold
- 90%+ for critical paths (rsvp.ts, hooks)
- Text summary report in CI logs (no HTML artifacts)
- Ratchet effect: block merge if coverage drops from baseline

### Claude's Discretion
- Exact Playwright configuration options
- GitHub Actions job naming and structure
- Cache key strategies
- How to define "critical paths" in coverage config

</decisions>

<specifics>
## Specific Ideas

- Sequential CI flow (unit → integration → E2E) provides fast feedback on cheaper tests before running expensive browser tests
- Ratchet effect ensures coverage trends upward over time
- Mobile viewport testing catches responsive issues in focus mode and controls

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-e2e-tests-cicd*
*Context gathered: 2026-01-28*
