# Phase 1: Focus Mode Auto-Activation - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Reading display automatically enters focus mode when playback starts and exits when paused or completed. This is a behavior phase — no new UI controls, just automatic state transitions tied to playback.

</domain>

<decisions>
## Implementation Decisions

### Transition Behavior
- Quick fade transitions (~150-200ms) for both entry and exit
- Background dims slightly when entering focus mode (reduces distraction)
- Word display centers in the app container (not full browser viewport)
- Word display size increases ~20% in focus mode for better readability
- App container boundaries respected — not fullscreen browser takeover

### Focus Mode Display
- Word display + thin progress bar at bottom edge
- Progress bar color matches pivot highlight color
- No focus mode indicator badge — the dimmed UI IS the indicator
- No exit hints — trust user knows to click/press space

### Edge Cases
- Settings access while playing: auto-pause first, then exit focus, then open settings
- All keyboard shortcuts work in focus mode (space, arrows, etc.)
- Play at end of text: restart from beginning, enter focus mode
- Clicking word display area: pause and exit focus mode
- Browser resize: stay in focus mode, adapt layout
- Tab switch: keep playing in background, stay in focus on return
- No text loaded: show brief message "Load text first"
- Reading completion: automatically exit to normal UI showing completion state
- Rapid play/pause clicks: debounce (~200ms) to prevent jank
- Mobile/touch: same behavior, tap to pause

### Manual Override
- No way to exit focus mode without pausing — focus mode is tied to playback state
- No setting to disable auto-focus — this IS the product experience
- Speed/WPM adjustment requires pause (exits focus mode)
- Skip forward/backward works in focus mode via keyboard, stays in focus

### Claude's Discretion
- Exact dim/overlay opacity value
- Specific easing curves for transitions
- Progress bar thickness and positioning details
- How "completion state" is displayed in normal UI

</decisions>

<specifics>
## Specific Ideas

No specific references — open to standard approaches that match the existing app aesthetic.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-focus-mode-auto-activation*
*Context gathered: 2026-01-26*
