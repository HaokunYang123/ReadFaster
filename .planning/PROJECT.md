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

### Active

**Milestone v1.1: Reliability & Testing**

- [ ] Comprehensive test suite with Vitest
- [ ] Unit tests for all utility functions (rsvp.ts, storage.ts)
- [ ] Integration tests for React components and hooks
- [ ] E2E tests for critical user workflows
- [ ] Multi-language text handling verification (CJK, RTL, accented, emoji)
- [ ] Edge case coverage (empty, single word, very long, special chars)
- [ ] Pivot algorithm validation across all word types

### Out of Scope

- Full color picker — preset colors sufficient, simpler UI
- Focus mode as separate toggle setting — replaced by auto-activate behavior
- Custom pivot color input — presets cover common needs

## Context

Shipped v1.0 with 2,037 LOC TypeScript/CSS. Existing RSVP reader enhanced with:
- Focus mode is now derived state (`isPlaying && !isComplete`), not persisted
- CSS variables for pivot theming (`--pivot-color`)
- Settings spread-merge pattern for backward-compatible defaults

Tech stack: Next.js 14, React 18, TypeScript, Tailwind CSS.

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

---
*Last updated: 2026-01-28 after v1.1 milestone started*
