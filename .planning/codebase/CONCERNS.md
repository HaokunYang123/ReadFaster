# Codebase Concerns

**Analysis Date:** 2026-01-26

## Tech Debt

**Untyped PDF parameter in OCR handler:**
- Issue: The `pdf` parameter in `ocrPdfPages` function uses `any` type instead of proper typing
- Files: `src/components/FileInput.tsx` (line 134)
- Impact: Loss of type safety when processing PDF objects; potential runtime errors if pdf.js API changes
- Fix approach: Import and use proper type definitions from `pdfjs-dist` types or create a dedicated interface for PDF page data structure

**Missing error recovery for large PDF processing:**
- Issue: PDF OCR processing is limited to first 20 pages without option to configure limit
- Files: `src/components/FileInput.tsx` (lines 138, 175-176)
- Impact: Users cannot extract text from PDFs larger than 20 pages for OCR fallback; hardcoded limit reduces usability for academic/research content
- Fix approach: Make page limit configurable via settings or allow incremental processing with user control to continue

**Regex-based HTML parsing in URL fetch:**
- Issue: HTML text extraction uses regex patterns for parsing instead of proper DOM parsing library
- Files: `src/app/api/fetch-url/route.ts` (lines 55-113)
- Impact: Brittle extraction that fails on non-standard HTML structures; may miss content in dynamic pages or unusual markup patterns; vulnerable to malformed HTML breaking regex chains
- Fix approach: Use cheerio or jsdom library for proper HTML parsing; implement fallback extraction strategies for content-heavy sites

## Known Bugs

**Duplicate interval setup during WPM change:**
- Symptoms: When changing WPM while playing, old interval is cleared but new interval setup duplicates logic that exists in `startInterval`
- Files: `src/hooks/useRSVP.ts` (lines 114-136)
- Trigger: Change WPM slider while RSVP is actively playing
- Workaround: None; users must pause, change speed, then resume to avoid potential race conditions

**Race condition in ref sync:**
- Symptoms: `currentIndex` state and `indexRef` refs can temporarily get out of sync if operations occur in rapid succession
- Files: `src/hooks/useRSVP.ts` (lines 39-45, 57-66)
- Trigger: Rapid pause/resume/skip operations in sequence
- Workaround: None; timing-dependent bug may not always manifest

## Security Considerations

**Unrestricted URL fetching without timeout:**
- Risk: `/api/fetch-url` route accepts any URL without timeout, allowing potential DoS attacks or indefinite hangs
- Files: `src/app/api/fetch-url/route.ts` (line 20)
- Current mitigation: None
- Recommendations: Add fetch timeout (5-10 seconds), implement request size limits, add URL allowlist/blocklist for internal networks (127.0.0.1, 10.0.0.0/8, etc.), validate content length before processing

**localStorage exposure to XSS:**
- Risk: All user data (library content, settings, session) stored in unencrypted localStorage; vulnerable to XSS attacks or malicious browser extensions
- Files: `src/utils/storage.ts` (entire file)
- Current mitigation: No validation on stored data before retrieval; no encryption
- Recommendations: Implement input sanitization on all localStorage retrieval, consider localStorage clearing on page unload for sensitive data, add JSON schema validation, implement content security policy

**No CSRF protection on fetch-url endpoint:**
- Risk: POST endpoint has no CSRF token validation, allowing cross-site attacks to fetch arbitrary URLs
- Files: `src/app/api/fetch-url/route.ts` (lines 3-5)
- Current mitigation: None
- Recommendations: Add CSRF token validation using Next.js middleware or headers

**HTML entity decoding without limits:**
- Risk: `extractTextFromHtml` decodes unlimited HTML entities; potential for entity expansion attacks or memory exhaustion
- Files: `src/app/api/fetch-url/route.ts` (lines 88-101)
- Current mitigation: No limits on entity count or decoded size
- Recommendations: Limit total decoded text size, implement entity count limits, use library with built-in attack prevention

## Performance Bottlenecks

