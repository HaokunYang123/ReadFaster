# Roadmap: ReadFaster Enhancement

## Overview

This roadmap enhances the existing ReadFaster RSVP reader with two user-facing improvements: automatic focus mode activation when reading starts (eliminating manual toggle) and pivot highlight customization (color selection and toggle). These features improve reading immersion and visual personalization.

## Phases

**Phase Numbering:**
- Integer phases (1, 2): Planned milestone work
- Decimal phases (1.1, 1.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Focus Mode Auto-Activation** - Reading automatically enters/exits focus mode
- [ ] **Phase 2: Pivot Customization** - User controls pivot highlight color and visibility

## Phase Details

### Phase 1: Focus Mode Auto-Activation
**Goal**: Reading display automatically enters focus mode on playback start and exits on pause/completion
**Depends on**: Nothing (first phase)
**Requirements**: FOCUS-01, FOCUS-02
**Success Criteria** (what must be TRUE):
  1. When user clicks play, UI automatically hides and only word display is visible
  2. When user pauses reading, full UI returns (controls, settings, library accessible)
  3. When reading completes (reaches end), full UI returns automatically
  4. Focus mode state does not persist to localStorage (auto-behavior, not a setting)
**Plans**: TBD

Plans:
- TBD during phase planning

### Phase 2: Pivot Customization
**Goal**: User can customize pivot letter highlight appearance via settings
**Depends on**: Phase 1
**Requirements**: PIVOT-01, PIVOT-02, PIVOT-03
**Success Criteria** (what must be TRUE):
  1. User can select pivot highlight color from preset swatches in settings modal
  2. Selected color applies immediately to word display pivot letter
  3. User can toggle pivot highlighting on/off via checkbox in settings
  4. When pivot highlighting is off, pivot letter appears same style as rest of word
  5. Both color selection and toggle state persist across browser sessions
**Plans**: TBD

Plans:
- TBD during phase planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Focus Mode Auto-Activation | 0/TBD | Not started | - |
| 2. Pivot Customization | 0/TBD | Not started | - |
