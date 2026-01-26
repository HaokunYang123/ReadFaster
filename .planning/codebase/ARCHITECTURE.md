# Architecture

**Analysis Date:** 2026-01-26

## Pattern Overview

**Overall:** Modular client-heavy Next.js application with separation of presentation, business logic, and data layers.

**Key Characteristics:**
- Client-side rendering with React hooks for state management
- Layered architecture with clear separation of concerns (components, hooks, utilities, types)
- RSVP (Rapid Serial Visual Presentation) engine as core domain logic
- Local storage-based persistence for user data and settings
- API endpoints for server-side operations (URL fetching)

## Layers

**Presentation Layer:**
- Purpose: UI components and user interactions
- Location: `src/components/`, `src/app/`
- Contains: React components with Tailwind CSS styling
- Depends on: Hooks (state management), types, utils (formatting)
- Used by: Next.js App Router (`src/app/page.tsx`)

**State Management Layer:**
- Purpose: Encapsulates stateful logic using React hooks
- Location: `src/hooks/`
- Contains: `useRSVP`, `useLibrary`, `useSettings`
- Depends on: Utils (storage, RSVP engine)
- Used by: Presentation components

**Business Logic Layer:**
- Purpose: Core RSVP algorithm and data processing
- Location: `src/utils/rsvp.ts`
- Contains: Word tokenization, pivot calculation, WPM conversion
- Depends on: None
- Used by: `useRSVP` hook, `WordDisplay` component

**Persistence Layer:**
- Purpose: Handle local storage and data serialization
- Location: `src/utils/storage.ts`
- Contains: Functions for saving/loading session, library, settings
- Depends on: Types
- Used by: All hooks (`useRSVP`, `useLibrary`, `useSettings`)

**API Layer:**
- Purpose: Server-side operations and external integrations
- Location: `src/app/api/fetch-url/route.ts`
- Contains: URL fetching with HTML text extraction
- Depends on: None
- Used by: `UrlInput` component

**Type Layer:**
- Purpose: Centralized type definitions
- Location: `src/types/index.ts`
- Contains: Interfaces and constants for RSVPState, Settings, SavedText, etc.
- Depends on: None
- Used by: All layers

## Data Flow

**Reading Session Initialization:**

1. User pastes text or uploads file → `TextInput` or `FileInput` updates state
2. `FileInput` processes file (text, PDF with OCR, ePub with zip parsing, images with OCR)
3. Text stored in `page.tsx` state via `setText`
4. User clicks "Start" → calls `useRSVP.start(text)`
5. `useRSVP` tokenizes text via `rsvp.tokenize()` and initializes word array
6. Timer interval (based on WPM) advances through word array

**Word Display Rendering:**

1. `useRSVP` updates `currentIndex` via state setter
2. Current word extracted from word array: `words[currentIndex]`
3. `ReaderDisplay` receives current word and passes to `WordDisplay`
4. `WordDisplay` calculates pivot point using `splitWordByPivot()`
5. Renders word with pivot character (red) centered in view
6. Container center line aligns with pivot for smooth reading

**Settings & Persistence:**

1. User modifies settings in `SettingsModal`
2. `useSettings.updateSettings()` triggered
3. Settings stored via `storage.saveSettings()`
4. Retrieved on page load via `storage.loadSettings()`
5. Stored in localStorage with key `readfaster_settings`

**Library Management:**

1. User saves text with title in `Library` component
2. `useLibrary.saveText()` creates `SavedText` object with metadata
3. Stored via `storage.saveToLibrary()` (max 50 items)
4. User loads saved text → `handleLoadFromLibrary` updates `text` state
5. Delete operation removes from library via `storage.removeFromLibrary()`

**State Management:**

- **Reading state**: Managed by `useRSVP` (words, currentIndex, isPlaying, wpm, etc.)
- **UI state**: Local to `page.tsx` (text, showSettings)
- **Persistent state**: Synced to localStorage via utility functions
- **Settings**: Managed by `useSettings` hook, persisted and merged with defaults
- **Library**: Managed by `useLibrary` hook, loaded on mount

## Key Abstractions

**RSVP Engine:**
- Purpose: Core speed reading algorithm using Optimal Recognition Point (ORP)
- Examples: `src/utils/rsvp.ts` exports `tokenize()`, `calculatePivotIndex()`, `wpmToInterval()`, `splitWordByPivot()`
- Pattern: Pure functions for word processing and timing calculations

**Hooks as State Encapsulation:**
- Purpose: Encapsulate complex stateful logic away from components
- Examples: `useRSVP` (reading control), `useLibrary` (text persistence), `useSettings` (user preferences)
- Pattern: Custom React hooks returning interface with state and callbacks

**File Format Handlers:**
- Purpose: Abstract different file reading implementations
- Examples: `readTextFile()`, `readPdfFile()`, `ocrPdfPages()`, `readImageWithOCR()`, `readEpubFile()` in `FileInput.tsx`
- Pattern: Dynamic imports and async/await for lazy loading of heavy libraries (tesseract.js, pdfjs-dist, jszip)

**Storage Abstraction:**
- Purpose: Decouple persistence implementation from business logic
- Examples: `saveSession()`, `loadLibrary()`, `saveSettings()` in `src/utils/storage.ts`
- Pattern: Utility functions with consistent error handling and graceful fallback

## Entry Points

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: Next.js App Router default route
- Responsibilities: Main application layout, orchestrates all features (reading, library, settings, file input), manages text state, integrates keyboard shortcuts

**Layout/Root:**
- Location: `src/app/layout.tsx`
- Triggers: Next.js App Router for all pages
- Responsibilities: Root HTML structure, metadata configuration, font loading

**API: Fetch URL:**
- Location: `src/app/api/fetch-url/route.ts`
- Triggers: POST request from `UrlInput` component
- Responsibilities: Fetch remote webpage, extract readable text, return text or error

## Error Handling

**Strategy:** Defensive programming with try-catch blocks, error state tracking, and user-friendly fallbacks

**Patterns:**

- **File Reading Errors**: `FileInput.tsx` wraps all operations in try-catch, displays `error` state in UI, resets input for retry
- **Storage Access**: `storage.ts` checks `isStorageAvailable()` before operations, returns null or defaults on failure
- **API Errors**: `fetch-url` route validates input, catches network errors, returns JSON error responses
- **OCR/PDF Fallback**: If PDF text extraction fails (< 50 chars), automatically switches to OCR mode with progress feedback
- **Type Safety**: TypeScript strict mode prevents null/undefined errors in development

## Cross-Cutting Concerns

**Logging:**
- Basic console.error used in storage utilities and API route
- No structured logging framework

**Validation:**
- URL validation in `fetch-url` route using URL constructor
- File type checking via mime type and extension in `FileInput`
- Text emptiness checks before operations

**Authentication:**
- Not applicable - client-side application with no user accounts

**Keyboard Shortcuts:**
- Implemented in `src/app/page.tsx` with event listener handling
- Shortcuts: Space (play/pause), Arrow Left/Right (skip), Arrow Up/Down (speed adjust)
- Prevents default when targeting input/textarea elements

**Focus Mode:**
- Implemented in `src/app/page.tsx` via `settings.focusModeEnabled` and conditional CSS classes
- Hides all UI except reader display when playing
- Uses `fixed` positioning and backdrop for immersive reading

---

*Architecture analysis: 2026-01-26*
