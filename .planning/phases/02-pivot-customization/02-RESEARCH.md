# Phase 2: Pivot Customization - Research

**Researched:** 2026-01-27
**Domain:** React settings UI with dynamic color styling and localStorage persistence
**Confidence:** HIGH

## Summary

This phase adds pivot letter customization to the existing ReadFaster RSVP reader. The implementation extends the current settings system (already using React hooks, localStorage, and TypeScript) to support color selection from preset swatches and toggle control for pivot highlighting.

The codebase already has established patterns that should be followed:
- Settings stored in RSVPSettings interface with localStorage persistence via `useSettings` hook
- SettingsModal component using Tailwind CSS with dark theme styling
- Pivot letter currently styled with hardcoded red color (#FF0000) in globals.css

The standard approach for 2026 React applications combines:
- **CSS custom properties** (CSS variables) for dynamic color values applied via inline styles
- **TypeScript interfaces** extended to include new settings with proper type safety
- **Checkbox** using native HTML input for accessibility, styled with Tailwind
- **Immediate updates** via useState callback that saves to localStorage on change

**Primary recommendation:** Extend existing settings architecture using CSS custom properties for dynamic pivot color, native checkbox for toggle, and inline preview word component that mirrors WordDisplay styling.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.2.0 | UI framework | Already in use, useState/useEffect for settings |
| TypeScript | 5.3.0 | Type safety | Existing codebase uses strict typing for settings |
| Tailwind CSS | 3.4.1 | Styling framework | Already used throughout, utility-first approach |
| Next.js | 14.2.0 | App framework | Project framework, provides SSR considerations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| localStorage API | Native | Persistence | Already used via storage.ts utilities |
| CSS Custom Properties | Native | Dynamic colors | Standard 2026 pattern for runtime color changes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS variables | Inline color styles only | CSS vars better for cascade and reusability |
| Custom checkbox | Native input[type=checkbox] | Custom requires more ARIA attributes, less accessible |
| useState only | useReducer | useState sufficient for simple toggle/color state |

**Installation:**
```bash
# No new dependencies needed - use existing stack
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── types/index.ts           # Extend RSVPSettings interface
├── utils/storage.ts         # Already handles settings persistence
├── hooks/useSettings.ts     # Already provides updateSettings callback
├── components/
│   └── SettingsModal.tsx    # Add new section after existing settings
└── app/
    └── globals.css          # Replace .pivot hardcoded color with CSS var
```

### Pattern 1: Extend TypeScript Settings Interface
**What:** Add pivotColor and showPivotHighlight to RSVPSettings type
**When to use:** Before implementing any UI - ensures type safety
**Example:**
```typescript
// src/types/index.ts
export interface RSVPSettings {
  fontFamily: 'monospace' | 'serif' | 'sans';
  fontWeight: 'normal' | 'medium' | 'bold';
  fontSize: 'small' | 'medium' | 'large';
  // Add pivot customization
  pivotColor: string;          // Hex color value
  showPivotHighlight: boolean; // Toggle state
}

export const DEFAULT_SETTINGS: RSVPSettings = {
  fontFamily: 'monospace',
  fontWeight: 'medium',
  fontSize: 'medium',
  pivotColor: '#FF0000',       // Red default
  showPivotHighlight: true,    // On by default
};
```

### Pattern 2: CSS Custom Properties for Dynamic Colors
**What:** Use CSS variable set via inline style to control pivot color
**When to use:** When color needs to change at runtime based on user selection
**Example:**
```typescript
// In WordDisplay or parent component, set CSS variable
<div style={{ '--pivot-color': settings.pivotColor } as React.CSSProperties}>
  <span className="pivot">{pivot}</span>
</div>
```
```css
/* globals.css - use CSS variable instead of hardcoded color */
.word-display .pivot {
  color: var(--pivot-color, #FF0000);
  font-weight: bold;
}

/* When highlighting is off, pivot uses same color as other text */
.word-display.no-highlight .pivot {
  color: #ffffff;
  font-weight: 500; /* Match word-display weight */
}
```

Source: [CSS Custom Properties in React](https://www.c-sharpcorner.com/article/css-custom-properties-css-variables-in-react/), [Dynamic Colors in React & Tailwind](https://medium.com/@hridoycodev/beyond-hardcoding-3-ways-to-handle-dynamic-colors-in-react-tailwind-css-d397fb1ef80a)

### Pattern 3: Native Checkbox with Tailwind Styling
**What:** Use native HTML checkbox with label, styled to match existing UI
**When to use:** For toggle controls - provides built-in accessibility
**Example:**
```typescript
// SettingsModal.tsx - Pivot Highlight section
<div>
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={settings.showPivotHighlight}
      onChange={(e) => onUpdate({ showPivotHighlight: e.target.checked })}
      className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary focus:ring-2"
    />
    <span className="text-sm font-medium">Show pivot highlight</span>
  </label>
</div>
```

Source: [React Checkbox Accessibility](https://react-spectrum.adobe.com/react-aria/useCheckbox.html), [Accessible Checkboxes](https://medium.com/@katr.zaks/how-to-build-an-accessible-checkbox-in-react-using-only-divs-and-aria-967ff72a0361)

### Pattern 4: Color Swatches with Selected State
**What:** Horizontal row of clickable color divs with checkmark overlay on selected
**When to use:** For preset color selection from limited palette
**Example:**
```typescript
// SettingsModal.tsx
const PRESET_COLORS = [
  '#FF0000', // Red (default)
  '#FF6B00', // Orange
  '#FFD700', // Gold
  '#00FF00', // Green
  '#0099FF', // Blue
  '#9D00FF', // Purple
];

// In JSX
<div className="flex gap-2">
  {PRESET_COLORS.map((color) => (
    <button
      key={color}
      onClick={() => onUpdate({ pivotColor: color })}
      disabled={!settings.showPivotHighlight}
      className={`relative w-10 h-10 rounded-lg border-2 transition-all ${
        !settings.showPivotHighlight
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer hover:scale-110'
      } ${
        settings.pivotColor === color
          ? 'border-white'
          : 'border-white/20'
      }`}
      style={{ backgroundColor: color }}
    >
      {settings.pivotColor === color && (
        <svg className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  ))}
</div>
```

### Pattern 5: Inline Preview Component
**What:** Sample word showing current pivot style live as user changes settings
**When to use:** For immediate visual feedback in settings modal
**Example:**
```typescript
// Preview component in SettingsModal
<div className="bg-black/40 border border-white/20 rounded-lg p-4 flex justify-center">
  <div
    className={`word-display ${!settings.showPivotHighlight ? 'no-highlight' : ''}`}
    style={{
      '--pivot-color': settings.pivotColor,
      position: 'relative',
      fontSize: '32px'
    } as React.CSSProperties}
  >
    <span className="before-pivot">Read</span>
    <span className="pivot">F</span>
    <span className="after-pivot">aster</span>
  </div>
</div>
```

### Pattern 6: Conditional Reset Button Rendering
**What:** Hide reset button when already at default color
**When to use:** To reduce UI clutter and make reset action clearer
**Example:**
```typescript
{settings.pivotColor !== DEFAULT_SETTINGS.pivotColor && (
  <button
    onClick={() => onUpdate({ pivotColor: DEFAULT_SETTINGS.pivotColor })}
    className="text-sm text-white/60 hover:text-white underline"
  >
    Reset to default
  </button>
)}
```

### Anti-Patterns to Avoid
- **Full color picker:** Complexity not worth it for this use case - presets are sufficient and faster
- **Custom checkbox from divs:** Native input provides keyboard nav, screen reader support automatically
- **Separate save button:** Settings already use immediate persistence pattern - don't introduce inconsistency
- **Hardcoded colors in JSX:** Use constant array so palette can be easily modified
- **Class toggling for colors:** CSS variables are cleaner for dynamic color values than generating classes

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Settings persistence | Custom storage wrapper | Existing storage.ts utilities | Already handles errors, SSR checks, type merging |
| Color validation | Regex hex validator | Browser's native color handling | CSS accepts invalid colors gracefully |
| Checkbox accessibility | Custom keyboard handlers | Native checkbox input | Built-in Space/Enter handlers, screen reader support |
| State synchronization | Custom event system | React useState + localStorage | Existing pattern handles sync correctly |

**Key insight:** The codebase already has working patterns for settings (types, hooks, storage, modal UI). Extend rather than rewrite - this reduces bugs and maintains consistency.

## Common Pitfalls

### Pitfall 1: CSS Variable Scope Issues
**What goes wrong:** CSS variable not visible to .pivot element due to scope
**Why it happens:** Variable defined too deeply in DOM tree or not on common ancestor
**How to avoid:** Set variable on word-display element itself or container that wraps it
**Warning signs:** Preview works but actual reading display doesn't show color change

### Pitfall 2: Disabled State Not Obvious
**What goes wrong:** Color swatches appear clickable when toggle is off
**Why it happens:** Disabled styling too subtle or missing
**How to avoid:** Use opacity reduction + cursor-not-allowed, add disabled attribute to prevent clicks
**Warning signs:** User clicks swatches when highlighting is off and expects change

### Pitfall 3: Type Safety Lost on Settings Update
**What goes wrong:** TypeScript doesn't catch invalid property names in onUpdate calls
**Why it happens:** Partial<RSVPSettings> allows any subset but doesn't validate keys
**How to avoid:** Use TypeScript strict mode, verify autocomplete works in IDE
**Warning signs:** Runtime errors when settings key is misspelled

### Pitfall 4: Flash of Wrong Color on Load
**What goes wrong:** Red pivot briefly shows before user's saved color applies
**Why it happens:** CSS loads with default before React hydrates and sets custom property
**How to avoid:** Use CSS variable with fallback: `var(--pivot-color, #FF0000)` ensures consistent behavior
**Warning signs:** Visible flash when page loads for users with custom colors

### Pitfall 5: Reset Button Resets Toggle State
**What goes wrong:** User clicks "Reset" expecting color reset but toggle also resets
**Why it happens:** Reset button calls `onUpdate({ pivotColor: DEFAULT, showPivotHighlight: DEFAULT })`
**How to avoid:** Reset button should ONLY reset color: `onUpdate({ pivotColor: DEFAULT_SETTINGS.pivotColor })`
**Warning signs:** User decision says "reset color only, not toggle state"

### Pitfall 6: Preview Doesn't Match Actual Display
**What goes wrong:** Preview shows different styling than actual word display during reading
**Why it happens:** Preview uses different CSS classes or inline styles than WordDisplay
**How to avoid:** Preview must use identical .word-display class and CSS variable approach
**Warning signs:** User sets color in preview, starts reading, sees different appearance

## Code Examples

Verified patterns from codebase analysis and official sources:

### Extending Settings Type (TypeScript)
```typescript
// src/types/index.ts - Add to existing interface
export interface RSVPSettings {
  // Existing settings...
  fontFamily: 'monospace' | 'serif' | 'sans';
  fontWeight: 'normal' | 'medium' | 'bold';
  fontSize: 'small' | 'medium' | 'large';

  // NEW: Pivot customization
  pivotColor: string;          // Hex color e.g. '#FF0000'
  showPivotHighlight: boolean; // True = show highlight, false = no distinction
}

export const DEFAULT_SETTINGS: RSVPSettings = {
  fontFamily: 'monospace',
  fontWeight: 'medium',
  fontSize: 'medium',
  pivotColor: '#FF0000',       // Red default per user decision
  showPivotHighlight: true,    // On by default
};
```

### CSS Variable Integration (CSS + TypeScript)
```css
/* src/app/globals.css - Update existing .pivot style */
.word-display .pivot {
  color: var(--pivot-color, #FF0000);
  font-weight: bold;
}

/* NEW: Style when highlighting is disabled */
.word-display.no-highlight .pivot {
  color: #ffffff; /* Same as .before-pivot and .after-pivot */
  font-weight: 500; /* Match .word-display base weight */
}
```

```typescript
// src/components/WordDisplay.tsx - Apply CSS variable and conditional class
export function WordDisplay({ word, containerRef, onPause }: WordDisplayProps) {
  // ... existing logic ...

  const { before, pivot, after } = splitWordByPivot(word);

  return (
    <div
      className={`word-display cursor-pointer ${!settings.showPivotHighlight ? 'no-highlight' : ''}`}
      style={{
        left: offset !== null ? `${offset}px` : '50%',
        transform: offset === null ? 'translateX(-50%)' : 'none',
        '--pivot-color': settings.pivotColor
      } as React.CSSProperties}
      // ... existing handlers ...
    >
      <span className="before-pivot">{before}</span>
      <span className="pivot">{pivot}</span>
      <span className="after-pivot">{after}</span>
    </div>
  );
}
```

### Settings Modal Section (React + Tailwind)
```typescript
// src/components/SettingsModal.tsx - Add after existing font settings

const PRESET_COLORS = [
  '#FF0000', // Red
  '#FF6B00', // Orange
  '#FFD700', // Gold
  '#00FF00', // Green
  '#0099FF', // Blue
  '#9D00FF', // Purple
];

// Inside SettingsModal component JSX, after Font Size section:

{/* Pivot Highlight Section */}
<div>
  <label className="block text-sm font-medium mb-3">Pivot Highlight</label>

  {/* Toggle Checkbox */}
  <label className="flex items-center gap-2 cursor-pointer mb-3">
    <input
      type="checkbox"
      checked={settings.showPivotHighlight}
      onChange={(e) => onUpdate({ showPivotHighlight: e.target.checked })}
      className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary focus:ring-2"
    />
    <span className="text-sm">Show pivot highlight</span>
  </label>

  {/* Color Swatches */}
  <div className="flex gap-2 mb-3">
    {PRESET_COLORS.map((color) => (
      <button
        key={color}
        onClick={() => onUpdate({ pivotColor: color })}
        disabled={!settings.showPivotHighlight}
        className={`relative w-10 h-10 rounded-lg border-2 transition-all ${
          !settings.showPivotHighlight
            ? 'opacity-40 cursor-not-allowed'
            : 'cursor-pointer hover:scale-110'
        } ${
          settings.pivotColor === color
            ? 'border-white'
            : 'border-white/20'
        }`}
        style={{ backgroundColor: color }}
        title={color}
      >
        {settings.pivotColor === color && settings.showPivotHighlight && (
          <svg className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    ))}
  </div>

  {/* Reset Button - Only shown when not default color */}
  {settings.pivotColor !== DEFAULT_SETTINGS.pivotColor && (
    <button
      onClick={() => onUpdate({ pivotColor: DEFAULT_SETTINGS.pivotColor })}
      className="text-sm text-white/60 hover:text-white underline"
    >
      Reset to default
    </button>
  )}

  {/* Inline Preview */}
  <div className="bg-black/40 border border-white/20 rounded-lg p-4 mt-3 flex justify-center">
    <div
      className={`word-display ${!settings.showPivotHighlight ? 'no-highlight' : ''}`}
      style={{
        '--pivot-color': settings.pivotColor,
        position: 'relative',
        fontSize: '32px'
      } as React.CSSProperties}
    >
      <span className="before-pivot">Read</span>
      <span className="pivot">F</span>
      <span className="after-pivot">aster</span>
    </div>
  </div>
</div>
```

### Storage Integration (Automatic)
```typescript
// No changes needed to storage.ts or useSettings.ts
// Existing saveSettings/loadSettings already handle new properties via spread operator:
// { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
// This ensures new properties get default values for existing users
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline color styles only | CSS custom properties | 2020+ | Better cascade, easier to override, cleaner React code |
| Custom checkbox components | Native HTML input styled with CSS | 2021+ | Better accessibility out of box, less ARIA required |
| Separate apply/save button | Immediate persistence on change | 2019+ | Reduces friction, matches modern settings UX |
| Class generation per color | CSS variables for dynamic values | 2020+ | No need to purge/safelist in Tailwind, cleaner |

**Deprecated/outdated:**
- **styled-components for simple color changes:** CSS variables + Tailwind utilities are standard now
- **Context API for settings:** For simple apps like this, props + localStorage hook pattern is sufficient
- **localStorage without error handling:** Modern pattern includes try/catch and SSR checks (already in codebase)

## Open Questions

Things that couldn't be fully resolved:

1. **Color choice specifics**
   - What we know: User wants 5-6 vibrant colors, red default
   - What's unclear: Exact hex values for the palette
   - Recommendation: Suggest palette based on color theory (warm/cool mix, high saturation), let user approve in planning phase. Example palette provided in code examples above.

2. **Preview word text**
   - What we know: Should show current pivot style
   - What's unclear: What word to use for preview
   - Recommendation: "ReadFaster" is on-brand and contains pivot letter (F), already used in code example

3. **Disabled swatch interaction feedback**
   - What we know: Swatches should be grayed when toggle is off
   - What's unclear: Should clicks still work or be prevented
   - Recommendation: Prevent clicks (disabled attribute) to avoid confusion - user decision says "disabled/grayed"

## Sources

### Primary (HIGH confidence)
- **Codebase analysis** - Current patterns for settings (types/index.ts, hooks/useSettings.ts, utils/storage.ts, components/SettingsModal.tsx)
- **Codebase analysis** - Current pivot styling (.word-display .pivot in globals.css, WordDisplay component)
- [MDN - CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) - Official CSS variables documentation
- [React Aria - useCheckbox](https://react-spectrum.adobe.com/react-aria/useCheckbox.html) - Adobe's accessible checkbox patterns

### Secondary (MEDIUM confidence)
- [Beyond Hardcoding: Dynamic Colors in React & Tailwind](https://medium.com/@hridoycodev/beyond-hardcoding-3-ways-to-handle-dynamic-colors-in-react-tailwind-css-d397fb1ef80a) - 2026 patterns for dynamic colors
- [CSS Custom Properties in React](https://www.c-sharpcorner.com/article/css-custom-properties-css-variables-in-react/) - Integration patterns
- [Mastering State Persistence with Local Storage in React](https://medium.com/@roman_j/mastering-state-persistence-with-local-storage-in-react-a-complete-guide-1cf3f56ab15c) - Best practices confirmed
- [useLocalStorage - usehooks-ts](https://usehooks-ts.com/react-hook/use-local-storage) - TypeScript patterns for localStorage hooks

### Tertiary (LOW confidence)
- Color palette inspiration from 2026 design trends - exact colors should be validated with user preference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, no new dependencies
- Architecture: HIGH - Clear extension of existing patterns, verified via codebase
- Pitfalls: HIGH - Based on common React/CSS patterns and codebase analysis
- Color palette: MEDIUM - Colors are user's discretion, suggested palette needs approval

**Research date:** 2026-01-27
**Valid until:** 30 days (stable stack, no fast-moving dependencies)
