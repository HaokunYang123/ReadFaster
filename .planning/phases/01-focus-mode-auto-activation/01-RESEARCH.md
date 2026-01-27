# Phase 1: Focus Mode Auto-Activation - Research

**Researched:** 2026-01-27
**Domain:** React state-based UI transitions and focus mode patterns
**Confidence:** HIGH

## Summary

This phase implements automatic focus mode activation tied to playback state in a Next.js 14 + React 18 + TypeScript + Tailwind CSS application. The implementation requires state management to coordinate UI visibility with the existing RSVP playback engine, CSS transitions for fade animations, and careful handling of edge cases around rapid state changes and keyboard events.

The existing codebase already has a `focusModeEnabled` setting in the settings interface and basic conditional rendering at line 126 of `page.tsx` (`const isFocusMode = isPlaying && settings.focusModeEnabled`). The phase will change this logic to auto-activate based solely on playback state, removing the user-controlled toggle.

Key implementation areas:
1. **State Management**: Coordinate `isPlaying` state from `useRSVP` hook with UI visibility
2. **CSS Transitions**: Use GPU-accelerated opacity and transform properties with Tailwind's transition utilities
3. **Edge Case Handling**: Debounce rapid play/pause clicks, handle word display interactions, manage keyboard events during focus mode
4. **Accessibility**: Respect `prefers-reduced-motion` for users with vestibular disorders

**Primary recommendation:** Use React's conditional rendering with Tailwind CSS transition classes for fade effects. Leverage existing `isPlaying` state, add debouncing to prevent jank, and implement click handlers on word display for pause functionality.

## Standard Stack

The existing application stack fully supports this implementation with no additional dependencies required.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.2.0 | UI state management | Current stable version, excellent hooks support for state transitions |
| Next.js | 14.2.0 | Framework | App router with client components, SSR support |
| TypeScript | 5.3.0 | Type safety | Prevents runtime errors in state management |
| Tailwind CSS | 3.4.1 | Styling/transitions | Built-in transition utilities, GPU-accelerated transforms |

### Supporting
No additional libraries needed. The implementation uses:
- React hooks (`useState`, `useEffect`, `useCallback`) for state management
- Tailwind transition utilities (`transition-opacity`, `transition-all`, `duration-*`)
- Native browser APIs (keyboard events, media queries)

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind transitions | Framer Motion | Overkill for simple fade effects, adds 50KB+ bundle size |
| React state | Zustand/Redux | Unnecessary complexity for single state coordination |
| CSS transitions | React Spring | More complex API, not needed for opacity/transform |

**Installation:**
No new packages required.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── page.tsx              # Main component - modify focus mode logic
├── hooks/
│   └── useRSVP.ts            # Existing playback state - no changes needed
│   └── useSettings.ts        # Remove focusModeEnabled setting
├── components/
│   ├── WordDisplay.tsx       # Add click handler for pause
│   └── ReaderDisplay.tsx     # May need size adjustments for focus mode
├── types/
│   └── index.ts              # Remove focusModeEnabled from RSVPSettings
└── app/
    └── globals.css           # Add debounce delay if needed via CSS
```

### Pattern 1: State-Driven Conditional Rendering
**What:** Use React state to control UI visibility with CSS transitions
**When to use:** For focus mode entry/exit based on playback state
**Example:**
```tsx
// Source: Existing pattern in page.tsx (line 126)
const isFocusMode = isPlaying; // Changed from: isPlaying && settings.focusModeEnabled

// Conditional rendering with Tailwind transitions
<div
  className={`transition-opacity duration-200 ${
    isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
  }`}
>
  {/* UI elements to hide */}
</div>
```

### Pattern 2: GPU-Accelerated Transitions
**What:** Use CSS properties that trigger GPU acceleration (opacity, transform)
**When to use:** For smooth fade transitions without layout recalculation
**Example:**
```tsx
// Source: CSS GPU Acceleration best practices (https://www.lexo.ch/blog/2025/01/boost-css-performance-with-will-change-and-transform-translate3d-why-gpu-acceleration-matters/)
<div
  className={`transition-all duration-200 ${
    isFocusMode
      ? 'fixed inset-0 z-40 flex items-center justify-center bg-dark/95'
      : ''
  }`}
>
  {/* Focus mode content with scale transform */}
  <div className={isFocusMode ? 'scale-125' : 'scale-100'}>
    <WordDisplay />
  </div>
</div>
```

### Pattern 3: Debounced Event Handlers
**What:** Prevent rapid state changes from causing jank or race conditions
**When to use:** For play/pause button clicks and keyboard events
**Example:**
```tsx
// Source: React debouncing patterns (https://www.developerway.com/posts/debouncing-in-react)
const [isDebouncing, setIsDebouncing] = useState(false);

