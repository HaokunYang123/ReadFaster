# Coding Conventions

**Analysis Date:** 2026-01-26

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Controls.tsx`, `FileInput.tsx`, `WordDisplay.tsx`)
- Utilities: camelCase (e.g., `rsvp.ts`, `storage.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useRSVP.ts`, `useLibrary.ts`, `useSettings.ts`)
- Type definitions: Index files named `index.ts` (e.g., `src/types/index.ts`)
- Exported types: PascalCase interfaces (e.g., `RSVPState`, `SavedText`, `RSVPSettings`)

**Functions:**
- Regular functions: camelCase (e.g., `tokenize()`, `calculatePivotIndex()`, `splitWordByPivot()`)
- React Hooks: camelCase with `use` prefix (e.g., `useRSVP()`, `useLibrary()`, `useSettings()`)
- Callback handlers: camelCase with action prefix (e.g., `handleStart()`, `handleReset()`, `handleClick()`)
- Private/internal functions: camelCase (e.g., `isStorageAvailable()`, `readFile()`, `extractTextFromHtml()`)
- Constants: UPPER_SNAKE_CASE (e.g., `ORP_POSITION = 0.35`, `REWIND_AMOUNT = 5`, `SKIP_AMOUNT = 10`)

**Variables:**
- Local state: camelCase (e.g., `text`, `isPlaying`, `currentIndex`, `words`)
- Boolean flags: camelCase with is/has prefix (e.g., `isPlaying`, `hasWords`, `hasText`, `isComplete`)
- Type state variables: camelCase (e.g., `currentWord`, `pivotIndex`, `totalWords`)
- Configuration objects: camelCase (e.g., `STORAGE_KEYS` as const object)

**Types:**
- Interfaces: PascalCase (e.g., `RSVPState`, `WordDisplayProps`, `ControlsProps`, `UseRSVPReturn`)
- Props interfaces: Component name + `Props` suffix (e.g., `WordDisplayProps`, `ControlsProps`, `FileInputProps`)
- Hook return interfaces: `use` hook name + `Return` suffix (e.g., `UseRSVPReturn`, `UseLibraryReturn`)
- Literal types: Single quotes (e.g., `'monospace' | 'serif' | 'sans'`)

## Code Style

**Formatting:**
- No Prettier config in project; inferred from code:
  - 2-space indentation (seen in JSON and TypeScript)
  - Line length: no explicit limit observed
  - Trailing semicolons: Used consistently
  - Quote style: Single quotes for strings, no explicit jsx-quotes override

**Linting:**
- ESLint with Next.js recommended config: `extends: "next/core-web-vitals"`
- Configured in: `.eslintrc.json`
- Run with: `npm run lint`

**Indentation & Spacing:**
- 2-space indentation throughout (TypeScript, JSX, JSON configs)
- Consistent spacing around operators
- Blank lines separate logical sections (e.g., between functions, between imports and code)

## Import Organization

**Order:**
1. React and Next.js imports (`react`, `next/...`)
2. External dependencies (`jszip`, `pdfjs-dist`, `tesseract.js`)
3. Internal utils (`@/utils/...`)
4. Internal hooks (`@/hooks/...`)
5. Internal components (`@/components`)
6. Internal types (`@/types`)

**Example from `src/app/page.tsx`:**
```typescript
import { useState, useCallback, useEffect } from 'react';
import { useRSVP } from '@/hooks/useRSVP';
import { useSettings } from '@/hooks/useSettings';
import { useLibrary } from '@/hooks/useLibrary';
import {
  TextInput,
  Controls,
  ReaderDisplay,
  Instructions,
  SettingsModal,
  Library,
  UrlInput,
  FileInput,
} from '@/components';
import { SavedText } from '@/types';
```

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- All internal imports use `@/` prefix for absolute paths

## Error Handling

**Patterns:**
- Try-catch blocks with typed error checking: `e instanceof Error ? e.message : 'fallback message'`
- Error state in React: `const [error, setError] = useState('')` pattern
- API errors: Return `NextResponse.json({ error: 'message' }, { status: code })`
- Storage errors: Silent fail with console.error logging (no throw)
- File/Network errors: Set error state for UI display
- Promise errors: Reject with `new Error('message')` for explicit error messages

**Example from `src/components/FileInput.tsx`:**
```typescript
try {
  const text = await readFile(file);
  if (text.trim()) {
    onFileLoad(text);
  } else {
    throw new Error('No text content found in file');
  }
} catch (e) {
  setError(e instanceof Error ? e.message : 'Failed to read file');
} finally {
  setIsLoading(false);
  setLoadingStatus('');
}
```

## Logging

**Framework:** `console` object (native)

**Patterns:**
- `console.error()` for error logging with context: `console.error('Failed to save session:', e)`
- No info/debug/warn logs used in codebase
- Error logging includes operation name and error object
- Client-side errors logged to console; server-side errors in API routes
- Progress logging for long operations via state: `setLoadingStatus('...')`

**Example from `src/utils/storage.ts`:**
```typescript
catch (e) {
  console.error('Failed to save session:', e);
}
```

## Comments

**When to Comment:**
- Function/module headers: JSDoc comments for exported utilities (seen in `src/utils/rsvp.ts`)
- Algorithm explanations: For non-obvious calculations (e.g., ORP position, pivot offset)
- Complex logic: Brief comments explaining RSVP mechanics or file processing steps
- HTML rendering notes: Explaining canvas and DOM manipulation intent

**JSDoc/TSDoc:**
- Used in utility functions and modules
- Format: Block comment with description on next line
- No param/return tags in observed codebase

**Example from `src/utils/rsvp.ts`:**
```typescript
/**
 * RSVP (Rapid Serial Visual Presentation) utility functions
 */

