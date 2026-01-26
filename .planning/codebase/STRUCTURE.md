# Codebase Structure

**Analysis Date:** 2026-01-26

## Directory Layout

```
ReadFaster/
├── src/                          # Source code root
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   └── fetch-url/        # URL fetching endpoint
│   │   ├── page.tsx              # Main reading interface
│   │   ├── layout.tsx            # Root layout wrapper
│   │   └── globals.css           # Global Tailwind styles
│   ├── components/               # React UI components
│   │   ├── index.ts              # Barrel export
│   │   ├── Controls.tsx          # Playback controls and WPM slider
│   │   ├── FileInput.tsx         # File upload with multi-format support
│   │   ├── Instructions.tsx      # Help and keyboard shortcuts
│   │   ├── Library.tsx           # Saved texts management
│   │   ├── ReaderDisplay.tsx     # Word display with progress
│   │   ├── SettingsModal.tsx     # Settings dialog
│   │   ├── TextInput.tsx         # Textarea for text input
│   │   ├── UrlInput.tsx          # URL fetch input
│   │   └── WordDisplay.tsx       # ORP word rendering
│   ├── hooks/                    # Custom React hooks
│   │   ├── useLibrary.ts         # Saved texts state and persistence
│   │   ├── useRSVP.ts            # Reading engine and playback control
│   │   └── useSettings.ts        # User settings state and persistence
│   ├── utils/                    # Utility functions
│   │   ├── rsvp.ts               # RSVP algorithm (tokenize, pivot, timing)
│   │   └── storage.ts            # localStorage abstraction
│   └── types/                    # TypeScript type definitions
│       └── index.ts              # All interfaces and constants
├── public/                       # Static assets (favicon, etc.)
├── .planning/                    # GSD planning directory
│   └── codebase/                 # Codebase analysis documents
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── postcss.config.js             # PostCSS configuration
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router routes and layouts
- Contains: Page components, API routes, global styles
- Key files: `page.tsx` (main app), `layout.tsx` (root wrapper), `api/fetch-url/route.ts` (server endpoint)

**`src/components/`:**
- Purpose: Reusable React UI components
- Contains: Presentation components using Tailwind CSS
- Key files: `ReaderDisplay.tsx` (word viewer), `Controls.tsx` (buttons and WPM), `FileInput.tsx` (multi-format file support)

**`src/hooks/`:**
- Purpose: Custom React hooks encapsulating stateful logic
- Contains: Reading engine (`useRSVP`), persistence (`useLibrary`, `useSettings`)
- Key files: `useRSVP.ts` (core reading state machine), `useLibrary.ts` (text library management)

**`src/utils/`:**
- Purpose: Pure utility functions and abstractions
- Contains: RSVP algorithm, storage operations
- Key files: `rsvp.ts` (tokenization and pivot calculations), `storage.ts` (localStorage wrapper)

**`src/types/`:**
- Purpose: Centralized TypeScript type definitions
- Contains: Interfaces for state, props, and data models
- Key files: `index.ts` (RSVPState, SavedText, RSVPSettings, etc.)

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Main application component, orchestrates all features
- `src/app/layout.tsx`: Root HTML and metadata setup
- `src/app/api/fetch-url/route.ts`: Server-side URL fetching endpoint

**Configuration:**
- `tsconfig.json`: TypeScript compiler options with `@/*` path alias to `src/`
- `tailwind.config.ts`: Tailwind CSS theme with custom colors (primary, dark theme)
- `next.config.js`: Next.js build configuration
- `package.json`: Dependencies (React, Next.js, pdfjs-dist, tesseract.js, jszip)

**Core Logic:**
- `src/utils/rsvp.ts`: RSVP algorithm (tokenize, pivot calculation, timing)
- `src/hooks/useRSVP.ts`: Reading state machine and playback control
- `src/utils/storage.ts`: Local storage persistence with error handling

**Testing:**
- No test files present in codebase

## Naming Conventions

**Files:**
- Components: PascalCase with `.tsx` extension (e.g., `ReaderDisplay.tsx`, `TextInput.tsx`)
- Hooks: camelCase with `use` prefix and `.ts` extension (e.g., `useRSVP.ts`, `useLibrary.ts`)
- Utils: camelCase with `.ts` extension (e.g., `rsvp.ts`, `storage.ts`)
- Routes: kebab-case in directory structure (e.g., `fetch-url/route.ts`)

**Directories:**
- Feature directories: lowercase plural (e.g., `components/`, `hooks/`, `utils/`)
- Next.js routes: kebab-case (e.g., `api/fetch-url/`)

**TypeScript Identifiers:**
- Interfaces: PascalCase (e.g., `RSVPState`, `SavedText`, `ControlsProps`)
- Functions: camelCase (e.g., `tokenize()`, `calculatePivotIndex()`, `saveToLibrary()`)
- Constants: UPPER_SNAKE_CASE (e.g., `ORP_POSITION`, `REWIND_AMOUNT`, `SKIP_AMOUNT`)
- React hooks: `use` + camelCase (e.g., `useRSVP`, `useLibrary`)
- Component props: PascalCase + `Props` suffix (e.g., `ControlsProps`, `FileInputProps`)

## Where to Add New Code

**New Feature:**
- Primary code: `src/components/[FeatureName].tsx` for UI, `src/hooks/use[Feature].ts` for state
- Tests: Create `__tests__/` subdirectory (when testing is added)
- Types: Add interface to `src/types/index.ts`

**New Component/Module:**
- Implementation: `src/components/[ComponentName].tsx` following existing patterns
- Export: Add to `src/components/index.ts` barrel file
- Props: Define interface in component file, add to `src/types/index.ts` if shared

**Utilities:**
- Shared helpers: `src/utils/[utility].ts` (use pure functions)
- Helper functions: Keep in utility file, not in components
- Exports: Can be direct from utility file or re-exported from appropriate hook

**API Routes:**
- New endpoints: `src/app/api/[feature]/route.ts`
- Handler function: Export named functions `GET`, `POST`, etc.
- Response: Always return `NextResponse` with appropriate status

## Special Directories

**`src/app/api/`:**
- Purpose: Server-side API routes using Next.js Route Handlers
- Generated: No (hand-written)
- Committed: Yes

**`public/`:**
- Purpose: Static assets served directly (favicon, logos, etc.)
- Generated: No
- Committed: Yes

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents
- Generated: Yes (by GSD mapper)
- Committed: Yes

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes (by `npm run build`)
- Committed: No (in `.gitignore`)

---

*Structure analysis: 2026-01-26*