**OCR on large images blocks main thread:**
- Problem: Tesseract.js OCR runs on main thread; processing large images freezes UI
- Files: `src/components/FileInput.tsx` (lines 78-92)
- Cause: No Web Worker implementation; synchronous canvas rendering for PDFs
- Improvement path: Move OCR processing to Web Worker, implement progressive processing with status updates, add user abort option

**Full PDF page rendering for OCR fallback:**
- Problem: All 20 PDF pages are rendered to canvas at scale 2.0 before OCR; memory intensive for large PDFs
- Files: `src/components/FileInput.tsx` (lines 138-180)
- Cause: Scale 2.0 for quality increases canvas memory usage 4x; rendering all pages sequentially without optimization
- Improvement path: Implement adaptive scaling based on image quality, use offscreen canvas, implement memory pooling, process pages in parallel with limit

**Library state reloads entire array on every save:**
- Problem: Saving new item to library loads entire library from storage, modifies, saves back
- Files: `src/hooks/useLibrary.ts` (lines 27-40) and `src/utils/storage.ts` (lines 72-91)
- Cause: No differential updates; full array serialization/deserialization on each operation
- Improvement path: Implement append-only operations, use IndexedDB for better performance with large libraries, implement local cache invalidation

**No pagination or virtualization for library display:**
- Problem: Library renders all 50 items at once in scrollable div; 50+ items will cause layout thrashing
- Files: `src/components/Library.tsx` (lines 94-124)
- Cause: Simple array map without windowing
- Improvement path: Implement virtual scrolling with react-window, add pagination with page size control, lazy load thumbnails

## Fragile Areas

**FileInput component handles too many file types:**
- Files: `src/components/FileInput.tsx` (entire file: 241 lines)
- Why fragile: Single component handles TXT, PDF, EPUB, and images; each format has different error modes and processing requirements; changes to one format risk breaking others
- Safe modification: Extract file type handlers into separate utility modules (pdfHandler.ts, epubHandler.ts, ocrHandler.ts), create factory pattern for format detection, add integration tests per format
- Test coverage: No test coverage; logic cannot be verified without manual file testing

**useRSVP hook manages complex timing state:**
- Files: `src/hooks/useRSVP.ts` (entire file: 180 lines)
- Why fragile: Multiple refs, state, and effects managing interval timing; pause/resume/setWpm logic interacts in non-obvious ways; WPM changes mid-play recreate interval with inline code duplication
- Safe modification: Extract interval management into separate custom hook, separate WPM timing calculations from state management, create comprehensive unit tests for state transitions
- Test coverage: No test coverage; timing-dependent behavior is untestable without mocking

**Storage utility silent failures:**
- Files: `src/utils/storage.ts` (entire file: 147 lines)
- Why fragile: All functions catch errors and silently fail with console.error; callers don't know if operation succeeded; no way to handle storage quota exceeded gracefully
- Safe modification: Return success/failure boolean from all functions, throw specific error types (StorageUnavailableError, QuotaExceededError), add error callback to hooks
- Test coverage: No test coverage; error paths are invisible in production

**HTML extraction regex chains:**
- Files: `src/app/api/fetch-url/route.ts` (lines 55-113)
- Why fragile: Multiple sequential regex replacements that assume specific HTML structure; breaking one regex can cascade failures; no validation that content remains meaningful after extraction
- Safe modification: Use proper HTML parser library, implement fallback extraction strategies, add content quality checks, test against real websites
- Test coverage: No test coverage; only works for tested HTML patterns

## Scaling Limits

**localStorage size limit for library:**
- Current capacity: Typically 5-10MB on modern browsers; with average 5KB per SavedText, supports ~1000 items but limited to 50 in code
- Limit: As library grows beyond 50 items or if individual texts exceed 100KB, localStorage quota exhaustion will silently fail
- Scaling path: Migrate to IndexedDB for projects >50 items, implement automatic cleanup of oldest items, compress stored text, add quota monitoring

**Session recovery limited to 7 days:**
- Current capacity: Only one session can be saved at `readfaster_session` key
- Limit: Users cannot maintain multiple reading sessions; session older than 7 days is lost
- Scaling path: Implement session history with multiple session storage, use IndexedDB for better multi-session support, add session tagging and recovery UI

