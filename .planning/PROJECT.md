# ReadFaster

## What This Is

A speed reading web app using RSVP (Rapid Serial Visual Presentation) that displays words one at a time with the optimal recognition point (pivot letter) centered and highlighted. Users can paste text, upload files (TXT, PDF, ePub, images), or fetch from URLs. Reading automatically enters immersive focus mode with customizable pivot highlighting.

## Core Value

Users can read text faster by focusing on one word at a time with the pivot letter centered and highlighted.

## Requirements

### Validated

- ✓ RSVP reading engine with play/pause/reset — existing
- ✓ Word display with pivot letter highlighting (ORP) — existing
- ✓ Adjustable WPM speed (100-1000) — existing
- ✓ Text input via paste — existing
- ✓ File upload (TXT, PDF, ePub, images with OCR) — existing
- ✓ URL fetching with text extraction — existing
- ✓ Settings modal (font family, weight, size) — existing
- ✓ Library for saving/loading texts — existing
- ✓ Keyboard shortcuts (space, arrows) — existing
- ✓ Session persistence — existing
- ✓ Auto-activating focus mode when reading starts — v1.0
- ✓ Pivot highlight color selection (6 preset swatches) — v1.0
- ✓ Pivot highlight toggle (on/off) — v1.0
- ✓ Click-to-pause in focus mode — v1.0
- ✓ 200ms debounced play/pause for smooth transitions — v1.0
- ✓ Enhanced focus mode styling (95% dim, responsive scaling) — v1.0
- ✓ Comprehensive test suite with Vitest (81 unit tests) — v1.1
- ✓ Integration tests for React hooks and components (116 tests) — v1.1
- ✓ E2E tests for critical user workflows (45 tests across 3 browsers) — v1.1
- ✓ Multi-language text handling verified (CJK, RTL, accented, emoji) — v1.1
- ✓ 91%+ test coverage with CI/CD enforcement at 75% threshold — v1.1
- ✓ GitHub Actions pipeline with automated quality gates — v1.1

### Active

(None — awaiting next milestone definition)

### Out of Scope

- Full color picker — preset colors sufficient, simpler UI
- Focus mode as separate toggle setting — replaced by auto-activate behavior
- Custom pivot color input — presets cover common needs

## Context

Shipped v1.1 with 7,276 LOC TypeScript (+17,015 net from v1.0).

**v1.0 enhancements:**
- Focus mode is now derived state (`isPlaying && !isComplete`), not persisted
- CSS variables for pivot theming (`--pivot-color`)
- Settings spread-merge pattern for backward-compatible defaults

**v1.1 additions:**
- 242 total tests (81 unit, 116 integration, 45 E2E)
- 91%+ test coverage with critical paths (rsvp.ts, hooks) at 96-100%
- Vitest + React Testing Library + Playwright test stack
- GitHub Actions CI/CD pipeline with coverage enforcement
- Page Object Model pattern for maintainable E2E tests

Tech stack: Next.js 14, React 18, TypeScript, Tailwind CSS, Vitest, Playwright.

## Constraints

- **Tech stack**: Next.js 14, React 18, TypeScript, Tailwind CSS — existing stack
- **Persistence**: localStorage only — no backend changes
- **Styling**: Follow existing Tailwind patterns and dark theme

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Auto-activate focus mode | Simpler UX, no toggle needed | ✓ Good |
| Preset colors over color picker | Faster to implement, cleaner UI | ✓ Good |
| Focus mode as derived state | No persistence needed, simpler logic | ✓ Good |
| CSS variables for pivot theming | Runtime changes without JS recalc | ✓ Good |
| 200ms debounce timeout | Prevents jank while remaining responsive | ✓ Good |
| Click-to-pause exits focus mode | Intuitive escape without dedicated UI | ✓ Good |
| 95% opacity background dim | Provides context without full blackout | ✓ Good |
| 6 vibrant preset colors | High contrast against dark background | ✓ Good |
| .no-highlight class for toggle | Cleaner separation of concerns | ✓ Good |
| Settings auto-pause on open | Ensures modal visibility and accessibility | ✓ Good |
| jsdom environment for tests | Browser API emulation (localStorage, DOM) | ✓ Good |
| Unicode fixture corpus | Comprehensive multi-language test coverage | ✓ Good |
| TestComponent wrapper pattern | Clean hook testing with state exposure | ✓ Good |
| Fake timer helpers | Reliable timing tests with act() wrapper | ✓ Good |
| Page Object Model for E2E | Maintainable, reusable E2E test code | ✓ Good |
| Sequential CI jobs | E2E runs only after unit/integration pass | ✓ Good |
| 75% coverage threshold | Quality gate without diminishing returns | ✓ Good |

---
*Last updated: 2026-01-28 after v1.1 milestone complete*