const handlePlayPause = useCallback(() => {
  if (isDebouncing) return;

  setIsDebouncing(true);
  setTimeout(() => setIsDebouncing(false), 200);

  if (isPlaying) {
    pause();
  } else {
    start(text);
  }
}, [isDebouncing, isPlaying, pause, start, text]);
```

### Pattern 4: Click-to-Pause on Word Display
**What:** Make word display interactive to pause playback
**When to use:** Allow users to exit focus mode by clicking reading area
**Example:**
```tsx
// Source: React keyboard event handling patterns (https://reactlevelup.com/posts/use-key-press)
export function WordDisplay({ word, containerRef, onPause }: WordDisplayProps) {
  const handleClick = () => {
    if (onPause) {
      onPause();
    }
  };

  return (
    <div
      className="word-display cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {/* Word content */}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Modifying layout properties during transitions**: Avoid changing `height`, `width`, `padding`, or `margin` during focus mode transitions - causes expensive layout recalculations. Use `opacity` and `transform` only.
- **Creating new debounced functions on each render**: Without `useCallback`, debounce timers reset on every render, defeating the purpose. Always memoize debounced handlers.
- **Animating many properties at once**: Using `transition-all` on elements with many CSS properties can cause performance issues. Be specific: `transition-opacity duration-200`.
- **Not checking `isPlaying` state before operations**: Edge cases like "play at end" or "rapid clicks" require state checks before executing actions.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reduced motion detection | Custom media query listener with useState | Tailwind's `motion-reduce:` prefix | Built-in, no JS needed, respects OS settings |
| Debouncing logic | Custom setTimeout/clearTimeout wrappers | Simple useState + useCallback pattern | Easy to get wrong with closures, race conditions |
| Focus mode layout | Complex positioning calculations | Tailwind's `fixed inset-0 flex items-center justify-center` | Battle-tested, responsive, no manual math |
| Keyboard event filtering | Custom event.target checks | Existing pattern in page.tsx lines 81-86 | Already handles input/textarea exclusion |

**Key insight:** The existing codebase already has robust patterns for keyboard shortcuts, state management, and conditional rendering. Don't reinvent - extend what's there. The most complex part (RSVP engine with keyboard support) is already implemented.

## Common Pitfalls

### Pitfall 1: Focus Mode Doesn't Exit on Completion
**What goes wrong:** Reading reaches the end, but UI stays hidden because only checking `isPlaying`
**Why it happens:** The `isComplete` state from `useRSVP` isn't factored into focus mode logic
**How to avoid:** Update focus mode condition to: `const isFocusMode = isPlaying && !isComplete`
**Warning signs:** User completes reading and sees nothing but word display with "Complete!" message

### Pitfall 2: Settings Modal Opens While in Focus Mode
**What goes wrong:** User presses settings button (if somehow accessible), modal opens but is invisible under focus mode overlay
**Why it happens:** Focus mode uses `z-40` but modal might need higher z-index, or the header fade makes button non-functional
**How to avoid:** Per CONTEXT.md decisions, settings access should auto-pause first. Wrap settings button click with pause logic.
**Warning signs:** Modal doesn't appear when expected, or appears but is behind dark overlay

### Pitfall 3: Rapid Play/Pause Causes Transition Jank
**What goes wrong:** User rapidly clicks play/pause, causing multiple transition animations to overlap and stutter
**Why it happens:** No debouncing on state transitions, each click triggers immediate re-render mid-transition
**How to avoid:** Add 200ms debounce guard on play/pause handlers to prevent overlapping transitions
**Warning signs:** UI flickers, animations look choppy, multiple transitions visible simultaneously

### Pitfall 4: Word Display Click Doesn't Pause
**What goes wrong:** User clicks word display expecting to pause (per CONTEXT.md), nothing happens
**Why it happens:** WordDisplay component doesn't receive `onPause` callback prop from parent
**How to avoid:** Pass pause function from page.tsx through ReaderDisplay to WordDisplay, wire up click handler
**Warning signs:** Clicking word display has no effect, only space bar works to pause

### Pitfall 5: Focus Mode Persists to localStorage
**What goes wrong:** User's focus mode state saves to localStorage, causing unexpected behavior on reload
**Why it happens:** Settings hook automatically persists all settings changes
**How to avoid:** Don't store focus mode state in settings object - it's purely derived from `isPlaying` state
**Warning signs:** App opens in focus mode on reload, focus mode "sticks" between sessions

### Pitfall 6: Transition Cuts Off Early
**What goes wrong:** Fade transition starts but element disappears before animation completes
**Why it happens:** `pointer-events-none` applied too early, or element removed from DOM during transition
**How to avoid:** Use Tailwind's transition utilities which handle timing automatically: `transition-opacity duration-200`
**Warning signs:** UI blinks instead of fading, no smooth transition visible

### Pitfall 7: Reduced Motion Not Respected
**What goes wrong:** Users with `prefers-reduced-motion` enabled still see fade animations
**Why it happens:** No `motion-reduce:` prefix on transition classes
**How to avoid:** Add `motion-reduce:transition-none` to elements with transitions
**Warning signs:** Accessibility testing fails, vestibular disorder users report discomfort

## Code Examples

Verified patterns from official sources and existing codebase:

### Focus Mode State Logic (Main Implementation)
```tsx
// Source: Existing pattern in page.tsx, modified for auto-activation
// Location: src/app/page.tsx

export default function Home() {
  // ... existing hooks
  const { isPlaying, isComplete, pause, start } = useRSVP();

  // CHANGED: Remove settings.focusModeEnabled check
  const isFocusMode = isPlaying && !isComplete;

  // NEW: Debounce guard for play/pause
  const [isDebouncing, setIsDebouncing] = useState(false);

  const handlePlayPause = useCallback(() => {
    if (isDebouncing) return;
    setIsDebouncing(true);
    setTimeout(() => setIsDebouncing(false), 200);

    if (isPlaying) {
      pause();
    } else if (text.trim()) {
      start(text);
    }
  }, [isDebouncing, isPlaying, text, pause, start]);

  // ... rest of component
}
```

### Conditional Rendering with Transitions
```tsx
// Source: Existing pattern in page.tsx (lines 132-136), enhanced
// Location: src/app/page.tsx

{/* Header - hidden in focus mode */}
<div
  className={`transition-opacity duration-200 motion-reduce:transition-none ${
    isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
  }`}
>
  {/* Library, inputs, controls - all fade out */}
</div>

{/* Reader Display - enhanced in focus mode */}
<div
  className={`transition-all duration-200 motion-reduce:transition-none ${
    isFocusMode
      ? 'fixed inset-0 z-40 flex items-center justify-center bg-dark/95 p-8'
      : ''
  }`}
>
  <div className={`transition-transform duration-200 ${
    isFocusMode ? 'scale-125' : 'scale-100'
  }`}>
    <ReaderDisplay
      word={currentWord}
      current={currentIndex}
      total={totalWords}
      progress={progress}
      isComplete={isComplete}
      onPause={pause}  // NEW: Pass pause handler
    />
  </div>
</div>
```

### Word Display Click Handler
```tsx
// Source: React event handling patterns
// Location: src/components/WordDisplay.tsx

interface WordDisplayProps {
  word: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onPause?: () => void;  // NEW: Optional pause callback
}

export function WordDisplay({ word, containerRef, onPause }: WordDisplayProps) {
  const handleClick = useCallback(() => {
    if (onPause) {
      onPause();
    }
  }, [onPause]);

  return (
    <div
      className="word-display cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Word rendering logic */}
    </div>
  );
}
```

### Settings Button Auto-Pause
```tsx
// Source: Edge case handling from CONTEXT.md
// Location: src/app/page.tsx

<button
  onClick={() => {
    // Auto-pause if playing before opening settings
    if (isPlaying) {
      pause();
    }
    setShowSettings(true);
  }}
  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
  title="Settings"
>
  {/* Settings icon SVG */}
</button>
```

### Keyboard Shortcuts During Focus Mode
```tsx
// Source: Existing implementation (page.tsx lines 78-120)
// NO CHANGES NEEDED - keyboard shortcuts already work correctly
// Space, arrows, etc. all trigger pause/skip which will exit focus mode

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if typing in input/textarea
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (isPlaying) {
          pause();  // This will automatically exit focus mode
        } else if (words.length > 0 && !isComplete) {
          start(text);  // This will automatically enter focus mode
        }
        break;
      // ... other cases work as-is
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isPlaying, isComplete, words.length, text, wpm, pause, start, skipBackward, skipForward, setWpm]);
```

### Progress Bar Styling for Focus Mode
```tsx
// Source: CONTEXT.md decisions (progress bar color matches pivot)
// Location: src/components/ReaderDisplay.tsx

// Extract pivot color from globals.css or Tailwind config
// Current hardcoded red (#FF0000) should match progress bar

<div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-5">
  <div
    className="h-full bg-red-500 transition-all duration-100"  // Match pivot color
    style={{ width: `${progress}%` }}
  />
</div>

// For focus mode: thin bar at bottom
<div className={`${isFocusMode ? 'absolute bottom-0 left-0 right-0' : ''}`}>
  <div className="w-full h-1 bg-white/10 overflow-hidden">
    <div
      className="h-full bg-red-500 transition-all duration-100"
      style={{ width: `${progress}%` }}
    />
  </div>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Class-based state management | React hooks (useState, useEffect) | React 16.8 (2019) | Cleaner, more composable code |
| CSS animations via JS | CSS transitions with Tailwind utilities | Tailwind 2.0+ (2020) | Better performance, smaller bundle |
| Toggle-based focus mode | Auto-activation tied to playback state | 2026 trend | Simpler UX, fewer settings |
| Manual fullscreen API | Element-level focus with fixed positioning | Modern pattern | More control, no permission prompts |
| JavaScript debouncing libraries | useCallback + setTimeout pattern | React 18+ | No external deps, simpler mental model |

**Deprecated/outdated:**
- **ComponentDidMount/Update lifecycle methods**: Use `useEffect` hook instead for side effects
- **Inline style animations**: Use Tailwind transition utilities for declarative, GPU-accelerated animations
- **window.requestAnimationFrame for transitions**: CSS transitions handle this automatically
- **Redux for simple UI state**: React context or local state sufficient for focus mode coordination

## Open Questions

Things that couldn't be fully resolved:

1. **Exact Scale Factor for Word Display in Focus Mode**
   - What we know: CONTEXT.md specifies "~20% increase" (scale-125 = 1.25 = 25% increase)
   - What's unclear: Whether this is optimal for readability vs. causing overflow on smaller screens
   - Recommendation: Start with `scale-125`, test on mobile devices, may need responsive scaling: `scale-110 md:scale-125`

2. **Progress Bar Thickness in Focus Mode**
   - What we know: Should be "thin" at bottom edge, current normal mode uses `h-1.5` (6px)
   - What's unclear: Whether focus mode should be thinner (h-0.5 = 2px) or same thickness
   - Recommendation: Use `h-0.5` (2px) for minimal distraction, matches "thin" description

3. **Background Dim Opacity**
   - What we know: "Background dims slightly" (CONTEXT.md), current uses `bg-dark` solid color
   - What's unclear: Exact opacity value for dimming effect vs. solid dark background
   - Recommendation: Use `bg-dark/95` (95% opacity) to dim without full blackout, creates overlay effect

4. **Mobile Viewport Considerations**
   - What we know: Mobile/touch should work same as desktop with tap to pause
   - What's unclear: Whether `scale-125` on word display causes horizontal scroll on small screens
   - Recommendation: Test thoroughly on 375px (iPhone SE) width, may need: `scale-110 sm:scale-125`

## Sources

### Primary (HIGH confidence)
- **React Official Documentation**: [useTransition Hook](https://react.dev/reference/react/useTransition) - React 18 transition patterns
- **Next.js 14 Documentation**: Verified in package.json, current stable version with app router
- **Tailwind CSS 3.4 Documentation**: Verified in package.json, transition utilities confirmed
- **MDN Web Docs**: [CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Transitions/Using) - Browser API standards
- **MDN Web Docs**: [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) - Updated 2026-01-08
- **Existing Codebase**: `/Users/haokunyang/Downloads/ProJects/ReadFaster/src/app/page.tsx` - Current implementation patterns

### Secondary (MEDIUM confidence)
- [CSS GPU Acceleration Guide](https://www.lexo.ch/blog/2025/01/boost-css-performance-with-will-change-and-transform-translate3d-why-gpu-acceleration-matters/) - GPU optimization techniques
- [React Debouncing Patterns](https://www.developerway.com/posts/debouncing-in-react) - Verified with React 18 patterns
- [Josh Comeau's Transition Guide](https://www.joshwcomeau.com/animation/css-transitions/) - CSS animation best practices
- [React Accessibility: Reduced Motion](https://www.joshwcomeau.com/react/prefers-reduced-motion/) - Implementation patterns

### Tertiary (LOW confidence)
- Various WebSearch results on React state management in 2026 - Multiple sources agree on patterns
- CSS animation trends (https://webpeak.org/blog/css-js-animation-trends/) - General industry trends

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - Verified from package.json and existing code
- Architecture: **HIGH** - Based on existing patterns in codebase + official React/Tailwind docs
- Pitfalls: **HIGH** - Derived from CONTEXT.md edge cases + common React issues

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - stable stack, no fast-moving dependencies)

**Key codebase files analyzed:**
- `/Users/haokunyang/Downloads/ProJects/ReadFaster/src/app/page.tsx` (main component)
- `/Users/haokunyang/Downloads/ProJects/ReadFaster/src/hooks/useRSVP.ts` (playback state)
- `/Users/haokunyang/Downloads/ProJects/ReadFaster/src/components/WordDisplay.tsx` (word rendering)
- `/Users/haokunyang/Downloads/ProJects/ReadFaster/src/types/index.ts` (interfaces)
- `/Users/haokunyang/Downloads/ProJects/ReadFaster/package.json` (dependencies)
- `/Users/haokunyang/Downloads/ProJects/ReadFaster/tailwind.config.ts` (styling config)