**OCR processing sequential for multi-page documents:**
- Current capacity: 20-page limit for scanned PDF OCR; single Tesseract instance processes sequentially
- Limit: Large scanned documents (>20 pages) will have text cutoff; processing time is O(n) with no parallelization
- Scaling path: Implement worker pool for parallel page processing, add streaming OCR with user-controlled page selection, implement progressive loading with output buffer

## Dependencies at Risk

**tesseract.js without version constraint:**
- Risk: Latest versions (^7.0.0) may introduce breaking changes or memory leaks; no security audits visible; library adds 2.5MB to bundle
- Impact: OCR feature may fail after npm update; bundle size increases load time for users not using OCR
- Migration plan: Lock version to specific stable release, implement dynamic import bundling to split OCR code, consider server-side OCR alternative (cloud API)

**pdfjs-dist with external worker dependency:**
- Risk: CDN dependency for worker (`//cdnjs.cloudflare.com`) creates external point of failure; no CORS error handling if CDN fails
- Impact: PDF processing will fail silently if CDN is unreachable or slow
- Migration plan: Bundle worker locally instead of CDN, implement fallback worker source, add error handling for worker loading failure

**jszip without integrity checks:**
- Risk: Used for EPUB parsing but zip file handling has no validation; malformed EPUB files could cause crashes or memory exhaustion
- Impact: Uploading corrupt EPUB files will cause graceful degradation but no helpful error message
- Migration plan: Add zip file validation, implement file size limits, add EPUB structure validation

## Missing Critical Features

**No test suite:**
- Problem: Zero test coverage across entire codebase; no way to verify refactoring safety or catch regressions
- Blocks: Confident refactoring of complex hooks, safe dependency upgrades, validation of edge cases in file processing
- Priority: High - blocks ability to improve fragile areas safely

**No error boundary for component failures:**
- Problem: Component errors bubble up and crash entire app; no graceful fallback UI
- Blocks: Users cannot recover from component crashes without page refresh
- Priority: High - users may lose unsaved work

**No request cancellation for fetch operations:**
- Problem: Users cannot abort long-running fetch-url or file processing; UI appears frozen
- Blocks: Users trapped in loading state if network is slow or URL is unresponsive
- Priority: Medium - affects user experience but has workaround (page refresh)

**No offline support:**
- Problem: App requires network for URL fetching; cannot work with local files on bad connections
- Blocks: Users cannot use features when offline
- Priority: Low - but feasible to add with Service Worker

## Test Coverage Gaps

**File format handling untested:**
- What's not tested: PDF text extraction, EPUB content parsing, image OCR, error cases for corrupted files
- Files: `src/components/FileInput.tsx` (especially lines 94-220)
- Risk: Any change to PDF/EPUB/OCR logic will break without detection; users discover issues in production
- Priority: High

**API route untested:**
- What's not tested: URL validation, HTML extraction quality, error responses, timeout handling, malformed response handling
- Files: `src/app/api/fetch-url/route.ts`
- Risk: Changes to regex patterns or error handling will break URL fetching without warning
- Priority: High

**Hook state transitions untested:**
- What's not tested: Play/pause/reset sequences, WPM changes during playback, ref synchronization under rapid changes
- Files: `src/hooks/useRSVP.ts`, `src/hooks/useLibrary.ts`, `src/hooks/useSettings.ts`
- Risk: Race conditions and timing bugs invisible; refactoring unsafe
- Priority: High

**Storage operations untested:**
- What's not tested: Quota exceeded scenarios, corrupted localStorage data, concurrent read/write operations
- Files: `src/utils/storage.ts`
- Risk: Silent failures in production; data loss undetected
- Priority: Medium

**Component interaction untested:**
- What's not tested: User workflows (load URL → fetch text → start reading → pause → save to library), modal interactions, keyboard shortcuts
- Files: `src/app/page.tsx`, `src/components/Library.tsx`, `src/components/SettingsModal.tsx`
- Risk: Integration bugs only found during manual testing
- Priority: Medium

---

*Concerns audit: 2026-01-26*
