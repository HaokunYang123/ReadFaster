# ReadFaster

## What This Is

A speed reading web app using RSVP (Rapid Serial Visual Presentation) that displays words one at a time with the optimal recognition point (pivot letter) highlighted. Users can paste text, upload files (TXT, PDF, ePub, images), or fetch from URLs.

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

### Active

- [ ] Auto-activating focus mode when reading starts (hides all UI except reader)
- [ ] Pivot highlight color selection (preset color swatches)
- [ ] Pivot highlight toggle (on/off)

### Out of Scope

- Full color picker — preset colors sufficient for MVP
- Focus mode as separate toggle setting — replacing with auto-activate behavior

## Context

This is a brownfield project with an existing, functional RSVP reader. The current focus mode exists as a toggle in settings (`focusModeEnabled`) but the user wants it to automatically activate when reading starts. The pivot letter is currently hardcoded red (`#FF0000`) in `globals.css`.

Key files to modify:
- `src/types/index.ts` — add new settings fields
- `src/components/WordDisplay.tsx` — apply dynamic pivot color
- `src/components/SettingsModal.tsx` — add color picker and toggle
- `src/app/page.tsx` — change focus mode to auto-activate
- `src/app/globals.css` — remove hardcoded pivot color

## Constraints

- **Tech stack**: Next.js 14, React 18, TypeScript, Tailwind CSS — existing stack
- **Persistence**: localStorage only — no backend changes
- **Styling**: Follow existing Tailwind patterns and dark theme

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Auto-activate focus mode | Simpler UX, no toggle needed | — Pending |
| Preset colors over color picker | Faster to implement, cleaner UI | — Pending |

---
*Last updated: 2026-01-26 after initialization*