/**
 * Calculate the Optimal Recognition Point (ORP) pivot index
 * The pivot is approximately 35% into the word
 */
export function calculatePivotIndex(word: string): number {
```

## Function Design

**Size:**
- Small, focused functions (50-100 lines typical)
- Longer functions allowed for complex logic: `FileInput.tsx` component handlers ~200 lines
- Hook implementations: 180 lines max with multiple related operations

**Parameters:**
- Props interfaces for component parameters (destructured in signature)
- Typed callback parameters with arrow functions
- Single parameter for data structures (e.g., `SavedSession` object)
- Multiple parameters for simple types (e.g., `calculatePivotOffset(containerWidth, charWidth, pivotIndex)`)

**Return Values:**
- Objects for multiple return values: `{ before, pivot, after, pivotIndex }`
- Typed returns with explicit interface definitions
- Hook returns as single object with all state and handlers: `UseRSVPReturn`
- API routes return `NextResponse.json()` with typed error/data objects

**Example from `src/utils/rsvp.ts`:**
```typescript
export function splitWordByPivot(word: string): {
  before: string;
  pivot: string;
  after: string;
  pivotIndex: number;
} {
  const pivotIndex = calculatePivotIndex(word);

  return {
    before: word.substring(0, pivotIndex),
    pivot: word.charAt(pivotIndex),
    after: word.substring(pivotIndex + 1),
    pivotIndex,
  };
}
```

## Module Design

**Exports:**
- Named exports for utilities: `export function tokenize()`, `export function calculatePivotIndex()`
- Named exports for components: `export function Controls({...})`
- Named exports for hooks: `export function useRSVP():`
- Default export for pages: `export default function Home()`
- Barrel exports in index files: Re-export all components from directory

**Barrel Files:**
- Location: `src/components/index.ts`, `src/types/index.ts`
- Pattern: Group related exports at directory level for cleaner imports
- Example from `src/components/index.ts`:
  ```typescript
  export { WordDisplay } from './WordDisplay';
  export { ReaderDisplay } from './ReaderDisplay';
  export { Controls } from './Controls';
  ```

**Usage:** Import multiple items from barrel file:
```typescript
import {
  TextInput,
  Controls,
  ReaderDisplay,
  Instructions,
  SettingsModal,
  Library,
  UrlInput,
  FileInput,
} from '@/components';
```

## Conditional Rendering

**Pattern:**
- Ternary operators for simple conditions
- Logical AND (`&&`) for conditional rendering
- Classname arrays for CSS class logic (Tailwind)
- Conditional JSX blocks with curly braces for complex logic

**Example from `src/app/page.tsx`:**
```typescript
<div
  className={`transition-opacity duration-300 ${
    isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
  }`}
>
  {/* content */}
</div>
```

## Client Components

**Pattern:**
- Components using React hooks marked with `'use client'` directive
- Server-only logic in API routes (`src/app/api/...`)
- HTML extraction and URL fetching in server route handlers

---

*Convention analysis: 2026-01-26*
